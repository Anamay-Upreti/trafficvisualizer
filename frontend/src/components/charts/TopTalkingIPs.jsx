import useFetch from "../../utils/useFetch";

export default function TopTalkingIPs({ filename }) {
  const { data, loading } = useFetch(filename ? `/analytics/top_ips?filename=${filename}` : null);

  if (!filename) return <p className="text-gray-500 text-xs">No Data</p>;
  if (loading || !data) return <p className="text-xs">Loading...</p>;

  return (
    <div className="w-full h-full overflow-auto">
      <h3 className="text-white text-xl mb-2 font-bold font-jersey tracking-widest">Top Talkative IPs</h3>
      <table className="w-full text-xs text-left text-white">
        <thead className="text-xs text-gray-400 uppercase bg-[#0f1c33]">
          <tr>
            <th className="px-2 py-1">IP</th>
            <th className="px-2 py-1">Count</th>
          </tr>
        </thead>
        <tbody>
          {data.labels.map((ip, index) => (
            <tr key={index} className="border-b border-gray-800">
              <td className="px-2 py-1 font-mono text-amber-500">{ip}</td>
              <td className="px-2 py-1">{data.data[index]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}