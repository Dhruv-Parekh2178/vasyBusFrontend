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


function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"                           element={<Home />} />
        <Route path="/register"                   element={<Register />} />
        <Route path="/login"                      element={<Login />} />
        <Route path="/search-results"             element={<SearchResults />} />
        <Route path="/seat-selection/:scheduleId" element={<ProtectedRoute><SeatSelection /></ProtectedRoute>} />
        <Route path="/payment"                    element={<ProtectedRoute><Payment /></ProtectedRoute>} />
         <Route path="/booking-confirmation"       element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
           <Route path="/my-bookings"                element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;