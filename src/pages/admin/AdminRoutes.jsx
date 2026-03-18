import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";

const EMPTY_FORM = { source_city:"", destination_city:"", distance_km:"", estimated_time:"" };

const AdminRoutes = () => {
  const navigate = useNavigate();
  const [routes, setRoutes]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRoute, setEditRoute] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch]         = useState("");

  const fetchRoutes = async () => {
    try {
      const res = await api.get("/routes");
      setRoutes(res.data?.data || []);
    } catch { toast.error("Failed to load routes"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRoutes(); }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setEditRoute(null); setShowForm(true); };
  const openEdit = (r) => {
    setForm({ source_city: r.sourceCity, destination_city: r.destinationCity,
              distance_km: r.distanceKm, estimated_time: r.estimatedTime });
    setEditRoute(r); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.source_city || !form.destination_city || !form.distance_km || !form.estimated_time)
      return toast.error("All fields are required");
    setSaving(true);
    try {
      const payload = { ...form, distance_km: Number(form.distance_km) };
      if (editRoute) {
        await api.put(`/update/route/${editRoute.routeId}`, payload);
        toast.success("Route updated!");
      } else {
        await api.post("/add/route", payload);
        toast.success("Route added!");
      }
      setShowForm(false); fetchRoutes();
    } catch (err) {
      toast.error(err.response?.data?.data?.message || "Save failed");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this route?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/delete/route/${id}`);
      toast.success("Route deleted!"); fetchRoutes();
    } catch (err) {
      toast.error(err.response?.data?.data?.message || "Delete failed");
    } finally { setDeletingId(null); }
  };

  const filtered = routes.filter(r =>
    r.sourceCity?.toLowerCase().includes(search.toLowerCase()) ||
    r.destinationCity?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold">
              <button onClick={() => navigate("/admin")} className="hover:text-blue-200 transition">
                <i className="ri-arrow-left-line" />
              </button>
              <i className="ri-road-map-line" /> Manage Routes
            </div>
            <p className="text-blue-200 text-sm mt-0.5">{routes.length} route{routes.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={openAdd}
            className="bg-white text-blue-600 font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-50 transition flex items-center gap-2">
            <i className="ri-add-line" /> Add Route
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
       
        <div className="relative mb-4">
          <i className="ri-search-line absolute left-3 top-3 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by city..."
            className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white" />
        </div>

        {loading ? (
          <div className="text-center py-16"><i className="ri-loader-4-line text-3xl text-blue-500 animate-spin" /></div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["ID","From","To","Distance","Est. Time","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(r => (
                  <tr key={r.routeId} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400">#{r.routeId}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{r.sourceCity}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{r.destinationCity}</td>
                    <td className="px-4 py-3 text-gray-500">{r.distanceKm} km</td>
                    <td className="px-4 py-3 text-gray-500">{r.estimatedTime}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(r)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                          <i className="ri-edit-line" />
                        </button>
                        <button onClick={() => handleDelete(r.routeId)} disabled={deletingId === r.routeId}
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition disabled:opacity-50">
                          {deletingId === r.routeId ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-delete-bin-line" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-gray-400 py-8">No routes found</p>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800">{editRoute ? "Edit Route" : "Add New Route"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <i className="ri-close-line text-xl" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: "Source City",      key: "source_city",      placeholder: "e.g. Ahmedabad" },
                { label: "Destination City", key: "destination_city", placeholder: "e.g. Surat" },
                { label: "Distance (km)",    key: "distance_km",      placeholder: "e.g. 265", type: "number" },
                { label: "Est. Time (HH:mm)",key: "estimated_time",   placeholder: "e.g. 04:30" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
                  <input type={f.type || "text"} value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <><i className="ri-loader-4-line animate-spin" /> Saving...</> : <><i className="ri-save-line" /> {editRoute ? "Update" : "Add"} Route</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoutes;