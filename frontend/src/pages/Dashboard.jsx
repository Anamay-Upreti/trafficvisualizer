
import Card from "../components/ui/Card.jsx";


import TrafficOverTime from "../components/charts/TrafficOverTime.jsx";
import ProtocolDistribution from "../components/charts/ProtocolDistribution.jsx";
import TopTcpPorts from "../components/charts/TopTcpPorts.jsx";
import TopUdpPorts from "../components/charts/TopUdpPorts.jsx";
import TopTalkingIPs from "../components/charts/TopTalkingIPs.jsx";

import SummaryTable from "../components/charts/SummaryTable.jsx"; 
import TopVisitedWebsites from "../components/charts/TopVisitedWebsites.jsx";

const Dashboard = ({ filename }) => {
  return (

    <div className="p-6 flex flex-col gap-6">


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <TopTcpPorts filename={filename} />
        </Card>
        <Card>
          <TopUdpPorts filename={filename} />
        </Card>
        <Card>
          <TrafficOverTime filename={filename} />
        </Card>
        <Card>
          <ProtocolDistribution filename={filename} />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-[#07101f] rounded-2xl p-4 h-72 shadow-xl flex items-center justify-center">
          <TopTalkingIPs filename={filename} />
        </div>
        

        <div className="bg-[#07101f] rounded-2xl p-4 h-72 shadow-xl flex items-center justify-center">
          <SummaryTable filename={filename} />
        </div>
        
        <div className="bg-[#07101f] rounded-2xl p-4 h-72 shadow-xl flex items-center justify-center">
          <TopVisitedWebsites filename={filename} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;