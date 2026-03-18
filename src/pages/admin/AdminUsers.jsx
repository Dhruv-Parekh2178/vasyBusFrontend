import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";

const formatDate = (i) =>
  i ? new Date(i).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  }) : "--";

const RoleBadge = ({ role }) => {
  const isAdmin = role === "ROLE_ADMIN" || role === "ADMIN";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
      isAdmin ? "bg-yellow-100 text-yellow-700" : "bg-blue-50 text-blue-600"}`}>
      <i className={isAdmin ? "ri-shield-user-line" : "ri-user-line"} />
      {isAdmin ? "Admin" : "User"}
    </span>
  );
};

const AdminUsers = () => {
  const navigate  = useNavigate();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  useEffect(() => {
    api.get("/admin/users")
      .then(res => {
        setUsers(res.data?.data || []);
      })
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...users];
    if (roleFilter === "ADMIN")
      list = list.filter(u => u.role === "ROLE_ADMIN" || u.role === "ADMIN");
    if (roleFilter === "USER")
      list = list.filter(u => u.role !== "ROLE_ADMIN" && u.role !== "ADMIN");
    if (search.trim())
      list = list.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.includes(search)
      );
    return list;
  }, [users, roleFilter, search]);

  const totalUsers     = users.length;
  const totalAdmins    = users.filter(u => u.role === "ROLE_ADMIN" || u.role === "ADMIN").length;
  const totalPassengers = totalUsers - totalAdmins;

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold">
              <button onClick={() => navigate("/admin")} className="hover:text-blue-200 transition">
                <i className="ri-arrow-left-line" />
              </button>
              <i className="ri-group-line" /> User Management
            </div>
            <p className="text-blue-200 text-sm mt-0.5">
              {totalUsers} users · {totalPassengers} passengers · {totalAdmins} admins
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: "ri-group-line",       label: "Total Users",  value: totalUsers,     color: "bg-blue-500" },
            { icon: "ri-user-line",         label: "Passengers",   value: totalPassengers, color: "bg-green-500" },
            { icon: "ri-shield-user-line",  label: "Admins",       value: totalAdmins,    color: "bg-yellow-500" },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color}`}>
                <i className={`${c.icon} text-white text-lg`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800">{c.value}</p>
                <p className="text-xs text-gray-400">{c.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
         
          <div className="flex gap-2">
            {["ALL", "USER", "ADMIN"].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                  roleFilter === r
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300"}`}>
                {r}
              </button>
            ))}
          </div>
    
          <div className="relative flex-1">
            <i className="ri-search-line absolute left-3 top-2.5 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <i className="ri-loader-4-line text-3xl text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["ID", "Name", "Email", "Phone", "Age", "Role", "Bookings", "Confirmed", "Cancelled", "Joined"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => (
                  <tr key={u.userId} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400">#{u.userId}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800 whitespace-nowrap">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{u.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{u.age}</td>
                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{u.totalBookings}</td>
                    <td className="px-4 py-3">
                      <span className="text-green-600 font-semibold">{u.confirmedBookings}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-red-500 font-semibold">{u.cancelledBookings}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <i className="ri-group-line text-4xl text-gray-200 block mb-2" />
                <p className="text-gray-400">No users found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;