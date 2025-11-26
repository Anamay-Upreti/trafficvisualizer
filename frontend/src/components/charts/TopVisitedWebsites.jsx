import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import useFetch from "../../utils/useFetch";

// Register components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TopVisitedWebsites({ filename }) {
  // Fetch from the new endpoint
  const { data, loading } = useFetch(
    filename ? `/analytics/websites?filename=${filename}` : null
  );

  if (!filename) return <p className="text-gray-500 text-xs">No Data</p>;
  if (loading) return <p className="text-xs text-gray-400">Loading...</p>;
  
  if (!data || !data.labels || data.labels.length === 0) {
    return <p className="text-xs text-gray-500">No HTTP Host headers found.</p>;
  }

  return (
    <div className="w-full flex flex-col p-2">
      <h3 className="text-white text-xl mb-2 font-bold font-jersey tracking-widest">Top Visited Websites (HTTP)</h3>
      <div className="w-full h-56 w-min-0 gap-1">

        <Bar
        data={{
          labels: data.labels,
          datasets: [
            {
              label: "Requests",
              data: data.data,
              backgroundColor: 'rgba(255, 99, 132, 0.8)', // Pinkish Red
              borderRadius: 4,
              barThickness: 20,
            },
          ],
        }}
        options={{
          indexAxis: 'y', // <--- This makes it a Horizontal Bar Chart
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1f2937',
                titleColor: '#fff',
                bodyColor: '#fff',
            }
          },
          scales: {
            x: {
              grid: { color: '#374151' },
              ticks: { color: '#9ca3af' }
            },
            y: {
              grid: { display: false },
              ticks: { color: '#e5e7eb', font: { size: 11 } }
            }
          }
        }}
      />

      </div>
      
    </div>
  );
}