import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearCurrentBooking } from "../redux/bookingSlice";

const formatTime = (t) => {
  if (!t) return "--";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return String(hour12).padStart(2,"0") + ":" + String(m).padStart(2,"0") + " " + ampm;
};

const formatDate = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }) : "--";

const duration = (dep, arr) => {
  if (!dep || !arr) return "--";
  const mins = Math.round((new Date(arr) - new Date(dep)) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};
 
const BookingConfirmation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentBooking: booking } = useSelector(s => s.booking);
  const [schedule, setSchedule] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const rawSchedule = sessionStorage.getItem("selectedSchedule");
    const pId = sessionStorage.getItem("paymentIntentId");

    if (!booking && !initialized) { navigate("/"); return; }

    if (booking) {
      setSchedule(rawSchedule ? JSON.parse(rawSchedule) : null);
      setPaymentId(pId);
      setInitialized(true);
    }
  }, [booking, navigate]);

  if (!booking) return null;

  const b = booking.booking;
  const passengers = booking.passengers || [];

  const handleNewBooking = () => {
    navigate("/");
    dispatch(clearCurrentBooking());
    sessionStorage.removeItem("selectedSchedule");
    sessionStorage.removeItem("paymentIntentId");
  };

  const handleViewBookings = () => {
    navigate("/my-bookings");
    dispatch(clearCurrentBooking());
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-checkbox-circle-fill text-5xl" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-green-100 text-sm">
            Your payment was successful and your seats are booked.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium">
            <i className="ri-ticket-line" /> Booking ID: <span className="font-bold">#{b?.bookingId}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="ri-bus-line text-blue-600" /> Trip Details
          </h2>

          <div className="flex items-center justify-between mb-5">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{b?.sourceCity}</p>
              <p className="text-sm text-gray-400 mt-0.5">{formatTime(b?.departureTime)}</p>
            </div>
            <div className="flex-1 mx-4 flex flex-col items-center gap-1">
              <p className="text-xs text-gray-400">{duration(b?.departureTime, b?.arrivalTime)}</p>
              <div className="w-full flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="flex-1 border-t-2 border-dashed border-gray-300" />
                <i className="ri-bus-fill text-blue-500 text-lg" />
                <div className="flex-1 border-t-2 border-dashed border-gray-300" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{b?.destinationCity}</p>
              <p className="text-sm text-gray-400 mt-0.5">{formatTime(b?.arrivalTime)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "ri-calendar-line", label: "Date", value: formatDate(b?.travelDate) },
              { icon: "ri-bus-2-line", label: "Bus", value: b?.busName },
              { icon: "ri-road-map-line", label: "Type", value: b?.busType?.replace(/_/g, " ") },
              { icon: "ri-money-rupee-circle-line", label: "Amount", value: `₹${Number(b?.totalAmount || 0).toLocaleString("en-IN")}` },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                  <i className={item.icon} /> {item.label}
                </div>
                <p className="font-semibold text-gray-800 text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="ri-group-line text-blue-600" /> Passengers ({passengers.length})
          </h2>
          <div className="space-y-3">
            {passengers.map((p, i) => (
              <div key={p.bookingSeatId}
                className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{p.passengerName}</p>
                    <p className="text-xs text-gray-400">{p.passengerAge} yrs · {p.passengerGender}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                    {p.seatNumber}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{p.seatType}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="ri-secure-payment-line text-blue-600" /> Payment Info
          </h2>
          <div className="space-y-2 text-sm">
            {[
              { label: "Payment Status", value: "SUCCESS", green: true },
              { label: "Booking Status", value: "CONFIRMED", green: true },
              { label: "Amount Paid", value: `₹${Number(b?.totalAmount || 0).toLocaleString("en-IN")}` },
              { label: "Payment ID", value: paymentId ? paymentId.substring(0, 24) + "..." : "--" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-gray-400">{row.label}</span>
                <span className={`font-semibold ${row.green ? "text-green-600" : "text-gray-800"}`}>
                  {row.green && <i className="ri-checkbox-circle-line mr-1" />}
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-sm text-amber-800">
          <i className="ri-information-line text-xl text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Important</p>
            <p>Please arrive at the boarding point at least 15 minutes before departure.
              Carry a valid ID proof along with your booking ID <span className="font-bold">#{b?.bookingId}</span>.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pb-6">
          <button
            onClick={handleViewBookings}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
          >
            <i className="ri-list-check-line" /> View My Bookings
          </button>
          <button
            onClick={handleNewBooking}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl border-2 border-gray-200 transition flex items-center justify-center gap-2"
          >
            <i className="ri-home-line" /> Back to Home
          </button>
        </div>

      </div>
    </div>
  );
};

export default BookingConfirmation;