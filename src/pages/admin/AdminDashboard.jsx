import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const StatCard = ({ icon, label, value, sub, color, onClick }) => (
  <button onClick={onClick}
    className={"bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-left w-full transition " +
      (onClick ? "hover:shadow-md hover:border-blue-200 cursor-pointer" : "cursor-default")}>
    <div className="flex items-start justify-between mb-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <i className={`${icon} text-xl text-white`} />
      </div>
      {onClick && <i className="ri-arrow-right-s-line text-gray-300 text-lg mt-1" />}
    </div>
    <p className="text-2xl font-bold text-gray-800">
      {value !== null && value !== undefined
        ? value
        : <span className="text-gray-200 animate-pulse">--</span>}
    </p>
    <p className="text-sm text-gray-400 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-gray-300 mt-0.5">{sub}</p>}
  </button>
);


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/dashboard/stats")
      .then(res => {
     
        setStats(res.data?.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const s = stats;

  const mainCards = [
    { icon: "ri-bus-line",        label: "Total Buses",      value: s?.totalBuses,     color: "bg-blue-500",   path: "/admin/buses" },
    { icon: "ri-road-map-line",   label: "Total Routes",     value: s?.totalRoutes,    color: "bg-green-500",  path: "/admin/routes" },
    { icon: "ri-calendar-line",   label: "Total Schedules",  value: s?.totalSchedules, color: "bg-purple-500", path: "/admin/schedules" },
    { icon: "ri-group-line",      label: "Total Users",      value: s?.totalUsers,     color: "bg-cyan-500",   path: null },
  ];

  const bookingCards = [
    { icon: "ri-ticket-line",          label: "Total Bookings",     value: s?.totalBookings,     color: "bg-orange-500", path: "/admin/bookings" },
    { icon: "ri-checkbox-circle-line", label: "Confirmed",          value: s?.confirmedBookings, color: "bg-green-500",  path: "/admin/bookings" },
    { icon: "ri-time-line",            label: "Pending",            value: s?.pendingBookings,   color: "bg-yellow-500", path: "/admin/bookings" },
    { icon: "ri-close-circle-line",    label: "Cancelled",          value: s?.cancelledBookings, color: "bg-red-500",    path: "/admin/bookings" },
  ];

  const revenueCards = [
    {
      icon: "ri-money-rupee-circle-line",
      label: "Revenue Today",
      value: s?.revenueToday != null ? "₹" + Number(s.revenueToday).toLocaleString("en-IN") : null,
      sub: `${s?.bookingsToday ?? "--"} bookings today`,
      color: "bg-emerald-500",
      path: null,
    },
    {
      icon: "ri-bar-chart-line",
      label: "Total Revenue",
      value: s?.revenueTotal != null ? "₹" + Number(s.revenueTotal).toLocaleString("en-IN") : null,
      sub: "All confirmed payments",
      color: "bg-indigo-500",
      path: null,
    },
  ];

  const quickActions = [
    { icon: "ri-bus-2-line",      label: "Manage Buses",     sub: "Add, edit, delete buses",     path: "/admin/buses",     color: "text-blue-600 bg-blue-50" },
    { icon: "ri-road-map-line",   label: "Manage Routes",    sub: "Add, edit, delete routes",    path: "/admin/routes",    color: "text-green-600 bg-green-50" },
    { icon: "ri-calendar-2-line", label: "Manage Schedules", sub: "Create and manage schedules", path: "/admin/schedules", color: "text-purple-600 bg-purple-50" },
    { icon: "ri-list-check-2",    label: "Manage Bookings",  sub: "View and cancel bookings",    path: "/admin/bookings",  color: "text-orange-600 bg-orange-50" },
    { icon: "ri-group-line",       label: "User Management",  sub: "View all registered users",   path: "/admin/users",     color: "text-cyan-600 bg-cyan-50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">


      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <i className="ri-shield-user-line" /> Admin Dashboard
            </h1>
            <p className="text-blue-200 text-sm mt-1">Welcome back! Here's your VasyBus overview.</p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-sm">
              <i className="ri-loader-4-line animate-spin" /> Loading stats...
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">


        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mainCards.map(c => (
              <StatCard key={c.label} {...c} onClick={c.path ? () => navigate(c.path) : null} />
            ))}
          </div>
        </div>

      
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Bookings</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bookingCards.map(c => (
              <StatCard key={c.label} {...c} onClick={c.path ? () => navigate(c.path) : null} />
            ))}
          </div>
        </div>

        
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Revenue</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {revenueCards.map(c => (
              <StatCard key={c.label} {...c} onClick={null} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="ri-flashlight-line text-blue-600" /> Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map(a => (
              <button key={a.path} onClick={() => navigate(a.path)}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition text-left group">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${a.color}`}>
                  <i className={`${a.icon} text-xl`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{a.label}</p>
                  <p className="text-xs text-gray-400">{a.sub}</p>
                </div>
                <i className="ri-arrow-right-s-line text-gray-300 group-hover:text-blue-400 transition" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;