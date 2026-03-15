import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";

import {
  fetchSeats, lockSeat, unlockSeat,
  tickLockTimer, clearSeats, removeLocked,
} from "../redux/seatSlice";
import {
  selectSeat, deselectSeat, updatePassenger,
  createBooking, clearSelection,
} from "../redux/bookingSlice";

const formatTime = (i) =>
  i ? new Date(i).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "--";
const formatDate = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "--";

const getBusLayout = (busType) => {
  if (!busType) return "2X2";
  const t = busType.toUpperCase();
  if (t.includes("2X3")) return "2X3";
  if (t.includes("SLEEPER")) return "SLEEPER";
  return "2X2";
};

const getSeatStatus = (seat, selectedSeats) => {
  if (seat.booked) return "BOOKED";
  if (selectedSeats.includes(seat.seatId)) return "SELECTED";
  return "AVAILABLE";
};

const SeaterBtn = ({ seat, status, onToggle }) => {
  const style = {
    SELECTED:  "bg-blue-600 text-white border-blue-700 cursor-pointer",
    BOOKED:    "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed opacity-60",
    AVAILABLE: "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer",
  }[status];
  return (
    <button onClick={() => onToggle(seat)} disabled={status === "BOOKED"}
      title={`${seat.seatNumber} · ${seat.seatType}`}
      className={`w-10 h-10 rounded-lg border-2 text-xs font-bold transition-all flex items-center justify-center ${style}`}>
      {seat.seatNumber}
    </button>
  );
};

const SeatMap2X2 = ({ seats, selectedSeats, onToggle }) => {
  const rows = [];
  for (let i = 0; i < seats.length; i += 4) rows.push(seats.slice(i, i + 4));
  return (
    <div className="space-y-2 max-w-[220px] mx-auto">
      <div className="flex items-center gap-1 justify-center mb-1">
        {["W","A","","A","W"].map((l, i) =>
          l ? <div key={i} className="w-10 text-center text-xs text-gray-400 font-medium">{l}</div>
            : <div key={i} className="w-6" />
        )}
      </div>
      {rows.map((row, ri) => (
        <div key={ri} className="flex items-center gap-1 justify-center">
          {row.slice(0,2).map(s => <SeaterBtn key={s.seatId} seat={s} status={getSeatStatus(s,selectedSeats)} onToggle={onToggle} />)}
          <div className="w-6" />
          {row.slice(2,4).map(s => <SeaterBtn key={s.seatId} seat={s} status={getSeatStatus(s,selectedSeats)} onToggle={onToggle} />)}
        </div>
      ))}
    </div>
  );
};

const SeatMap2X3 = ({ seats, selectedSeats, onToggle }) => {
  const rows = [];
  for (let i = 0; i < seats.length; i += 5) rows.push(seats.slice(i, i + 5));
  return (
    <div className="space-y-2 max-w-[270px] mx-auto">
      <div className="flex items-center gap-1 justify-center mb-1">
        {["W","A","","A","M","W"].map((l, i) =>
          l ? <div key={i} className="w-10 text-center text-xs text-gray-400 font-medium">{l}</div>
            : <div key={i} className="w-6" />
        )}
      </div>
      {rows.map((row, ri) => (
        <div key={ri} className="flex items-center gap-1 justify-center">
          {row.slice(0,2).map(s => <SeaterBtn key={s.seatId} seat={s} status={getSeatStatus(s,selectedSeats)} onToggle={onToggle} />)}
          <div className="w-6" />
          {row.slice(2,5).map(s => <SeaterBtn key={s.seatId} seat={s} status={getSeatStatus(s,selectedSeats)} onToggle={onToggle} />)}
        </div>
      ))}
    </div>
  );
};

const SleeperBtn = ({ seat, status, tier, onToggle }) => {
  const available = tier === "lower"
    ? "bg-white border-green-400 text-gray-600 hover:shadow-md cursor-pointer"
    : "bg-white border-green-400 text-gray-600 hover:shadow-md cursor-pointer";
  const style = status === "BOOKED"
    ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-60"
    : status === "SELECTED"
    ? "bg-blue-600 border-blue-700 text-white cursor-pointer"
    : available;
  return (
    <button onClick={() => onToggle(seat)} disabled={status === "BOOKED"}
      title={seat.seatNumber + " - " + (tier === "lower" ? "Lower" : "Upper") + " Berth"}
      style={{ height: "80px" }}
      className={"flex-1 rounded-2xl border-2 transition-all flex flex-col items-center justify-between pt-3 pb-2 px-2 " + style}>
      <span className="text-xs font-bold">{seat.seatNumber}</span>
      <div className={"w-full h-4 rounded-lg " + (status === "SELECTED" ? "bg-blue-300" : status === "BOOKED" ? "bg-gray-300" : "bg-green-200")} />
    </button>
  );
};

