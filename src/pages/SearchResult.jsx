import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const formatTime = (t) => {
  if (!t) return "--";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return String(hour12).padStart(2,"0") + ":" + String(m).padStart(2,"0") + " " + ampm;
};
 
const formatDuration = (dep, arr) => {
  if (!dep || !arr) return "--";
  const [dh, dm] = dep.split(":").map(Number);
  let [ah, am] = arr.split(":").map(Number);
  let depMins = dh * 60 + dm;
  let arrMins = ah * 60 + am;
  if (arrMins < depMins) arrMins += 24 * 60; // overnight
  const diff = arrMins - depMins;
  return Math.floor(diff / 60) + "h " + (diff % 60) + "m";
};

const formatDate = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  }) : "--";

const getDepartureHour = (instant) => instant ? new Date(instant).getHours() : 0;

const busTypeLabel = (type) => type?.replace(/_/g, " ") || "";

const typeStyle = (type = "") => {
  const t = type.toUpperCase();
  if (t.includes("AC") && t.includes("SLEEPER")) return { bg: "bg-indigo-100", text: "text-indigo-700", icon: "ri-moon-line" };
  if (t.includes("SLEEPER"))  return { bg: "bg-purple-100", text: "text-purple-700", icon: "ri-moon-line" };
  if (t.includes("AC"))       return { bg: "bg-blue-100",   text: "text-blue-700",   icon: "ri-temp-cold-line" };
  return                             { bg: "bg-gray-100",   text: "text-gray-700",   icon: "ri-wind-line" };
};

const BusCard = ({ schedule, onSelect }) => {
  const ts = typeStyle(schedule.busType);
  const seats = schedule.availableSeats;
  const seatColor = seats > 10 ? "text-green-600" : seats > 0 ? "text-orange-500" : "text-red-500";
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition p-5">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
       
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-bold text-gray-800">{schedule.busName}</h3>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${ts.bg} ${ts.text}`}>
              <i className={ts.icon} /> {busTypeLabel(schedule.busType)}
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
              <i className="ri-map-pin-2-line text-blue-500" /> {schedule.sourceCity}
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
              <i className="ri-map-pin-line text-green-500" /> {schedule.destinationCity}
            </p>
          </div>
        </div>

    
        <div className="flex md:flex-col items-center md:items-end justify-between gap-3 md:min-w-[140px]">
          <div className="text-right">
            <p className="text-2xl font-extrabold text-blue-600">₹{Number(schedule.pricePerSeat).toLocaleString("en-IN")}</p>
            <p className="text-xs text-gray-400">per seat</p>
          </div>
          <p className={`text-xs font-semibold flex items-center gap-1 ${seatColor}`}>
            <i className="ri-seat-line" />
            {seats > 0 ? `${seats} seats left` : "Fully Booked"}
          </p>
          <button onClick={() => onSelect(schedule)} disabled={seats === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap">
            <i className="ri-arrow-right-circle-line" /> Select Seats
          </button>
        </div>
      </div>
    </div>
  );
};

