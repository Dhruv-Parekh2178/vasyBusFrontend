import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { logout } from "../redux/authSlice";
import api from "../utils/api";

const Profile = () => {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAdmin = user?.role === "ROLE_ADMIN" || user?.role === "ADMIN";

  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [form, setForm]         = useState({ name: "", phone: "" });

  useEffect(() => {
    api.get("/users/profile")
      .then(res => {
        
        const p = res.data?.data;
        setProfile(p);
        setForm({ name: p.name, phone: p.phone });
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  
  const handleSave = async () => {
    if (!form.name.trim() || form.name.trim().length < 2)
      return toast.error("Name must be at least 2 characters");
    if (!/^[6-9]\d{9}$/.test(form.phone))
      return toast.error("Phone must start with 6-9 and be exactly 10 digits");

    setSaving(true);
    try {
      const res = await api.put("/users/profile", {
        name: form.name.trim(),
        phone: form.phone,
      });
      
      const updated = res.data?.data;
      setProfile(updated);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-10 px-4">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            {profile?.name?.charAt(0)?.toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold">{profile?.name}</h1>
          <p className="text-blue-200 text-sm mt-1">{profile?.email}</p>
          {isAdmin && (
            <span className="mt-2 inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
              <i className="ri-shield-user-line" /> Admin
            </span>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <i className="ri-user-line text-blue-600" /> Account Info
            </h2>
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-semibold transition">
                <i className="ri-edit-line" /> Edit
              </button>
            ) : (
              <button onClick={() => { setEditing(false); setForm({ name: profile.name, phone: profile.phone }); }}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 font-semibold transition">
                <i className="ri-close-line" /> Cancel
              </button>
            )}
          </div>

          <div className="space-y-3">
         
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <i className="ri-user-3-line text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">Full Name</p>
                {editing ? (
                  <input type="text" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-1.5 border-2 border-blue-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-blue-500"
                    placeholder="Enter your name" />
                ) : (
                  <p className="font-semibold text-gray-800 text-sm">{profile?.name}</p>
                )}
              </div>
            </div>

            
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <i className="ri-phone-line text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">Phone Number</p>
                {editing ? (
                  <input type="tel" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    maxLength={10}
                    className="w-full px-3 py-1.5 border-2 border-blue-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-blue-500"
                    placeholder="10-digit phone number" />
                ) : (
                  <p className="font-semibold text-gray-800 text-sm">{profile?.phone}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                <i className="ri-mail-line text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-0.5">Email Address</p>
                <p className="font-semibold text-gray-800 text-sm">{profile?.email}</p>
              </div>
              <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">Read only</span>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                <i className="ri-calendar-line text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-0.5">Age</p>
                <p className="font-semibold text-gray-800 text-sm">{profile?.age} years</p>
              </div>
            </div>

         
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center shrink-0">
                <i className="ri-shield-line text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-0.5">Role</p>
                <p className="font-semibold text-gray-800 text-sm">{isAdmin ? "Administrator" : "Passenger"}</p>
              </div>
            </div>
          </div>

          
          {editing && (
            <button onClick={handleSave} disabled={saving}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
              {saving
                ? <><i className="ri-loader-4-line animate-spin" /> Saving...</>
                : <><i className="ri-save-line" /> Save Changes</>}
            </button>
          )}
        </div>

      
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex items-center gap-3 text-sm">
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
            <i className="ri-calendar-check-line text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Member Since</p>
            <p className="font-semibold text-gray-700">
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                : "--"}
            </p>
          </div>
        </div>

      
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="ri-links-line text-blue-600" /> Quick Links
          </h2>
          <div className="space-y-2">
            {[
              { icon: "ri-list-check-line", label: "My Bookings",  sub: "View all your trips",   path: "/my-bookings", color: "blue"   },
              { icon: "ri-home-line",        label: "Book a Bus",   sub: "Search for new routes", path: "/",            color: "green"  },
              ...(isAdmin ? [{ icon: "ri-shield-user-line", label: "Admin Panel", sub: "Manage buses & bookings", path: "/admin", color: "purple" }] : []),
            ].map(item => (
              <button key={item.path} onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition text-left group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${item.color}-100`}>
                  <i className={`${item.icon} text-${item.color}-600 text-lg`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
                <i className="ri-arrow-right-s-line text-gray-300 group-hover:text-gray-500 transition" />
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleLogout}
          className="w-full bg-white border-2 border-red-200 text-red-500 hover:bg-red-50 font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 mb-6">
          <i className="ri-logout-box-r-line text-lg" /> Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;