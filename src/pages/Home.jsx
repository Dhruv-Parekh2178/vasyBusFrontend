
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
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
          <i className="ri-map-pin-2-line" />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) { updatePosition(); setShowList(true); } }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800
            focus:outline-none focus:border-blue-500 placeholder-gray-400 transition text-sm font-medium"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin text-lg">
            <i className="ri-loader-4-line" />
          </span>
        )}
      </div>

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
              <i className="ri-map-pin-line" style={{ color: "#3b82f6" }} />
              {city}
            </li>
          ))}
        </ul>,
        document.body
      )}
    </div>
  );
};

const Home = () => {
  const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState(today);
  const [searching, setSearching] = useState(false);


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
    { icon: "ri-route-line",        title: "1000+ Routes",        desc: "Pan-India coverage across all major cities" },
    { icon: "ri-sofa-fill",         title: "Seat Selection",       desc: "Choose your preferred window or aisle seat" },
    { icon: "ri-secure-payment-line", title: "Secure Payments",   desc: "Powered by Stripe — safe & instant" },
    { icon: "ri-mail-check-line",   title: "Instant Confirmation", desc: "Get your ticket on email right away" },
    { icon: "ri-refund-2-line",     title: "Easy Cancellation",    desc: "Cancel anytime and get a quick refund" },
    { icon: "ri-headphone-line",    title: "24/7 Support",         desc: "We're here whenever you need help" },
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

              <button
                type="button"
                onClick={swapCities}
                title="Swap cities"
                className="mb-1 p-2.5 rounded-full border-2 border-blue-200 text-blue-500
                  hover:bg-blue-50 hover:border-blue-500 transition self-end md:self-auto text-xl"
              >
                <i className="ri-arrow-left-right-line" />
              </button>

              <CityInput label="To" placeholder="Arrival city" value={destination} onChange={setDestination} onSelect={setDestination} />

              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Travel Date
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
                    <i className="ri-calendar-line" />
                  </span>
                  <input
                    type="date"
                    value={travelDate}
                    min={today}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800
                      focus:outline-none focus:border-blue-500 transition text-sm font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={searching}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3
                  rounded-xl transition disabled:opacity-60 whitespace-nowrap text-sm
                  shadow-md hover:shadow-lg self-end flex items-center gap-2"
              >
                {searching ? (
                  <>
                    <i className="ri-loader-4-line animate-spin text-base" />
                    Searching...
                  </>
                ) : (
                  <>
                    <i className="ri-search-line text-base" />
                    Search Buses
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">
          Why Travel with VasyBus?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100
                hover:shadow-md hover:border-blue-200 transition"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                <i className={`${f.icon} text-2xl text-blue-600`} />
              </div>
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
