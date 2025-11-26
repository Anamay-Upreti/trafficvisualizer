from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import WriteConcern
from concurrent.futures import ThreadPoolExecutor
from parser import parse_and_summarize_pcap 
from database import save_summary, get_summary, packets_col 
import tempfile, shutil, os 
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


fast_packets_col = packets_col.with_options(write_concern=WriteConcern(w=0))

def fast_insert_worker(batch):
    """Inserts without waiting for acknowledgement"""
    if not batch: return
    try:
        fast_packets_col.insert_many(batch, ordered=False)
    except Exception as e:
        print(f"Insert Error: {e}")

@app.post("/upload")
def upload_file(file: UploadFile = File(...)):
    temp_path = None
    try:
        print(f"--- Received file: {file.filename} ---")
        
        # Save to Temp File
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pcap") as tmp:
            shutil.copyfileobj(file.file, tmp)
            temp_path = tmp.name 

        # Parse PCAP
        summary, packets = parse_and_summarize_pcap(temp_path)
        
        if summary is None:
            raise HTTPException(status_code=500, detail="Parsing failed")

        summary["filename"] = file.filename
        
        # Database Cleanup
        print(f"Clearing old data...")
        packets_col.delete_many({"filename": file.filename})

        if packets:
            total_packets = len(packets)
            print(f"Preparing to blast {total_packets} packets into DB...")
            
            for p in packets:
                p["filename"] = file.filename
           
            BATCH_SIZE = 1000
            batches = [packets[i:i + BATCH_SIZE] for i in range(0, total_packets, BATCH_SIZE)]
            
            print(f"Launching 4 parallel threads for {len(batches)} batches (Unacknowledged Mode)...")
            start_time = time.time()
          
            with ThreadPoolExecutor(max_workers=4) as executor:
                list(executor.map(fast_insert_worker, batches))
            
            duration = round(time.time() - start_time, 2)
            print(f"DB Insert finished. Took: {duration} seconds")
        else:
            print("No packets to insert.")

        save_summary(summary)
        
        print("--- Upload Process Complete ---")
        return {"message": "Success", "filename": file.filename}

    except Exception as e:
        print(f"Error processing file: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)


def get_top_k(data_dict, k=10):
    if not data_dict: return {"labels": [], "data": []}
    sorted_items = sorted(data_dict.items(), key=lambda x: x[1], reverse=True)[:k]
    return {"labels": [item[0] for item in sorted_items], "data": [item[1] for item in sorted_items]}

@app.get("/analytics/dns")
def get_dns(filename: str):
    summary = get_summary(filename)
    if not summary: return get_top_k({}) 
    return get_top_k(summary.get("dns_queries", {}))

@app.get("/analytics/protocols")
def get_protocols(filename: str):
    summary = get_summary(filename)
    if not summary: return get_top_k({})
    return get_top_k(summary.get("protocol_count", {}))

@app.get("/analytics/tcp_ports")
def get_tcp(filename: str):
    summary = get_summary(filename)
    if not summary: return get_top_k({})
    return get_top_k(summary.get("tcp_ports", {}))

@app.get("/analytics/udp_ports")
def get_udp(filename: str):
    summary = get_summary(filename)
    if not summary: return get_top_k({})
    return get_top_k(summary.get("udp_ports", {}))

@app.get("/analytics/top_ips")
def get_ips(filename: str):
    summary = get_summary(filename)
    if not summary: return get_top_k({})
    src = summary.get("src_ips", {})
    dst = summary.get("dst_ips", {})
    total = src.copy()
    for k, v in dst.items():
        total[k] = total.get(k, 0) + v
    return get_top_k(total)

@app.get("/analytics/traffic")
def get_traffic(filename: str):
    summary = get_summary(filename)
    if not summary: return {"timestamps": []}
    timestamps = summary.get("timestamps", [])
    return {"timestamps": timestamps}

@app.get("/analytics/websites")
def get_websites(filename: str):
    summary = get_summary(filename)
    if not summary: return get_top_k({})
    return get_top_k(summary.get("http_requests", {}))

@app.get("/analytics/general_stats")
def get_general_stats(filename: str):
    summary = get_summary(filename)
    if not summary: return {"total_packets": 0, "total_bytes": 0, "duration_sec": 0, "unique_ips": 0, "unique_ports": 0}
    timestamps = summary.get("timestamps", [])
    duration = 0
    if timestamps: duration = max(timestamps) - min(timestamps)
    unique_ips = set(summary.get("src_ips", {}).keys()) | set(summary.get("dst_ips", {}).keys())
    unique_ports = set(summary.get("tcp_ports", {}).keys()) | set(summary.get("udp_ports", {}).keys())
    return {
        "total_packets": summary.get("total_packets", 0),
        "total_bytes": summary.get("total_bytes", 0),
        "duration_sec": round(duration, 2),
        "unique_ips": len(unique_ips),
        "unique_ports": len(unique_ports)
    }

@app.get("/packets/{filename}")
def get_packet_list(filename: str, skip: int = 0, limit: int = 1000 ):
    cursor = packets_col.find({"filename": filename}, {"_id": 0, "layers": 0}).sort("number", 1).skip(skip).limit(limit)   
    return list(cursor)

@app.get("/packet_detail/{filename}/{packet_number}")
def get_packet_detail(filename: str, packet_number: int):
    packet = packets_col.find_one({"filename": filename, "number": packet_number}, {"_id": 0}) 
    return packet