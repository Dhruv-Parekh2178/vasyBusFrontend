import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";

const Profile = () => {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAdmin = user?.role === "ROLE_ADMIN" || user?.role === "ADMIN";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-10 px-4">
        <div className="max-w-xl mx-auto text-center">
          
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold">{user?.name}</h1>
          <p className="text-blue-200 text-sm mt-1">{user?.email}</p>
          {isAdmin && (
            <span className="mt-2 inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
              <i className="ri-shield-user-line" /> Admin
            </span>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="ri-user-line text-blue-600" /> Account Info
          </h2>
          <div className="space-y-3">
            {[
              { icon: "ri-user-3-line",  label: "Full Name", value: user?.name },
              { icon: "ri-mail-line",    label: "Email",     value: user?.email },
              { icon: "ri-shield-line",  label: "Role",      value: isAdmin ? "Administrator" : "Passenger" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className={row.icon + " text-blue-600"} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{row.label}</p>
                  <p className="font-semibold text-gray-800 text-sm">{row.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="ri-links-line text-blue-600" /> Quick Links
          </h2>
          <div className="space-y-2">
            {[
              { icon: "ri-list-check-line", label: "My Bookings",   sub: "View all your trips",    path: "/my-bookings", color: "blue" },
              { icon: "ri-home-line",        label: "Book a Bus",    sub: "Search for new routes",  path: "/",            color: "green" },
              ...(isAdmin ? [
                { icon: "ri-shield-user-line", label: "Admin Panel", sub: "Manage buses & bookings", path: "/admin", color: "purple" }
              ] : []),
            ].map((item) => (
              <button key={item.path} onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition text-left group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${item.color}-100`}>
                  <i className={item.icon + ` text-${item.color}-600 text-lg`} />
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
          className="w-full bg-white border-2 border-red-200 text-red-500 hover:bg-red-50 font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2">
          <i className="ri-logout-box-r-line text-lg" /> Logout
        </button>

      </div>
    </div>
  );
};

export default Profile;