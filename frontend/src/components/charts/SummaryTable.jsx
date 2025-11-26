import useFetch from "../../utils/useFetch";
import { FaNetworkWired, FaClock, FaDatabase, FaFingerprint, FaExchangeAlt } from "react-icons/fa";

export default function SummaryTable({ filename }) {
  const { data, loading } = useFetch(filename ? `/analytics/general_stats?filename=${filename}` : null);

  if (!filename) return <p className="text-gray-500 text-xs">No Data</p>;
  if (loading || !data) return <p className="text-xs text-gray-400">Calculating Stats...</p>;

  // Helper to format bytes to KB/MB
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const rows = [
    { icon: <FaExchangeAlt className="text-blue-400" />, label: "Total Packets", value: data.total_packets.toLocaleString() },
    { icon: <FaDatabase className="text-purple-400" />, label: "Total Bytes", value: formatBytes(data.total_bytes) },
    { icon: <FaClock className="text-green-400" />, label: "Capture Duration", value: `${data.duration_sec} sec` },
    { icon: <FaFingerprint className="text-amber-400" />, label: "Unique IPs", value: data.unique_ips },
    { icon: <FaNetworkWired className="text-red-400" />, label: "Unique Ports", value: data.unique_ports },
  ];

  return (
    <div className="w-full h-full overflow-auto p-2">
      <h3 className="text-white text-xl mb-3 font-bold font-jersey tracking-widest">Capture Summary</h3>
      
      <div className="w-full">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-[#0f1c33] border-b border-gray-700">
            <tr>
              <th className="px-3 py-2">Metric</th>
              <th className="px-3 py-2 text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b border-gray-800 hover:bg-[#0f1c33]/50 transition-colors">
                <td className="px-3 py-3 font-medium flex items-center gap-2">
                  {row.icon}
                  {row.label}
                </td>
                <td className="px-3 py-3 text-right font-mono text-white">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}