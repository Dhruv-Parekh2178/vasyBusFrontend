import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const CityInput = ({ label, placeholder, value, onChange, onSelect }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showList, setShowList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(value, 300);

  const updatePosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      setShowList(false);
      return;
    }
    setLoading(true);
    api
      .get(`/routes/cities?query=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => {
        // ✅ Backend wraps in ApiResponse — actual list is res.data.data
        const cities = res.data?.data || [];
        setSuggestions(cities);
        if (cities.length > 0) {
          updatePosition();
          setShowList(true);
        } else {
          setShowList(false);
        }
      })
      .catch(() => { setSuggestions([]); setShowList(false); })
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  useEffect(() => {
    const handler = (e) => {
      if (inputRef.current && !inputRef.current.closest("[data-cityinput]")?.contains(e.target)) {
        setShowList(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (city) => {
    onSelect(city);
    setSuggestions([]);
    setShowList(false);
  };

  return (
    <div className="flex-1" data-cityinput="">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) { updatePosition(); setShowList(true); } }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800
            focus:outline-none focus:border-blue-500 placeholder-gray-400 transition text-sm font-medium"
        />
        {loading && (
          <div className="absolute right-3 top-3.5 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Portal — renders into <body>, escapes gradient stacking context entirely */}
      {showList && suggestions.length > 0 && createPortal(
        <ul style={{
          position: "absolute",
          top: dropdownPos.top,
          left: dropdownPos.left,
          width: dropdownPos.width,
          zIndex: 99999,
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          maxHeight: "200px",
          overflowY: "auto",
          padding: 0,
          margin: 0,
          listStyle: "none",
        }}>
          {suggestions.map((city, i) => (
            <li
              key={i}
              onMouseDown={() => handleSelect(city)}
              style={{ padding: "10px 16px", fontSize: "14px", color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#eff6ff"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
            >
              📍 {city}
            </li>
          ))}
        </ul>,
        document.body
      )}
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [searching, setSearching] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const swapCities = () => { setSource(destination); setDestination(source); };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!source.trim()) return toast.error("Please enter a source city");
    if (!destination.trim()) return toast.error("Please enter a destination city");
    if (!travelDate) return toast.error("Please select a travel date");
    if (source.trim().toLowerCase() === destination.trim().toLowerCase())
      return toast.error("Source and destination cannot be the same");

    setSearching(true);
    try {
      const res = await api.get("/schedules/search", {
        params: { source: source.trim(), destination: destination.trim(), travelDate },
      });
      // ✅ ApiResponse wrapper — actual results are in res.data.data
      const results = res.data?.data;
      if (!results || results.length === 0) {
        toast.info("No buses found for this route and date.");
        return;
      }
      sessionStorage.setItem("lastSearch", JSON.stringify({ source, destination, travelDate, results }));
      navigate("/search-results");
    } catch (err) {
      toast.error(err.response?.data?.message || "Search failed. Try again.");
    } finally {
      setSearching(false);
    }
  };

  const features = [
    { icon: "🗺️", title: "1000+ Routes", desc: "Pan-India coverage across all major cities" },
    { icon: "💺", title: "Seat Selection", desc: "Choose your preferred window or aisle seat" },
    { icon: "💳", title: "Secure Payments", desc: "Powered by Stripe — safe & instant" },
    { icon: "📧", title: "Instant Confirmation", desc: "Get your ticket on email right away" },
    { icon: "❌", title: "Easy Cancellation", desc: "Cancel anytime and get a quick refund" },
    { icon: "🎧", title: "24/7 Support", desc: "We're here whenever you need help" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
            Travel Smarter with <span className="text-yellow-300">VasyBus</span>
          </h1>
          <p className="text-blue-100 text-lg">
            Book bus tickets instantly — thousands of routes, real-time seats
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-end gap-3">
              <CityInput label="From" placeholder="Departure city" value={source} onChange={setSource} onSelect={setSource} />

              <button type="button" onClick={swapCities} title="Swap cities"
                className="mb-1 p-2.5 rounded-full border-2 border-blue-200 text-blue-500 hover:bg-blue-50 hover:border-blue-500 transition self-end md:self-auto">
                ⇌
              </button>

              <CityInput label="To" placeholder="Arrival city" value={destination} onChange={setDestination} onSelect={setDestination} />

              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Travel Date</label>
                <input type="date" value={travelDate} min={today}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-blue-500 transition text-sm font-medium"
                />
              </div>

              <button type="submit" disabled={searching}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition disabled:opacity-60 whitespace-nowrap text-sm shadow-md hover:shadow-lg self-end">
                {searching ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    Searching...
                  </span>
                ) : "🔍 Search Buses"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">Why Travel with VasyBus?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-6 text-gray-400 text-sm border-t border-gray-200">
        © 2025 VasyBus · All rights reserved
      </footer>
    </div>
  );
};

export default Home;