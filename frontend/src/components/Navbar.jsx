import { useRef, useState } from "react";
import { MdOutlineUploadFile, MdOutlineExplore } from "react-icons/md";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

export default function Navbar({ onUploadSuccess, filename }) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const loadingToast = toast.loading("Parsing PCAP file...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (onUploadSuccess) onUploadSuccess(data.filename);

      toast.dismiss(loadingToast);
      toast.success("File parsed successfully!");
    } catch (error) {
      console.error(error);
      toast.dismiss(loadingToast);
      toast.error("Error uploading file. Check backend.");
    } finally {
      setIsUploading(false);
      event.target.value = null;
    }
  };

  const handleExplorerClick = () => {
    if (filename) {
      navigate(`/explorer/${filename}`);
    } else {
      toast.error("Please upload a file first to explore packets!");
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row justify-between items-center bg-[#07101f] px-6 py-4 rounded-4xl shadow-lg border border-[#1f2937]">
      <Link
        to="/"
        className="text-2xl font-bold cursor-pointer font-jersey tracking-wider text-white hover:text-amber-500 transition-colors mb-4 md:mb-0"
      >
        Traffic Visualizer
      </Link>

      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
        <Link
          to="/"
          className="text-2xl font-semibold cursor-pointer hover:underline hover:text-amber-600 transition-colors duration-200 font-jersey tracking-wider"
        >
          Dashboard
        </Link>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="
            relative group overflow-hidden 
            bg-[#0f1c33] rounded-xl text-sm font-bold cursor-pointer
            text-white hover:text-white 
            transition-colors duration-500 
            w-full md:w-40 h-9 border border-[#1f2937]
            "
        >
          <span className="absolute top-0 left-0 w-0 h-full bg-amber-600 transition-all duration-500 ease-in-out group-hover:w-full"></span>
          <span className="relative z-10 flex justify-center items-center gap-2 text-xl w-full h-full font-jersey tracking-wider">
            {isUploading ? "Parsing..." : "Upload File"}{" "}
            <MdOutlineUploadFile className="w-5 h-5" />
          </span>
        </button>

        <button
          onClick={handleExplorerClick}
          className={`
            relative group overflow-hidden 
            rounded-xl text-sm font-bold 
            transition-colors duration-500 
            w-full md:w-40 h-9 border border-[#1f2937]
            ${
              filename
                ? "bg-[#0f1c33] cursor-pointer hover:text-white"
                : "bg-gray-900 opacity-50 cursor-not-allowed text-gray-500"
            }
            `}
        >
          {filename && (
            <span className="absolute top-0 left-0 w-0 h-full bg-blue-600 transition-all duration-500 ease-in-out group-hover:w-full"></span>
          )}

          <span className="relative z-10 flex justify-center items-center gap-2 text-xl w-full h-full font-jersey tracking-wider">
            Explorer <MdOutlineExplore className="w-5 h-5" />
          </span>
        </button>
      </div>
    </div>
  );
}
