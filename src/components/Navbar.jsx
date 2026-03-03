import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        <Link to="/" className="text-2xl font-bold tracking-wide">
          VasyBus
        </Link>

        <div className="space-x-6 flex items-center">

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="hover:text-blue-200 transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-white text-blue-600 px-4 py-1.5 rounded-lg font-semibold hover:bg-blue-100 transition"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="font-medium">
                Hi, {user?.name}
              </span>

              <button
                onClick={handleLogout}
                className="bg-white text-blue-600 px-4 py-1.5 rounded-lg font-semibold hover:bg-blue-100 transition"
              >
                Logout
              </button>
            </>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;