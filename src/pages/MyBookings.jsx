import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyBookings, cancelBooking as cancelBookingThunk } from "../redux/bookingSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const formatTime = (t) => {
  if (!t) return "--";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return String(hour12).padStart(2,"0") + ":" + String(m).padStart(2,"0") + " " + ampm;
};

const formatDate = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  }) : "--";

const duration = (dep, arr) => {
  if (!dep || !arr) return "--";
  const [dh, dm] = dep.split(":").map(Number);
  let [ah, am] = arr.split(":").map(Number);
  let depMins = dh * 60 + dm;
  let arrMins = ah * 60 + am;
  if (arrMins < depMins) arrMins += 24 * 60; // overnight trip
  const diff = arrMins - depMins;
  return Math.floor(diff / 60) + "h " + (diff % 60) + "m";
};

const StatusBadge = ({ status, type }) => {
  const map = {
    CONFIRMED: "bg-green-100 text-green-700",
    PENDING:   "bg-yellow-100 text-yellow-700",
    CANCELLED: "bg-red-100 text-red-700",
    SUCCESS:   "bg-green-100 text-green-700",
    FAILED:    "bg-red-100 text-red-700",
    REFUNDED:  "bg-purple-100 text-purple-700",
  };
  const icon = {
    CONFIRMED: "ri-checkbox-circle-line",
    PENDING:   "ri-time-line",
    CANCELLED: "ri-close-circle-line",
    SUCCESS:   "ri-secure-payment-line",
    FAILED:    "ri-error-warning-line",
    REFUNDED:  "ri-refund-2-line",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${map[status] || "bg-gray-100 text-gray-600"}`}>
      <i className={icon[status] || "ri-circle-line"} />
      {status}
    </span>
  );
};

const CancelModal = ({ booking, onConfirm, onClose, loading }) => {
  const [reason, setReason] = useState("");
  const presets = [
    "Change of plans",
    "Wrong date selected",
    "Found a better option",
    "Emergency / personal reason",
    "Other",
  ];

  return (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <i className="ri-close-circle-line text-red-500 text-xl" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">Cancel Booking</h3>
          <p className="text-xs text-gray-400">Booking #{booking?.bookingId}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Are you sure you want to cancel your trip from{" "}
        <span className="font-semibold">{booking?.sourceCity}</span> to{" "}
        <span className="font-semibold">{booking?.destinationCity}</span> on{" "}
        <span className="font-semibold">{formatDate(booking?.travelDate)}</span>?
      </p>

     
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Reason for cancellation *
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {presets.map((p) => (
            <button key={p} onClick={() => setReason(p)}
              className={"text-xs px-3 py-1.5 rounded-full border font-medium transition " +
                (reason === p
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-white text-gray-600 border-gray-200 hover:border-red-300")}>
              {p}
            </button>
          ))}
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Or type your own reason..."
          rows={2}
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 resize-none transition"
        />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-xs text-amber-700 mb-5 flex items-center gap-2">
        <i className="ri-information-line" />
        This action cannot be undone. Refund policy applies.
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} disabled={loading}
          className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">
          Keep Booking
        </button>
        <button onClick={() => onConfirm(reason)} disabled={loading || !reason.trim()}
          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? <><i className="ri-loader-4-line animate-spin" /> Cancelling...</> : <><i className="ri-close-circle-line" /> Cancel Booking</>}
        </button>
      </div>
    </div>
  </div>
  );
};

const BookingCard = ({ booking, onCancel }) => {
  const isCancelled = booking.bookingStatus === "CANCELLED";
  const isPast = new Date(booking.travelDate + "T23:59:59") < new Date();

  return (
    <div className={`bg-white rounded-2xl shadow-sm border transition ${isCancelled ? "border-red-100 opacity-75" : "border-gray-100 hover:shadow-md"}`}>

      <div className="p-5 border-b border-gray-50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <i className="ri-bus-line text-blue-600 text-lg" />
            </div>
            <div>
              <p className="font-bold text-gray-800">{booking.busName}</p>
              <p className="text-xs text-gray-400">{booking.busType?.replace(/_/g, " ")} · #{booking.bookingId}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={booking.bookingStatus} />
            <StatusBadge status={booking.paymentStatus} />
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xl font-bold text-gray-800">{booking.sourceCity}</p>
            <p className="text-sm text-blue-600 font-medium">{formatTime(booking.departureTime)}</p>
          </div>
          <div className="flex-1 mx-3 flex flex-col items-center gap-1">
            <p className="text-xs text-gray-400">{duration(booking.departureTime, booking.arrivalTime)}</p>
            <div className="w-full flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <div className="flex-1 border-t border-dashed border-gray-300" />
              <i className="ri-arrow-right-line text-gray-400 text-xs" />
              <div className="flex-1 border-t border-dashed border-gray-300" />
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-800">{booking.destinationCity}</p>
            <p className="text-sm text-blue-600 font-medium">{formatTime(booking.arrivalTime)}</p>
          </div>
        </div>

       
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <i className="ri-calendar-line text-gray-400" /> {formatDate(booking.travelDate)}
          </span>
          <span className="flex items-center gap-1">
            <i className="ri-money-rupee-circle-line text-gray-400" />
            <span className="font-semibold text-gray-700">₹{Number(booking.totalAmount).toLocaleString("en-IN")}</span>
          </span>
          <span className="flex items-center gap-1">
            <i className="ri-time-line text-gray-400" />
            Booked {new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        </div>

       
        {isCancelled && booking.cancellationReason && (
          <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-xs text-red-600 flex items-center gap-2">
            <i className="ri-information-line" />
            Cancelled by {booking.cancelledBy?.toLowerCase()} — {booking.cancellationReason}
          </div>
        )}
      </div>

     
      {!isCancelled && !isPast && (
        <div className="px-5 pb-4">
          <button
            onClick={() => onCancel(booking)}
            className="w-full py-2 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            <i className="ri-close-circle-line" /> Cancel Booking
          </button>
        </div>
      )}
    </div>
  );
};

const MyBookings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { myBookings: bookings, loading } = useSelector(s => s.booking);
  const [filter, setFilter]             = useState("ALL");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling]     = useState(false);

  useEffect(() => { dispatch(fetchMyBookings()); }, [dispatch]);

  const handleCancelConfirm = async (reason) => {
    if (!cancelTarget) return;
    setCancelling(true);
    const result = await dispatch(cancelBookingThunk({ bookingId: cancelTarget.bookingId, reason }));
    if (cancelBookingThunk.fulfilled.match(result)) {
      toast.success("Booking cancelled successfully");
      setCancelTarget(null);
      dispatch(fetchMyBookings()); 
    } else {
      toast.error(result.payload || "Cancellation failed");
    }
    setCancelling(false);
  };

  const filters = ["ALL", "CONFIRMED", "PENDING", "CANCELLED"];

  const filtered = filter === "ALL"
    ? bookings
    : bookings.filter(b => b.bookingStatus === filter);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin block mb-3" />
        <p className="text-gray-500">Loading your bookings...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

  
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <i className="ri-list-check-line" /> My Bookings
          </h1>
          <p className="text-blue-200 text-sm mt-1">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">

       
        <div className="flex gap-2 mb-5 flex-wrap">
          {filters.map(f => {
            const count = f === "ALL" ? bookings.length : bookings.filter(b => b.bookingStatus === f).length;
            return (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition flex items-center gap-1.5 ${
                  filter === f
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300"
                }`}>
                {f}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f ? "bg-white/20" : "bg-gray-100"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <i className="ri-ticket-line text-5xl text-gray-200 block mb-3" />
            <p className="text-gray-400 font-medium">
              {filter === "ALL" ? "No bookings yet" : `No ${filter.toLowerCase()} bookings`}
            </p>
            {filter === "ALL" && (
              <button onClick={() => navigate("/")}
                className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                Book a Bus
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(b => (
              <BookingCard key={b.bookingId} booking={b} onCancel={setCancelTarget} />
            ))}
          </div>
        )}
      </div>

      {cancelTarget && (
        <CancelModal
          booking={cancelTarget}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
          loading={cancelling}
        />
      )}
    </div>
  );
};

export default MyBookings;