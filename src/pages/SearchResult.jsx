import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const formatTime = (instant) => {
  if (!instant) return "--";
  return new Date(instant).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDuration = (dep, arr) => {
  if (!dep || !arr) return "--";
  const diffMs = new Date(arr) - new Date(dep);
  const hrs = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  return `${hrs}h ${mins}m`;
};

const formatDate = (localDate) => {
  if (!localDate) return "--";
  return new Date(localDate + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
};

const busTypeStyle = (type) => {
  const map = {
    AC:      { bg: "bg-blue-100",   text: "text-blue-700",   icon: "ri-temp-cold-line" },
    NON_AC:  { bg: "bg-gray-100",   text: "text-gray-700",   icon: "ri-wind-line" },
    SLEEPER: { bg: "bg-purple-100", text: "text-purple-700", icon: "ri-moon-line" },
  };
  return map[type] || { bg: "bg-gray-100", text: "text-gray-600", icon: "ri-bus-line" };
};

const BusCard = ({ schedule, onSelect }) => {
  const typeStyle = busTypeStyle(schedule.busType);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition p-5 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-bold text-gray-800 text-base">{schedule.busName}</h3>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${typeStyle.bg} ${typeStyle.text}`}>
              <i className={typeStyle.icon} />
              {schedule.busType?.replace("_", " ")}
            </span>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <i className="ri-building-line" /> {schedule.operatorName}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-1 justify-center">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-800">{formatTime(schedule.departureTime)}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1 justify-center">
              <i className="ri-map-pin-2-line text-blue-500" />
              {schedule.sourceCity}
            </p>
          </div>

          <div className="flex flex-col items-center flex-1 max-w-[100px]">
            <p className="text-xs text-gray-400 mb-1">{formatDuration(schedule.departureTime, schedule.arrivalTime)}</p>
            <div className="w-full flex items-center gap-1">
              <div className="h-0.5 flex-1 bg-gray-200" />
              <i className="ri-bus-line text-blue-500 text-sm" />
              <div className="h-0.5 flex-1 bg-gray-200" />
            </div>
            <p className="text-xs text-gray-400 mt-1">{formatDate(schedule.travelDate)}</p>
          </div>

          <div className="text-center">
            <p className="text-xl font-bold text-gray-800">{formatTime(schedule.arrivalTime)}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1 justify-center">
              <i className="ri-map-pin-line text-green-500" />
              {schedule.destinationCity}
            </p>
          </div>
        </div>

        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 md:min-w-[140px]">
          <div className="text-right">
            <p className="text-2xl font-extrabold text-blue-600">
              ₹{Number(schedule.pricePerSeat).toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-gray-400">per seat</p>
          </div>

          <div className="text-right">
            <p className={`text-xs font-semibold flex items-center gap-1 ${schedule.availableSeats > 10 ? "text-green-600" : schedule.availableSeats > 0 ? "text-orange-500" : "text-red-500"}`}>
              <i className="ri-seat-line" />
              {schedule.availableSeats > 0
                ? `${schedule.availableSeats} seats left`
                : "Fully Booked"}
            </p>
          </div>

          <button
            onClick={() => onSelect(schedule)}
            disabled={schedule.availableSeats === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
              text-white text-sm font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap"
          >
            <i className="ri-arrow-right-circle-line" />
            Select Seats
          </button>
        </div>
      </div>
    </div>
  );
};

const SearchResults = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null); 
  const [sortBy, setSortBy] = useState("departure");

  useEffect(() => {
    const raw = sessionStorage.getItem("lastSearch");
    if (!raw) {
      toast.error("No search data found. Please search again.");
      navigate("/");
      return;
    }
    try {
      setData(JSON.parse(raw));
    } catch {
      navigate("/");
    }
  }, [navigate]);

  if (!data) return null;

  const sorted = [...(data.results || [])].sort((a, b) => {
    if (sortBy === "price")     return Number(a.pricePerSeat) - Number(b.pricePerSeat);
    if (sortBy === "seats")     return b.availableSeats - a.availableSeats;
    return new Date(a.departureTime) - new Date(b.departureTime);
  });

  const handleSelect = (schedule) => {
    if (schedule.availableSeats === 0) return;
    sessionStorage.setItem("selectedSchedule", JSON.stringify(schedule));
    navigate(`/seat-selection/${schedule.scheduleId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-5 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold">
              <span>{data.source}</span>
              <i className="ri-arrow-right-line text-blue-200" />
              <span>{data.destination}</span>
            </div>
            <p className="text-blue-200 text-sm flex items-center gap-1 mt-0.5">
              <i className="ri-calendar-line" />
              {formatDate(data.travelDate)} &nbsp;·&nbsp;
              <i className="ri-bus-line" />
              {data.results.length} {data.results.length === 1 ? "bus" : "buses"} found
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition"
          >
            <i className="ri-search-line" /> Modify Search
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className="text-sm text-gray-500 font-medium flex items-center gap-1">
            <i className="ri-sort-desc" /> Sort by:
          </span>
          {[
            { key: "departure", label: "Departure", icon: "ri-time-line" },
            { key: "price",     label: "Price",     icon: "ri-money-rupee-circle-line" },
            { key: "seats",     label: "Seats",     icon: "ri-sofa-fill" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition
                ${sortBy === s.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"}`}
            >
              <i className={s.icon} /> {s.label}
            </button>
          ))}
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <i className="ri-bus-line text-6xl mb-4 block" />
            <p className="text-lg font-semibold">No buses found</p>
            <p className="text-sm mt-1">Try a different date or route</p>
            <button
              onClick={() => navigate("/")}
              className="mt-5 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              Back to Search
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {sorted.map((schedule) => (
              <BusCard
                key={schedule.scheduleId}
                schedule={schedule}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;