import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { sanitizeFormData } from "../utils/sanitize";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" });

  const onSubmit = async (data) => {
    // ── Layer 1: Frontend sanitization ──────────────────────────────────────
    let sanitized;
    try {
      sanitized = sanitizeFormData({ ...data, age: Number(data.age) });
    } catch (err) {
      toast.error(err.message);
      return; // ← stop here, never reaches backend
    }

    // ── Dispatch only if sanitization passed ────────────────────────────────
    const resultAction = await dispatch(registerUser(sanitized));

    if (registerUser.fulfilled.match(resultAction)) {
      toast.success("Account created! Please login.");
      navigate("/login");
    } else {
      toast.error(resultAction.payload || "Registration failed");
    }
  };

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-blue-200">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-blue-100">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Create Your VasyBus Account
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              {...register("name", {
                required: "Name is required",
                minLength: { value: 2, message: "Minimum 2 characters required" },
                maxLength: { value: 30, message: "Maximum 30 characters allowed" },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
              focus:border-blue-500 placeholder-gray-400 transition"
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter valid email" },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
              focus:border-blue-500 placeholder-gray-400 transition"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^[6-9][0-9]{9}$/,
                  message: "Must start with 6–9 and be exactly 10 digits",
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
              focus:border-blue-500 placeholder-gray-400 transition"
              placeholder="Enter your phone number"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Age
            </label>
            <input
              type="number"
              {...register("age", {
                required: "Age is required",
                min: { value: 10, message: "Minimum age is 10" },
                max: { value: 100, message: "Maximum age is 100" },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
              focus:border-blue-500 placeholder-gray-400 transition"
              placeholder="Enter your age"
            />
            {errors.age && (
              <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Password
            </label>
            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Minimum 8 characters required" },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
              focus:border-blue-500 placeholder-gray-400 transition"
              placeholder="Create a password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold
            hover:bg-blue-700 transition duration-200 disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-center mt-5 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
