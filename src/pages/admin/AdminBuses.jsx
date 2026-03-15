import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";

const BUS_TYPES = ["AC_SEATER_2X2","NON_AC_SEATER_2X2","AC_SEATER_2X3","NON_AC_SEATER_2X3","AC_SLEEPER","NON_AC_SLEEPER"];
const EMPTY_FORM = { bus_name:"", bus_number:"", bus_type:"", total_seats:"", operator_name:"" };

const AdminBuses = () => {
  const navigate = useNavigate();
  const [buses, setBuses]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editBus, setEditBus]   = useState(null);  
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchBuses = async () => {
    try {
      const res = await api.get("/buses");
      setBuses(res.data?.data || []);
    } catch { toast.error("Failed to load buses"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBuses(); }, []);

  const openAdd  = () => { setForm(EMPTY_FORM); setEditBus(null); setShowForm(true); };
  const openEdit = (bus) => {
    setForm({
      bus_name: bus.busName, bus_number: bus.busNumber,
      bus_type: bus.busType, total_seats: bus.totalSeats,
      operator_name: bus.operatorName,
    });
    setEditBus(bus);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.bus_name || !form.bus_number || !form.bus_type || !form.total_seats || !form.operator_name)
      return toast.error("All fields are required");
    setSaving(true);
    try {
      const payload = { ...form, total_seats: Number(form.total_seats) };
      if (editBus) {
        await api.put(`/update/bus/${editBus.busId}`, payload);
        toast.success("Bus updated!");
      } else {
        await api.post("/add/bus", payload);
        toast.success("Bus added!");
      }
      setShowForm(false);
      fetchBuses();
    } catch (err) {
      toast.error(err.response?.data?.data?.message || "Save failed");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bus?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/delete/bus/${id}`);
      toast.success("Bus deleted!");
      fetchBuses();
    } catch (err) {
      toast.error(err.response?.data?.data?.message || "Delete failed");
    } finally { setDeletingId(null); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold">
              <button onClick={() => navigate("/admin")} className="hover:text-blue-200 transition">
                <i className="ri-arrow-left-line" />
              </button>
              <i className="ri-bus-line" /> Manage Buses
            </div>
            <p className="text-blue-200 text-sm mt-0.5">{buses.length} bus{buses.length !== 1 ? "es" : ""}</p>
          </div>
          <button onClick={openAdd}
            className="bg-white text-blue-600 font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-50 transition flex items-center gap-2">
            <i className="ri-add-line" /> Add Bus
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-16"><i className="ri-loader-4-line text-3xl text-blue-500 animate-spin" /></div>
        ) : buses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <i className="ri-bus-line text-5xl text-gray-200 block mb-2" />
            <p className="text-gray-400">No buses yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["ID","Bus Name","Number","Type","Seats","Operator","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {buses.map(bus => (
                  <tr key={bus.busId} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400">#{bus.busId}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{bus.busName}</td>
                    <td className="px-4 py-3 text-gray-600">{bus.busNumber}</td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        {bus.busType?.replace(/_/g," ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{bus.totalSeats}</td>
                    <td className="px-4 py-3 text-gray-600">{bus.operatorName}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(bus)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                          <i className="ri-edit-line" />
                        </button>
                        <button onClick={() => handleDelete(bus.busId)} disabled={deletingId === bus.busId}
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition disabled:opacity-50">
                          {deletingId === bus.busId ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-delete-bin-line" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800">{editBus ? "Edit Bus" : "Add New Bus"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <i className="ri-close-line text-xl" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: "Bus Name",      key: "bus_name",      placeholder: "e.g. Volvo Express" },
                { label: "Bus Number",    key: "bus_number",    placeholder: "e.g. GJ01AB1234" },
                { label: "Operator Name", key: "operator_name", placeholder: "e.g. GSRTC" },
                { label: "Total Seats",   key: "total_seats",   placeholder: "25–100", type: "number" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
                  <input type={f.type || "text"} value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Bus Type</label>
                <select value={form.bus_type} onChange={e => setForm(p => ({ ...p, bus_type: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white">
                  <option value="">Select type</option>
                  {BUS_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g," ")}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <><i className="ri-loader-4-line animate-spin" /> Saving...</> : <><i className="ri-save-line" /> {editBus ? "Update" : "Add"} Bus</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBuses;