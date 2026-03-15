import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const StatCard = ({ icon, label, value, color, onClick }) => (
  <button onClick={onClick}
    className={"bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 w-full text-left hover:shadow-md transition " + (onClick ? "cursor-pointer" : "")}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <i className={`${icon} text-2xl text-white`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value ?? <span className="text-gray-300 animate-pulse">--</span>}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  </button>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ buses: null, routes: null, schedules: null, bookings: null });

  useEffect(() => {

    Promise.allSettled([
      api.get("/buses"),
      api.get("/routes"),
      api.get("/schedules"),
      api.get("/admin/bookings"),
    ]).then(([buses, routes, schedules, bookings]) => {
      setStats({
        buses:     buses.status     === "fulfilled" ? (buses.value.data?.data?.length     ?? 0) : "Err",
        routes:    routes.status    === "fulfilled" ? (routes.value.data?.data?.length    ?? 0) : "Err",
        schedules: schedules.status === "fulfilled" ? (schedules.value.data?.data?.length ?? 0) : "Err",
        bookings:  bookings.status  === "fulfilled" ? (bookings.value.data?.data?.length  ?? 0) : "Err",
      });
    });
  }, []);

  const cards = [
    { icon: "ri-bus-line",         label: "Total Buses",     value: stats.buses,     color: "bg-blue-500",   path: "/admin/buses" },
    { icon: "ri-road-map-line",    label: "Total Routes",    value: stats.routes,    color: "bg-green-500",  path: "/admin/routes" },
    { icon: "ri-calendar-line",    label: "Total Schedules", value: stats.schedules, color: "bg-purple-500", path: "/admin/schedules" },
    { icon: "ri-ticket-line",      label: "Total Bookings",  value: stats.bookings,  color: "bg-orange-500", path: "/admin/bookings" },
  ];

  const quickActions = [
    { icon: "ri-bus-2-line",       label: "Manage Buses",     sub: "Add, edit, delete buses",          path: "/admin/buses",     color: "text-blue-600 bg-blue-50" },
    { icon: "ri-road-map-line",    label: "Manage Routes",    sub: "Add, edit, delete routes",         path: "/admin/routes",    color: "text-green-600 bg-green-50" },
    { icon: "ri-calendar-2-line",  label: "Manage Schedules", sub: "Add, edit, delete schedules",      path: "/admin/schedules", color: "text-purple-600 bg-purple-50" },
    { icon: "ri-list-check-2",     label: "Manage Bookings",  sub: "View and cancel any booking",      path: "/admin/bookings",  color: "text-orange-600 bg-orange-50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
     
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <i className="ri-shield-user-line" /> Admin Dashboard
          </h1>
          <p className="text-blue-200 text-sm mt-1">Manage your VasyBus operations</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map(c => (
            <StatCard key={c.label} icon={c.icon} label={c.label} value={c.value}
              color={c.color} onClick={() => navigate(c.path)} />
          ))}
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