const sortNumerically = (berths) =>
  [...berths].sort((a, b) =>
    parseInt((a.seatNumber||"").replace(/\D/g,""),10) - parseInt((b.seatNumber||"").replace(/\D/g,""),10)
  );

const getSeatTier = (seat) => {
  const type = (seat.seatType || seat.seattype || "").toUpperCase();
  if (type === "LOWER") return "lower";
  if (type === "UPPER") return "upper";
  const num = seat.seatNumber || "";
  if (num.startsWith("L")) return "lower";
  if (num.startsWith("U")) return "upper";
  return null;
};

const DeckGrid = ({ berths, tier, selectedSeats, onToggle }) => {
  const rows = [];
  for (let i = 0; i < berths.length; i += 2) rows.push(berths.slice(i, i + 2));
  return (
    <div className="space-y-2">
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-2">
          {row.map(s => <SleeperBtn key={s.seatId} seat={s} status={getSeatStatus(s,selectedSeats)} tier={tier} onToggle={onToggle} />)}
          {row.length === 1 && <div className="flex-1" />}
        </div>
      ))}
    </div>
  );
};

const SeatMapSleeper = ({ seats, selectedSeats, onToggle }) => {
  const lower = sortNumerically(seats.filter(s => getSeatTier(s) === "lower"));
  const upper = sortNumerically(seats.filter(s => getSeatTier(s) === "upper"));
  return (
    <div className="space-y-6 max-w-[280px] mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-purple-200" />
          <span className="text-xs font-bold text-purple-600 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full flex items-center gap-1">
            <i className="ri-subtract-line" /> Lower Berth
          </span>
          <div className="h-px flex-1 bg-purple-200" />
        </div>
        <DeckGrid berths={lower} tier="lower" selectedSeats={selectedSeats} onToggle={onToggle} />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400 px-2">deck separator</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-orange-200" />
          <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full flex items-center gap-1">
            <i className="ri-arrow-up-line" /> Upper Berth
          </span>
          <div className="h-px flex-1 bg-orange-200" />
        </div>
        <DeckGrid berths={upper} tier="upper" selectedSeats={selectedSeats} onToggle={onToggle} />
      </div>
    </div>
  );
};

