import { Bar } from "react-chartjs-2";
import useFetch from "../../utils/useFetch";

export default function TopTcpPorts({ filename }) {
  const { data, loading } = useFetch(filename ? `/analytics/tcp_ports?filename=${filename}` : null);

  if (!filename) return <p className="text-gray-500 text-xs">No Data</p>;
  if (loading || !data) return <p className="text-xs">Loading...</p>;

  return (
    <div className="w-full flex flex-col">
      <h3 className="text-white text-xl mb-2 font-bold font-jersey tracking-widest">Top TCP Ports</h3>
      <div className="relative w-full h-50 min-w-0">
        <Bar
        data={{
          labels: data.labels,
          datasets: [{ label: "Count", data: data.data, backgroundColor: '#3b82f6' }]
        }}
        options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } ,
        scales: {
              x: { ticks: { color: '#9ca3af', font: { size: 10 } }, grid: { display: false } },
              y: { ticks: { color: '#9ca3af', font: { size: 10 } }, grid: { color: '#1f2937' } }
            }
      
      }}
      />

      </div>
      
    </div>
  );
}