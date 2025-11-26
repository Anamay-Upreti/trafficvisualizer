import { useEffect, useState } from "react";
import { API_BASE } from "./api";


export default function useFetch(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


useEffect(() => {
    if (!endpoint) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
}