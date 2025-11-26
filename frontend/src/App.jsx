import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

// Import Pages and Components
import Dashboard from "./pages/Dashboard.jsx";
import Explorer from "./pages/Explorer.jsx";
import Navbar from "./components/Navbar.jsx";

function AppContent() {
  // FIXED: Initialize with null so it starts empty every time
  const [currentFilename, setCurrentFilename] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const handleUploadSuccess = (filename) => {
    setCurrentFilename(filename);
    // REMOVED: Do not save to localStorage
    
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#020610] text-white font-sans">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#fff",
            justifyContent: "center",
            alignItems: "center",
          },
        }}
      />

      <div className="p-6 pb-0">
        <Navbar
          onUploadSuccess={handleUploadSuccess}
          filename={currentFilename}
        />
      </div>

      <Routes>
        <Route path="/" element={<Dashboard filename={currentFilename} />} />
        <Route path="/explorer/:filename" element={<Explorer />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}