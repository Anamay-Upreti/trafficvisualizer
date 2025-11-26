import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import useFetch from "../../utils/useFetch";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ProtocolDistribution({ filename }) {
  const { data, loading } = useFetch(
    filename ? `/analytics/protocols?filename=${filename}` : null
  );

  if (!filename) return <p className="text-gray-500 text-xs">No Data</p>;
  if (loading || !data) return <p className="text-xs">Loading...</p>;

  return (
    <div className="w-full h-full flex flex-col items-center">
      <h3 className="text-white mb-2 font-bold font-jersey tracking-widest text-xl">
        Protocol Distribution
      </h3>
      <div className="grow w-full relative">
        <Doughnut
          data={{
            labels: data.labels,
            datasets: [
              {
                data: data.data,
                backgroundColor: [
                  "#3b82f6",
                  "#ef4444",
                  "#10b981",
                  "#f59e0b",
                  "#8b5cf6",
                ],
                borderWidth: 0,
                hoverOffset: 20,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            onHover: (event, chartElement) => {
              event.native.target.style.cursor = chartElement.length
                ? "pointer"
                : "default";
            },
            plugins: {
              legend: {
                position: "right",
                labels: { color: "white", boxWidth: 10 },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
