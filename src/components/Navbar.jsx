import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);


  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    navigate("/login");
  };

  const isAdmin = user?.role === "ROLE_ADMIN" || user?.role === "ADMIN";

  const navLinks = isAuthenticated
    ? [
        { to: "/",            icon: "ri-home-line",        label: "Home" },
        { to: "/my-bookings", icon: "ri-list-check-line",  label: "My Bookings" },
        ...(isAdmin ? [{ to: "/admin", icon: "ri-shield-user-line", label: "Admin" }] : []),
      ]
    : [
        { to: "/",         icon: "ri-home-line", label: "Home" },
      ];

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">


          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-wide">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="ri-bus-fill text-white text-lg" />
            </div>
            VasyBus
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}
                className={"flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition " +
                  (isActive(link.to)
                    ? "bg-white/20 text-white"
                    : "text-blue-100 hover:bg-white/10 hover:text-white")}>
                <i className={link.icon} />
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link to="/login"
                  className="text-blue-100 hover:text-white text-sm font-medium transition px-3 py-2">
                  Login
                </Link>
                <Link to="/register"
                  className="bg-white text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50 transition">
                  Register
                </Link>
              </>
            ) : (
      
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-white/15 hover:bg-white/25 px-3 py-2 rounded-xl transition">
                  <div className="w-7 h-7 bg-white/30 rounded-full flex items-center justify-center text-sm font-bold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium max-w-[100px] truncate">{user?.name}</span>
                  {isAdmin && (
                    <span className="text-xs bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full font-bold">
                      ADMIN
                    </span>
                  )}
                  <i className={"ri-arrow-down-s-line transition-transform " + (dropdownOpen ? "rotate-180" : "")} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden">
          
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="font-semibold text-gray-800 text-sm">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>

                    <Link to="/my-bookings" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                      <i className="ri-list-check-line text-base" /> My Bookings
                    </Link>

                    <Link to="/profile" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                      <i className="ri-user-line text-base" /> Profile
                    </Link>

                    {isAdmin && (
                      <>
                        <Link to="/admin" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                          <i className="ri-shield-user-line text-base" /> Admin Panel
                        </Link>
                        <Link to="/admin/users" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                          <i className="ri-group-line text-base" /> User Management
                        </Link>
                      </>
                    )}

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
                        <i className="ri-logout-box-r-line text-base" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-white/10 transition">
            <i className={mobileOpen ? "ri-close-line text-xl" : "ri-menu-line text-xl"} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-indigo-800 border-t border-white/10 px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}
              className={"flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition " +
                (isActive(link.to) ? "bg-white/20 text-white" : "text-blue-100 hover:bg-white/10")}>
              <i className={link.icon} /> {link.label}
            </Link>
          ))}

          {!isAuthenticated ? (
            <div className="flex gap-2 pt-2">
              <Link to="/login"
                className="flex-1 text-center py-2.5 rounded-xl border border-white/30 text-sm font-semibold text-white hover:bg-white/10 transition">
                Login
              </Link>
              <Link to="/register"
                className="flex-1 text-center py-2.5 rounded-xl bg-white text-blue-600 text-sm font-semibold hover:bg-blue-50 transition">
                Register
              </Link>
            </div>
          ) : (
            <div className="pt-2 border-t border-white/10 mt-2 space-y-1">
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-blue-200">{user?.email}</p>
                </div>
              </div>
              <Link to="/profile"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-blue-100 hover:bg-white/10 transition">
                <i className="ri-user-line" /> Profile
              </Link>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-300 hover:bg-white/10 transition">
                <i className="ri-logout-box-r-line" /> Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;