import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import SearchResults from "./pages/SearchResult";
import SeatSelection from "./pages/SeatSelection";
import Payment from "./pages/Payment";
import ProtectedRoute from "./components/ProtectedRoute";
import BookingConfirmation from "./pages/BookingConfirmation";
import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminBuses from "./pages/admin/AdminBuses";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRoutes from "./pages/admin/AdminRoutes";
import AdminSchedules from "./pages/admin/AdminSchedules";
import AdminRoute from "./components/AdminRoute";
import AdminUsers from "./pages/admin/AdminUsers";


function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/seat-selection/:scheduleId" element={<ProtectedRoute><SeatSelection /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
         <Route path="/booking-confirmation" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
           <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
             <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />


             //admin routes 
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/buses" element={<AdminRoute><AdminBuses /></AdminRoute>} />
        <Route path="/admin/routes" element={<AdminRoute><AdminRoutes /></AdminRoute>} />
        <Route path="/admin/schedules" element={<AdminRoute><AdminSchedules /></AdminRoute>} />
        <Route path="/admin/bookings" element={<AdminRoute><AdminBookings /></AdminRoute>} />
         <Route path="/admin/users"       element={<AdminRoute><AdminUsers /></AdminRoute>} />
      </Routes>
    </>
  );
}

export default App;