const FilterPanel = ({ results, filters, setFilters, onReset }) => {
  
  const prices = results.map(r => Number(r.pricePerSeat));
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 5000;

  const busTypes = [...new Set(results.map(r => r.busType).filter(Boolean))];

  const depSlots = [
    { label: "Before 6 AM",   icon: "ri-moon-line",       start: 0,  end: 6  },
    { label: "6 AM – 12 PM",  icon: "ri-sun-line",         start: 6,  end: 12 },
    { label: "12 PM – 6 PM",  icon: "ri-sun-foggy-line",   start: 12, end: 18 },
    { label: "After 6 PM",    icon: "ri-moon-cloudy-line", start: 18, end: 24 },
  ];

  const toggleBusType = (type) => {
    setFilters(f => ({
      ...f,
      busTypes: f.busTypes.includes(type)
        ? f.busTypes.filter(t => t !== type)
        : [...f.busTypes, type],
    }));
  };

  const toggleDepSlot = (slot) => {
    const key = `${slot.start}-${slot.end}`;
    setFilters(f => ({
      ...f,
      depSlots: f.depSlots.includes(key)
        ? f.depSlots.filter(s => s !== key)
        : [...f.depSlots, key],
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5 sticky top-20">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <i className="ri-equalizer-line text-blue-600" /> Filters
        </h3>
        <button onClick={onReset} className="text-xs text-blue-600 hover:underline font-medium">
          Reset All
        </button>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">AC Type</p>
        <div className="flex gap-2">
          {[
            { key: "AC",     label: "AC",     icon: "ri-temp-cold-line" },
            { key: "NON_AC", label: "Non-AC", icon: "ri-wind-line" },
          ].map(t => (
            <button key={t.key} onClick={() => setFilters(f => ({ ...f, acType: f.acType === t.key ? null : t.key }))}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 text-xs font-semibold transition ${
                filters.acType === t.key
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-500 hover:border-blue-300"}`}>
              <i className={t.icon} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {busTypes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bus Type</p>
          <div className="space-y-2">
            {busTypes.map(type => (
              <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" checked={filters.busTypes.includes(type)}
                  onChange={() => toggleBusType(type)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 accent-blue-600" />
                <span className="text-sm text-gray-700 group-hover:text-blue-600 transition">
                  {busTypeLabel(type)}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Price Range
          <span className="ml-2 text-blue-600 font-bold normal-case">
            ₹{filters.maxPrice.toLocaleString("en-IN")}
          </span>
        </p>
        <input type="range" min={minPrice} max={maxPrice} step={50}
          value={filters.maxPrice}
          onChange={e => setFilters(f => ({ ...f, maxPrice: Number(e.target.value) }))}
          className="w-full accent-blue-600" />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>₹{minPrice.toLocaleString("en-IN")}</span>
          <span>₹{maxPrice.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Departure Time</p>
        <div className="space-y-2">
          {depSlots.map(slot => {
            const key = `${slot.start}-${slot.end}`;
            const active = filters.depSlots.includes(key);
            return (
              <button key={key} onClick={() => toggleDepSlot(slot)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border-2 text-sm transition ${
                  active
                    ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                    : "border-gray-100 text-gray-600 hover:border-blue-200"}`}>
                <i className={slot.icon + " text-base"} />
                {slot.label}
              </button>
            );
          })}
        </div>
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <div onClick={() => setFilters(f => ({ ...f, availableOnly: !f.availableOnly }))}
          className={`w-10 h-6 rounded-full transition-colors relative ${filters.availableOnly ? "bg-blue-600" : "bg-gray-200"}`}>
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.availableOnly ? "translate-x-5" : "translate-x-1"}`} />
        </div>
        <span className="text-sm text-gray-700 font-medium">Available seats only</span>
      </label>
    </div>
  );
};

const SearchResults = () => {
  const navigate = useNavigate();
  const [data, setData]     = useState(null);
  const [sortBy, setSortBy] = useState("departure");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    busTypes:      [],
    acType:        null, 
    maxPrice:      99999,
    depSlots:      [],    
    availableOnly: false,
  });

  useEffect(() => {
    const raw = sessionStorage.getItem("lastSearch");
    if (!raw) { toast.error("No search data found. Please search again."); navigate("/"); return; }
    try {
      const parsed = JSON.parse(raw);
      setData(parsed);
      const prices = (parsed.results || []).map(r => Number(r.pricePerSeat));
      if (prices.length) setFilters(f => ({ ...f, maxPrice: Math.max(...prices) }));
    } catch { navigate("/"); }
  }, [navigate]);

  const resetFilters = () => {
    const prices = (data?.results || []).map(r => Number(r.pricePerSeat));
    setFilters({
      busTypes: [], acType: null,
      maxPrice: prices.length ? Math.max(...prices) : 99999,
      depSlots: [], availableOnly: false,
    });
  };

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = [...(data.results || [])];

    if (filters.busTypes.length > 0)
      list = list.filter(r => filters.busTypes.includes(r.busType));

    if (filters.acType === "AC")
      list = list.filter(r => r.busType?.toUpperCase().includes("AC") && !r.busType?.toUpperCase().includes("NON_AC"));
    if (filters.acType === "NON_AC")
      list = list.filter(r => r.busType?.toUpperCase().includes("NON_AC"));

    list = list.filter(r => Number(r.pricePerSeat) <= filters.maxPrice);

    if (filters.depSlots.length > 0) {
      list = list.filter(r => {
        const hour = getDepartureHour(r.departureTime);
        return filters.depSlots.some(slot => {
          const [start, end] = slot.split("-").map(Number);
          return hour >= start && hour < end;
        });
      });
    }

    if (filters.availableOnly)
      list = list.filter(r => r.availableSeats > 0);


    if (sortBy === "price")    list.sort((a, b) => Number(a.pricePerSeat) - Number(b.pricePerSeat));
    else if (sortBy === "seats") list.sort((a, b) => b.availableSeats - a.availableSeats);
    else list.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));

    return list;
  }, [data, filters, sortBy]);

  const activeFilterCount = [
    filters.busTypes.length > 0,
    filters.acType !== null,
    filters.depSlots.length > 0,
    filters.availableOnly,
  ].filter(Boolean).length;

  const handleSelect = (schedule) => {
    if (schedule.availableSeats === 0) return;
    sessionStorage.setItem("selectedSchedule", JSON.stringify(schedule));
    navigate(`/seat-selection/${schedule.scheduleId}`);
  };

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
     
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-5 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold">
              <span>{data.source}</span>
              <i className="ri-arrow-right-line text-blue-200" />
              <span>{data.destination}</span>
            </div>
            <p className="text-blue-200 text-sm flex items-center gap-1 mt-0.5">
              <i className="ri-calendar-line" /> {formatDate(data.travelDate)}
              &nbsp;·&nbsp;
              <i className="ri-bus-line" />
              {filtered.length} of {data.results.length} bus{data.results.length !== 1 ? "es" : ""}
            </p>
          </div>
          <div className="flex gap-2">
        
            <button onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition">
              <i className="ri-equalizer-line" /> Filters
              {activeFilterCount > 0 && (
                <span className="bg-white text-blue-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition">
              <i className="ri-search-line" /> Modify Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">

        <div className={`md:w-64 shrink-0 ${showFilters ? "block" : "hidden md:block"}`}>
          <FilterPanel
            results={data.results || []}
            filters={filters}
            setFilters={setFilters}
            onReset={resetFilters}
          />
        </div>


        <div className="flex-1">
  
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-sm text-gray-500 font-medium flex items-center gap-1">
              <i className="ri-sort-desc" /> Sort by:
            </span>
            {[
              { key: "departure", label: "Departure", icon: "ri-time-line" },
              { key: "price",     label: "Price",     icon: "ri-money-rupee-circle-line" },
              { key: "seats",     label: "Seats",     icon: "ri-seat-line" },
            ].map(s => (
              <button key={s.key} onClick={() => setSortBy(s.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  sortBy === s.key
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"}`}>
                <i className={s.icon} /> {s.label}
              </button>
            ))}

            {activeFilterCount > 0 && (
              <span className="ml-auto text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
              </span>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <i className="ri-bus-line text-6xl text-gray-200 block mb-3" />
              <p className="text-lg font-semibold text-gray-500">No buses match your filters</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting or resetting your filters</p>
              <button onClick={resetFilters}
                className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map(s => (
                <BusCard key={s.scheduleId} schedule={s} onSelect={handleSelect} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;