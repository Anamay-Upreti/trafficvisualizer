export default function PacketTable({ packets, onSelect, selectedId }) {
  if (!packets || packets.length === 0) return <div className="text-gray-500 p-4">No packets found.</div>;

return(
    <div className="overflow-auto h-full">
        <table className="w-full text-left text-sm text-gray-300">
        <thead className="text-xs text-gray-400 uppercase bg-[#0b1629] sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="px-4 py-3 w-16">No.</th>
            <th className="px-4 py-3 w-32">Time</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Destination</th>
            <th className="px-4 py-3 w-24">Proto</th>
            <th className="px-4 py-3 w-20">Len</th>
            <th className="px-4 py-3">Info</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1f2937]">
          {packets.map((pkt) => (
            <tr 
              key={pkt.number} 
              onClick={() => onSelect(pkt.number)}
              className={`
                cursor-pointer transition-colors border-l-2
                ${selectedId === pkt.number 
                  ? "bg-blue-900/30 border-blue-500" 
                  : "border-transparent hover:bg-[#1f2937] odd:bg-[#07101f] even:bg-[#091324]"}
              `}
            >
              <td className="px-4 py-2 text-gray-500 font-mono text-xs">{pkt.number}</td>
              <td className="px-4 py-2 text-xs">{parseFloat(pkt.timestamp).toFixed(4)}</td>
              <td className="px-4 py-2 text-amber-500">{pkt.source}</td>
              <td className="px-4 py-2 text-blue-400">{pkt.destination}</td>
              <td className="px-4 py-2 font-bold text-gray-200">{pkt.protocol}</td>
              <td className="px-4 py-2 text-xs">{pkt.length}</td>
              <td className="px-4 py-2 text-gray-400 text-xs truncate max-w-xs opacity-80">{pkt.info}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
);
}