const PassengerRow = ({ passenger, index, dispatch }) => (
  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
    <div className="flex items-center gap-2 mb-3">
      <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{index + 1}</span>
      <span className="font-semibold text-gray-700 text-sm">
        Seat {passenger.seatNumber}
        <span className="ml-2 text-xs text-gray-400 font-normal">({passenger.seatType})</span>
      </span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Full Name *</label>
        <input type="text" value={passenger.passengerName}
          onChange={e => dispatch(updatePassenger({ seatId: passenger.seatId, field: "passengerName", value: e.target.value }))}
          placeholder="Enter name"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Age *</label>
        <input type="number" value={passenger.passengerAge}
          onChange={e => dispatch(updatePassenger({ seatId: passenger.seatId, field: "passengerAge", value: e.target.value }))}
          placeholder="Age" min={4} max={100}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Gender *</label>
        <select value={passenger.passengerGender}
          onChange={e => dispatch(updatePassenger({ seatId: passenger.seatId, field: "passengerGender", value: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
          <option value="">Select</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
    </div>
  </div>
);

const LockTimerBadge = ({ seconds }) => {
  if (seconds === null) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const urgent = seconds < 120;
  return (
    <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${urgent ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
      <i className={`ri-timer-line ${urgent ? "animate-pulse" : ""}`} />
      Locks expire in {m}:{String(s).padStart(2,"0")}
    </div>
  );
};

const SeatSelection = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector(s => s.auth);
  const { seats, lockedSeatIds, lockTimer, loading: seatsLoading } = useSelector(s => s.seat);
  const { selectedSeats, passengerDetails, bookingLoading, error: bookingError } = useSelector(s => s.booking);

  const scheduleRaw = sessionStorage.getItem("selectedSchedule");
  const schedule = scheduleRaw ? JSON.parse(scheduleRaw) : null;

  const timerRef = useRef(null);
  const bookingRef = useRef(false); 

  useEffect(() => {
    if (!isAuthenticated) { toast.error("Please login to book seats"); navigate("/login"); }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!scheduleId) return;
    dispatch(fetchSeats(scheduleId));
    return () => {
      dispatch(clearSeats());
    };
  }, [scheduleId]); 

  useEffect(() => {
    if (lockTimer !== null && lockTimer > 0) {
      timerRef.current = setInterval(() => dispatch(tickLockTimer()), 1000);
    } else {
      clearInterval(timerRef.current);
      if (lockTimer === 0) toast.warning("Seat locks expired! Please re-select and lock your seats.");
    }
    return () => clearInterval(timerRef.current);
  }, [lockTimer !== null, dispatch]);

 
  useEffect(() => {
    if (bookingError) { toast.error(bookingError); }
  }, [bookingError]);

  const toggleSeat = (seat) => {
    if (seat.booked) return;
    const isSelected = selectedSeats.includes(seat.seatId);
    if (isSelected) {
      if (lockedSeatIds.includes(seat.seatId)) {
        dispatch(unlockSeat(seat.seatId));
        dispatch(removeLocked(seat.seatId));
      }
      dispatch(deselectSeat(seat.seatId));
    } else {
      if (selectedSeats.length >= 6) { toast.warning("Maximum 6 seats per booking"); return; }
      dispatch(selectSeat({ seatId: seat.seatId, seatNumber: seat.seatNumber, seatType: seat.seatType }));
    }
  };

  const handleLockSeats = async () => {
    if (selectedSeats.length === 0) { toast.error("Please select at least one seat"); return; }
    const tolock = selectedSeats.filter(id => !lockedSeatIds.includes(id));
    if (tolock.length === 0) { toast.info("All seats already locked!"); return; }
    let locked = 0;
    for (const seatId of tolock) {
      const result = await dispatch(lockSeat({ seatId, scheduleId: Number(scheduleId) }));
      if (lockSeat.fulfilled.match(result)) locked++;
      else { toast.error(result.payload || "Lock failed"); break; }
    }
    if (locked > 0) toast.success(`${locked} seat(s) locked for 10 minutes!`);
  };

  const validatePassengers = () => {
    for (let i = 0; i < passengerDetails.length; i++) {
      const p = passengerDetails[i];
      if (!p.passengerName.trim() || p.passengerName.trim().length < 2) return `Passenger ${i+1}: Name must be at least 2 characters`;
      if (!p.passengerAge || Number(p.passengerAge) < 4) return `Passenger ${i+1}: Age must be at least 4`;
      if (!p.passengerGender) return `Passenger ${i+1}: Please select gender`;
    }
    return null;
  };

  const handleBooking = async () => {
    if (bookingRef.current) return; 
    if (selectedSeats.length === 0) { toast.error("Select seats first"); return; }
    if (selectedSeats.some(id => !lockedSeatIds.includes(id))) { toast.error("Lock all selected seats first"); return; }
    const err = validatePassengers();
    if (err) { toast.error(err); return; }

    bookingRef.current = true;
    const result = await dispatch(createBooking({
      scheduleId: Number(scheduleId),
      seatIds: selectedSeats,
      passengers: passengerDetails,
    }));

    if (createBooking.fulfilled.match(result)) {
      toast.success("Booking created! Proceeding to payment...");
      navigate("/payment");
    } else {
      bookingRef.current = false; 
    }
  };

  const layout = getBusLayout(schedule?.busType);
  const totalAmount = schedule ? Number(schedule.pricePerSeat) * selectedSeats.length : 0;
  const allLocked = selectedSeats.length > 0 && selectedSeats.every(id => lockedSeatIds.includes(id));

  if (seatsLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin block mb-3" />
        <p className="text-gray-500">Loading seats...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-5 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold">
              <span>{schedule?.sourceCity}</span>
              <i className="ri-arrow-right-line text-blue-200" />
              <span>{schedule?.destinationCity}</span>
            </div>
            <p className="text-blue-200 text-sm mt-0.5 flex flex-wrap items-center gap-3">
              <span><i className="ri-bus-line mr-1" />{schedule?.busName}</span>
              <span>{schedule?.busType?.replace(/_/g," ")}</span>
              <span><i className="ri-calendar-line mr-1" />{formatDate(schedule?.travelDate)}</span>
              <span><i className="ri-time-line mr-1" />{formatTime(schedule?.departureTime)} → {formatTime(schedule?.arrivalTime)}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LockTimerBadge seconds={lockTimer} />
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition">
              <i className="ri-arrow-left-line" /> Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
    
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="ri-seat-line text-blue-600" /> Select Seats
              <span className="ml-auto text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{layout} layout</span>
            </h2>
       
            <div className="flex flex-wrap gap-3 mb-5 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded border bg-white border-gray-300" /><span className="text-gray-500">Available</span></div>
              <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded border bg-blue-600 border-blue-700" /><span className="text-gray-500">Selected</span></div>
              <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded border bg-gray-200 border-gray-300" /><span className="text-gray-500">Booked</span></div>
              {layout === "SLEEPER" ? (
                <>
                  <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded border bg-purple-50 border-purple-200" /><span className="text-gray-500">Lower</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded border bg-orange-50 border-orange-200" /><span className="text-gray-500">Upper</span></div>
                </>
              ) : (
                <span className="text-gray-400">W=Window · A=Aisle{layout === "2X3" ? " · M=Middle" : ""}</span>
              )}
            </div>
            <div className="flex justify-center mb-5">
              <div className="bg-gray-100 text-gray-500 text-xs px-6 py-1.5 rounded-full flex items-center gap-2">
                <i className="ri-steering-2-line" /> Front (Driver)
              </div>
            </div>
            {seats.length === 0
              ? <p className="text-center text-gray-400 py-8">No seats available</p>
              : layout === "SLEEPER" ? <SeatMapSleeper seats={seats} selectedSeats={selectedSeats} onToggle={toggleSeat} />
              : layout === "2X3"    ? <SeatMap2X3 seats={seats} selectedSeats={selectedSeats} onToggle={toggleSeat} />
              : <SeatMap2X2 seats={seats} selectedSeats={selectedSeats} onToggle={toggleSeat} />
            }
          </div>
        </div>

        <div className="lg:w-80 flex flex-col gap-4">
         
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <i className="ri-receipt-line text-blue-600" /> Booking Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Selected seats</span>
                <span className="font-semibold text-gray-800">{selectedSeats.length}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Price per seat</span>
                <span className="font-semibold text-gray-800">₹{Number(schedule?.pricePerSeat || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-800">
                <span>Total</span>
                <span className="text-blue-600 text-lg">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>
            {selectedSeats.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {selectedSeats.map(id => {
                  const seat = seats.find(s => s.seatId === id);
                  return (
                    <span key={id} className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-0.5 ${lockedSeatIds.includes(id) ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                      {lockedSeatIds.includes(id) && <i className="ri-lock-line" />}
                      {seat?.seatNumber}
                    </span>
                  );
                })}
              </div>
            )}
            {selectedSeats.length > 0 && !allLocked && (
              <button onClick={handleLockSeats}
                className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm">
                <i className="ri-lock-line" /> Lock {selectedSeats.length} Seat{selectedSeats.length > 1 ? "s" : ""}
              </button>
            )}
            {allLocked && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-700 flex items-center gap-2">
                <i className="ri-shield-check-line text-base" /> All seats locked for 10 minutes
              </div>
            )}
          </div>

    
          {passengerDetails.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <i className="ri-user-line text-blue-600" /> Passenger Details
              </h3>
              <div className="space-y-3">
                {passengerDetails.map((p, i) => (
                  <PassengerRow key={p.seatId} passenger={p} index={i} dispatch={dispatch} />
                ))}
              </div>
              <button onClick={handleBooking} disabled={bookingLoading || !allLocked}
                className="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm">
                {bookingLoading
                  ? <><i className="ri-loader-4-line animate-spin" /> Creating Booking...</>
                  : <><i className="ri-arrow-right-circle-line" /> Proceed to Payment · ₹{totalAmount.toLocaleString("en-IN")}</>}
              </button>
              {!allLocked && selectedSeats.length > 0 && (
                <p className="text-xs text-orange-500 text-center mt-2 flex items-center justify-center gap-1">
                  <i className="ri-information-line" /> Lock seats first before proceeding
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;