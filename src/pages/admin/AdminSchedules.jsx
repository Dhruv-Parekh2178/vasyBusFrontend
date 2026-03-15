import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";

const EMPTY_FORM = { bus_id:"", route_id:"", departure_time:"", arrival_time:"", travel_date:"", price_per_seat:"" };


const toUTCString = (localDT) => {
  if (!localDT) return "";
  const d = new Date(localDT);
  return d.getUTCFullYear() + "-" +
    String(d.getUTCMonth()+1).padStart(2,"0") + "-" +
    String(d.getUTCDate()).padStart(2,"0") + " " +
    String(d.getUTCHours()).padStart(2,"0") + ":" +
    String(d.getUTCMinutes()).padStart(2,"0") + ":00";
};

const formatTime = (i) =>
  i ? new Date(i).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true }) : "--";
const formatDate = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "--";

const AdminSchedules = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses]         = useState([]);
  const [routes, setRoutes]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editSched, setEditSched] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchAll = async () => {
    try {
      const [s, b, r] = await Promise.all([
        api.get("/schedules"),
        api.get("/buses"),
        api.get("/routes"),
      ]);
      setSchedules(s.data?.data || []);
      setBuses(b.data?.data || []);
      setRoutes(r.data?.data || []);
    } catch { toast.error("Failed to load data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setEditSched(null); setShowForm(true); };

  const handleSave = async () => {
    if (!form.bus_id || !form.route_id || !form.departure_time || !form.arrival_time || !form.travel_date || !form.price_per_seat)
      return toast.error("All fields are required");
    setSaving(true);
    try {
      const payload = {
        bus_id: Number(form.bus_id),
        route_id: Number(form.route_id),
        departure_time: toUTCString(form.departure_time),
        arrival_time:   toUTCString(form.arrival_time),
        travel_date:    form.travel_date,
        price_per_seat: Number(form.price_per_seat),
      };
      if (editSched) {
        await api.put(`/update/schedule/${editSched.scheduleId}`, payload);
        toast.success("Schedule updated!");
      } else {
        await api.post("/add/schedule", payload);
        toast.success("Schedule added!");
      }
      setShowForm(false); fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.data?.message || "Save failed");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this schedule? All associated seats will also be removed.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/delete/schedule/${id}`);
      toast.success("Schedule deleted!"); fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.data?.message || "Delete failed");
    } finally { setDeletingId(null); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold">
              <button onClick={() => navigate("/admin")} className="hover:text-blue-200 transition">
                <i className="ri-arrow-left-line" />
              </button>
              <i className="ri-calendar-line" /> Manage Schedules
            </div>
            <p className="text-blue-200 text-sm mt-0.5">{schedules.length} schedule{schedules.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={openAdd}
            className="bg-white text-blue-600 font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-50 transition flex items-center gap-2">
            <i className="ri-add-line" /> Add Schedule
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-16"><i className="ri-loader-4-line text-3xl text-blue-500 animate-spin" /></div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["ID","Bus","Route","Date","Departure","Arrival","Price","Status","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {schedules.map(s => (
                  <tr key={s.scheduleId} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400">#{s.scheduleId}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{s.busName}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.sourceCity} → {s.destinationCity}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(s.travelDate)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatTime(s.departureTime)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatTime(s.arrivalTime)}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">₹{Number(s.pricePerSeat).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.scheduleStatus === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {s.scheduleStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(s.scheduleId)} disabled={deletingId === s.scheduleId}
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition disabled:opacity-50">
                        {deletingId === s.scheduleId ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-delete-bin-line" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {schedules.length === 0 && <p className="text-center text-gray-400 py-8">No schedules yet</p>}
          </div>
        )}
      </div>

      {/* Add Schedule Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800">Add New Schedule</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <i className="ri-close-line text-xl" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Bus</label>
                <select value={form.bus_id} onChange={e => setForm(p => ({...p, bus_id: e.target.value}))}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white">
                  <option value="">Select bus</option>
                  {buses.map(b => <option key={b.busId} value={b.busId}>{b.busName} ({b.busType?.replace(/_/g," ")})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Route</label>
                <select value={form.route_id} onChange={e => setForm(p => ({...p, route_id: e.target.value}))}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white">
                  <option value="">Select route</option>
                  {routes.map(r => <option key={r.routeId} value={r.routeId}>{r.sourceCity} → {r.destinationCity} ({r.distanceKm}km)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Travel Date</label>
                <input type="date" value={form.travel_date} onChange={e => setForm(p => ({...p, travel_date: e.target.value}))}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Departure Time (local)</label>
                <input type="datetime-local" value={form.departure_time} onChange={e => setForm(p => ({...p, departure_time: e.target.value}))}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Arrival Time (local)</label>
                <input type="datetime-local" value={form.arrival_time} onChange={e => setForm(p => ({...p, arrival_time: e.target.value}))}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Price per Seat (₹)</label>
                <input type="number" value={form.price_per_seat} onChange={e => setForm(p => ({...p, price_per_seat: e.target.value}))}
                  placeholder="e.g. 850"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-700 flex items-start gap-2">
                <i className="ri-information-line mt-0.5" />
                Times are entered in your local timezone and converted to UTC automatically.
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <><i className="ri-loader-4-line animate-spin" /> Saving...</> : <><i className="ri-save-line" /> Add Schedule</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchedules;