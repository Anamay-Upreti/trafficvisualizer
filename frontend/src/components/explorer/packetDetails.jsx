import { FaNetworkWired, FaGlobe } from "react-icons/fa";

export default function PacketDetails({ data }) {
  if (!data) return <div className="text-gray-500 p-10 text-center flex items-center justify-center h-full">Select a packet to inspect details.</div>;


  const renderTree = (obj, depth = 0) => {
 
    if (!obj || typeof obj !== 'object') return null;

    return Object.entries(obj).map(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        return (
          <div key={key} style={{ marginLeft: `${depth * 12}px` }} className="mt-1">
            <span className="text-purple-400 font-bold text-xs uppercase tracking-wider">{key.replace("_", " ")}</span>
            <div className="border-l border-gray-700 pl-2">
              {renderTree(value, depth + 1)}
            </div>
          </div>
        );
      }
      return (
        <div key={key} style={{ marginLeft: `${depth * 12}px` }} className="flex gap-2 text-xs py-0.5 hover:bg-white/5 rounded px-1 transition-colors">
          <span className="text-gray-500 select-none">{key}:</span>
          <span className="text-green-400 font-mono break-all">{String(value)}</span>
        </div>
      );
    });
  };

  // Safe extraction with fallbacks
  const layers = data.layers || {};
  const eth = layers.eth || {};
  const ip = layers.ip || layers.ipv6 || {};

  return (
    <div className="h-full flex flex-col">

      <div className="grid grid-cols-2 gap-4 mb-4 bg-[#0b1629] p-3 rounded-xl border border-[#1f2937]">
        <div>
           <h4 className="text-gray-400 text-xs uppercase mb-1 flex items-center gap-2"><FaNetworkWired/> Ethernet II</h4>
           <div className="text-xs text-gray-300">Src: <span className="text-amber-500 font-mono">{eth["eth.src"] || "N/A"}</span></div>
           <div className="text-xs text-gray-300">Dst: <span className="text-blue-400 font-mono">{eth["eth.dst"] || "N/A"}</span></div>
        </div>
        <div>
           <h4 className="text-gray-400 text-xs uppercase mb-1 flex items-center gap-2"><FaGlobe/> Internet Protocol</h4>
           <div className="text-xs text-gray-300">Src: <span className="text-amber-500 font-mono">{ip["ip.src"] || ip["ipv6.src"] || "N/A"}</span></div>
           <div className="text-xs text-gray-300">Dst: <span className="text-blue-400 font-mono">{ip["ip.dst"] || ip["ipv6.dst"] || "N/A"}</span></div>
        </div>
      </div>

      <div className="grow overflow-auto bg-[#0b1629] p-4 rounded-xl border border-[#1f2937] font-mono shadow-inner custom-scrollbar">
        {Object.keys(layers).length > 0 ? renderTree(layers) : <div className="text-gray-500">No layer data available</div>}
      </div>
    </div>
  );
}