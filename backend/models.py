from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class Summary(BaseModel):
    filename: str
    total_packets: int
    protocol_count: Dict[str, int]
    src_ips: Dict[str, int]
    dst_ips: Dict[str, int]
    tcp_ports: Dict[str, int]
    udp_ports: Dict[str, int]
    http_requests: Dict[str, int]
    dns_queries: Dict[str, int]
    timestamps: List[float]
    
    
class Packet(BaseModel):
    filename: str
    number: int
    timestamp: str
    source: str
    destination: str
    protocol: str
    length: int
    info: str
    layers: Dict[str, Any]
    