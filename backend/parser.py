import subprocess
import os
import sys
from datetime import datetime 

try:
    import orjson as json_parser
    USING_ORJSON = True
except ImportError:
    import json as json_parser
    USING_ORJSON = False
    print("Warning: 'orjson' not found. Using standard 'json'.")

TSHARK_PATH = r"C:\Program Files\Wireshark\tshark.exe"

def parse_and_summarize_pcap(path):
    print(f"--- Started parsing: {path} ---")
    command_executable = [TSHARK_PATH] if os.path.exists(TSHARK_PATH) else ["tshark"]
    command = command_executable + ["-n", "-r", path, "-T", "json"]
    
    output_bytes = None

    try:
        print("Running TShark... (this might take a moment)")
        output_bytes = subprocess.check_output(command, text=False, stderr=subprocess.PIPE)
        print(f"TShark finished. Output size: {len(output_bytes) / 1024 / 1024:.2f} MB")
        
    except Exception as e:
        print(f"Error running tshark: {e}")
        return None, None

    try:
        print("Parsing JSON data...")
        if USING_ORJSON:
            packets_json = json_parser.loads(output_bytes)
        else:
            packets_json = json_parser.loads(output_bytes.decode('utf-8', errors='ignore'))
            
        print(f"JSON parsed. Total packets: {len(packets_json)}")
    except Exception as e:
        print(f"Failed to decode JSON: {e}")
        return None, None

    summary = {
        "total_packets": len(packets_json),
        "total_bytes": 0, "protocol_count": {}, "src_ips": {}, "dst_ips": {}, 
        "tcp_ports": {}, "udp_ports": {}, "http_requests": {}, "dns_queries": {}, 
        "timestamps": []
    }
    
    packets_list = [] 
    number = 1

    for p in packets_json:
        if "_source" not in p or "layers" not in p["_source"]:
            continue
        
        layers = p["_source"]["layers"]
        
        src_addr = "N/A"
        dst_addr = "N/A"
        frame_len = 0
        protocol_key = "UNKNOWN"
        time_val = 0.0

        # Extract Basic Fields 
        if "frame" in layers:
            frame_layer = layers["frame"]
            
            # BYTES
            fl = frame_layer.get("frame.len", 0)
            frame_len = int(fl[0]) if isinstance(fl, list) else int(fl)
            summary["total_bytes"] += frame_len
            
            # TIMESTAMPS 
            ts_raw = frame_layer.get("frame.time_epoch")
            if not ts_raw:
                 ts_raw = frame_layer.get("frame.time")

            if ts_raw:
                val = ts_raw[0] if isinstance(ts_raw, list) else ts_raw
                try:
                    time_val = float(val)
                except ValueError:
                    try:
                        s_val = str(val)
                        if s_val.endswith('Z'):
                            s_val = s_val[:-1] + '+00:00'
                        if '.' in s_val:
                            parts = s_val.split('.')
                            if len(parts[1]) > 6:
                                fraction_and_tz = parts[1]
                                plus_idx = fraction_and_tz.find('+')
                                minus_idx = fraction_and_tz.find('-')
                                tz_idx = plus_idx if plus_idx != -1 else minus_idx
                                
                                if tz_idx != -1:
                                    s_val = parts[0] + '.' + fraction_and_tz[:6] + fraction_and_tz[tz_idx:]
                                else:
                                    s_val = parts[0] + '.' + fraction_and_tz[:6]
                        dt = datetime.fromisoformat(s_val)
                        time_val = dt.timestamp()
                    except Exception as e:
                        if number <= 1: print(f"DEBUG: Failed to parse date string '{val}': {e}")
                        pass
                
                # Success: Add to list
                if time_val > 0:
                    summary["timestamps"].append(time_val)

            # PROTOCOLS
            protos_raw = frame_layer.get("frame.protocols", "")
            if isinstance(protos_raw, list): protos_raw = protos_raw[0]
            protos = protos_raw.split(":")
            if len(protos) > 2:
                protocol_key = protos[-1].upper()
            summary["protocol_count"][protocol_key] = summary["protocol_count"].get(protocol_key, 0) + 1

        # IPs
        if "ip" in layers:
            src = layers["ip"].get("ip.src")
            dst = layers["ip"].get("ip.dst")
            if isinstance(src, list): src = src[0]
            if isinstance(dst, list): dst = dst[0]
            if src: 
                summary["src_ips"][src] = summary["src_ips"].get(src, 0) + 1
                src_addr = src
            if dst: 
                summary["dst_ips"][dst] = summary["dst_ips"].get(dst, 0) + 1
                dst_addr = dst
        elif "ipv6" in layers:
            src = layers["ipv6"].get("ipv6.src")
            dst = layers["ipv6"].get("ipv6.dst")
            if isinstance(src, list): src = src[0]
            if isinstance(dst, list): dst = dst[0]
            if src: src_addr = src
            if dst: dst_addr = dst

        # PORTS
        if "tcp" in layers:
            dport = layers["tcp"].get("tcp.dstport")
            if dport: 
                d = str(dport[0]) if isinstance(dport, list) else str(dport)
                summary["tcp_ports"][d] = summary["tcp_ports"].get(d, 0) + 1
        if "udp" in layers:
            dport = layers["udp"].get("udp.dstport")
            if dport: 
                d = str(dport[0]) if isinstance(dport, list) else str(dport)
                summary["udp_ports"][d] = summary["udp_ports"].get(d, 0) + 1

        # APP LAYER
        if "dns" in layers:
             queries = layers["dns"].get("dns.qry.name")
             if queries:
                 q_list = queries if isinstance(queries, list) else [queries]
                 for q in q_list: summary["dns_queries"][q] = summary["dns_queries"].get(q, 0) + 1

        if "http" in layers:
             host = layers["http"].get("http.host")
             if host:
                 h_list = host if isinstance(host, list) else [host]
                 for h in h_list: summary["http_requests"][h] = summary["http_requests"].get(h, 0) + 1

        #  Build Packet Object 
        packet_entry = {
            "number": number,
            "timestamp": str(time_val),
            "source": src_addr,
            "destination": dst_addr,
            "protocol": protocol_key,
            "length": frame_len,
            "info": protocol_key,
            "layers": layers
        }
        packets_list.append(packet_entry)
        number += 1

    print(f"Parsing complete. Found {len(summary['timestamps'])} timestamps.")
    return summary, packets_list