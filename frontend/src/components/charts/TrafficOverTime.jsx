import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import useFetch from "../../utils/useFetch";


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function TrafficOverTime({ filename }) {
  const { data, loading } = useFetch(filename ? `/analytics/traffic?filename=${filename}` : null);

  if (!filename) return <p className="text-gray-500 text-xs">No Data</p>;
  if (loading) return <p className="text-xs text-gray-400">Loading traffic data...</p>;
  if (!data || !data.timestamps || data.timestamps.length === 0) {
    return <p className="text-xs text-gray-500">No timestamp data found.</p>;
  }

  const startTime = Math.min(...data.timestamps);

  const duration = Math.max(...data.timestamps) - startTime;
  const distinctSeconds = Math.ceil(duration) + 1;

  const bins = new Array(distinctSeconds).fill(0);

  data.timestamps.forEach(ts => {
      const secondIndex = Math.floor(ts - startTime);
      if (bins[secondIndex] !== undefined) {
          bins[secondIndex]++;
      }
  });

  const displayLimit = 60;
  const chartLabels = bins.slice(0, displayLimit).map((_, i) => `${i}s`);
  const chartData = bins.slice(0, displayLimit);

  return (
    <div className="w-full h-full p-2 flex flex-col">
      <h3 className="text-white text-xl mb-2 font-bold font-jersey tracking-widest">Packet Arrival Rate </h3>
      <div className="grow relative">
        <Line
            data={{
            labels: chartLabels,
            datasets: [{ 
                label: "Packets per Second", 
                data: chartData,
                borderColor: '#3b82f6', 
                backgroundColor: 'rgba(59, 130, 246, 0.2)', 
                tension: 0.4,
                fill: true,
                pointRadius: 2
            }]
            }}
            options={{ 
                responsive: true, 
                maintainAspectRatio: false, 
                scales: {
                    x: { 
                        ticks: { color: '#9ca3af', maxTicksLimit: 10 },
                        grid: { display: false } 
                    },
                    y: { 
                        beginAtZero: true,
                        ticks: { color: '#9ca3af' },
                        grid: { color: '#1f2937' } 
                    }
                },
                plugins: { legend: { display: false } } 
            }}
        />
      </div>
    </div>
  );
}