import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";

const formatTime = (i) =>
  i ? new Date(i).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true }) : "--";
const formatDate = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "--";

const StatusBadge = ({ status }) => {
  const map = {
    CONFIRMED:"bg-green-100 text-green-700", PENDING:"bg-yellow-100 text-yellow-700",
    CANCELLED:"bg-red-100 text-red-700", SUCCESS:"bg-green-100 text-green-700",
    FAILED:"bg-red-100 text-red-700",
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] || "bg-gray-100 text-gray-500"}`}>{status}</span>;
};

const AdminBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("ALL");
  const [search, setSearch]       = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling]     = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/admin/bookings");
      setBookings(res.data?.data || []);
    } catch { toast.error("Failed to load bookings"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async () => {
    if (!cancelReason.trim()) return toast.error("Please enter a reason");
    setCancelling(true);
    try {
      const encoded = encodeURIComponent(cancelReason.trim());
      await api.put(`/admin/bookings/${cancelTarget.bookingId}/cancel?reason=${encoded}`);
      toast.success("Booking cancelled!");
      setCancelTarget(null); setCancelReason("");
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.data?.message || "Cancellation failed");
    } finally { setCancelling(false); }
  };

  const filters = ["ALL","CONFIRMED","PENDING","CANCELLED"];
  const filtered = bookings
    .filter(b => filter === "ALL" || b.bookingStatus === filter)
    .filter(b =>
      !search ||
      b.userName?.toLowerCase().includes(search.toLowerCase()) ||
      b.busName?.toLowerCase().includes(search.toLowerCase()) ||
      b.sourceCity?.toLowerCase().includes(search.toLowerCase()) ||
      b.destinationCity?.toLowerCase().includes(search.toLowerCase()) ||
      String(b.bookingId).includes(search)
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-lg font-bold">
            <button onClick={() => navigate("/admin")} className="hover:text-blue-200 transition">
              <i className="ri-arrow-left-line" />
            </button>
            <i className="ri-ticket-line" /> Manage Bookings
          </div>
          <p className="text-blue-200 text-sm mt-0.5">{bookings.length} total booking{bookings.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex gap-2 flex-wrap">
            {filters.map(f => {
              const count = f === "ALL" ? bookings.length : bookings.filter(b => b.bookingStatus === f).length;
              return (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold transition flex items-center gap-1.5 ${
                    filter === f ? "bg-blue-600 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300"}`}>
                  {f} <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f ? "bg-white/20" : "bg-gray-100"}`}>{count}</span>
                </button>
              );
            })}
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <i className="ri-search-line absolute left-3 top-2.5 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, bus, city, ID..."
              className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16"><i className="ri-loader-4-line text-3xl text-blue-500 animate-spin" /></div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["ID","User","Bus","Route","Date","Amount","Booking","Payment","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(b => (
                  <tr key={b.bookingId} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400">#{b.bookingId}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{b.userName}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{b.busName}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{b.sourceCity} → {b.destinationCity}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(b.travelDate)}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">₹{Number(b.totalAmount).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.bookingStatus} /></td>
                    <td className="px-4 py-3"><StatusBadge status={b.paymentStatus} /></td>
                    <td className="px-4 py-3">
                      {b.bookingStatus !== "CANCELLED" && (
                        <button onClick={() => { setCancelTarget(b); setCancelReason(""); }}
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition" title="Cancel booking">
                          <i className="ri-close-circle-line" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-gray-400 py-8">No bookings found</p>}
          </div>
        )}
      </div>

      {cancelTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <i className="ri-close-circle-line text-red-500 text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Cancel Booking #{cancelTarget.bookingId}</h3>
                <p className="text-xs text-gray-400">{cancelTarget.userName} · {cancelTarget.sourceCity} → {cancelTarget.destinationCity}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Reason (required)
              </label>
              <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                rows={3}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCancelTarget(null)} disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm">
                Keep
              </button>
              <button onClick={handleCancel} disabled={cancelling || !cancelReason.trim()}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2">
                {cancelling ? <><i className="ri-loader-4-line animate-spin" /> Cancelling...</> : <><i className="ri-close-circle-line" /> Cancel Booking</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;