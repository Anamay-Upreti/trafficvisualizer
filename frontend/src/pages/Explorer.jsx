import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PacketTable from "../components/explorer/packetTable.jsx";
import PacketDetails from "../components/explorer/packetDetails.jsx";
import toast from "react-hot-toast";

export default function Explorer() {
  const { filename } = useParams();
  const [packets, setPackets] = useState([]);
  const [selectedPacket, setSelectedPacket] = useState(null);
  const [loading, setLoading] = useState(true);

  //  Fetch Packet List
  useEffect(() => {
    if (!filename) return;

    const loadPackets = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/packets/${filename}`);

        if (!res.ok) {
          throw new Error(`Server Error: ${res.status}`);
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          setPackets(data);
        } else {
          console.error("Expected array but got:", data);
          setPackets([]); // Default to empty list to prevent crash
          toast.error("Invalid data format received from backend");
        }
      } catch (e) {
        console.error("Error loading packets", e);
        toast.error("Failed to load packet list");
        setPackets([]);
      } finally {
        setLoading(false);
      }
    };

    loadPackets();
  }, [filename]);

  const handleSelect = async (packetNumber) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/packet_detail/${filename}/${packetNumber}`
      );
      if (!res.ok) throw new Error("Failed to fetch details");

      const data = await res.json();
      setSelectedPacket(data);
    } catch (e) {
      console.error("Error loading details", e);
      toast.error("Could not load packet details");
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-100px)] flex flex-col gap-6">
      <div className="h-[35%] bg-[#07101f] rounded-2xl shadow-xl border border-[#1f2937] overflow-hidden flex flex-col min-h-[300px]">
        <div className="p-3 border-b border-[#1f2937] bg-[#0b1629] flex justify-between items-center">
          <h2 className="font-bold text-sm text-gray-300">
            Packet Capture: <span className="text-white">{filename}</span>
          </h2>
          <span className="text-xs text-gray-500">
            {packets.length} packets loaded
          </span>
        </div>

        {loading ? (
          <div className="grow flex items-center justify-center text-gray-500 animate-pulse">
            Loading packets...
          </div>
        ) : (
          <PacketTable
            packets={packets}
            onSelect={handleSelect}
            selectedId={selectedPacket?.number}
          />
        )}
      </div>

      <div className="grow bg-[#07101f] rounded-2xl shadow-xl border border-[#1f2937] overflow-hidden flex flex-col min-h-[200px]">
        <div className="p-3 border-b border-[#1f2937] bg-[#0b1629]">
          <h2 className="font-bold text-sm text-amber-500">
            Packet Inspection
          </h2>
        </div>
        <div className="grow overflow-hidden p-4">
          <PacketDetails data={selectedPacket} />
        </div>
      </div>
    </div>
  );
}
