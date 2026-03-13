import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import SearchResults from "./pages/SearchResult";
import SeatSelection from "./pages/SeatSelection";
import ProtectedRoute from "./components/ProtectedRoute"; 

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
         <Route path="/search-results" element={<SearchResults />} />
          <Route path="/seat-selection/:scheduleId" element={
          <ProtectedRoute><SeatSelection /></ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

export default App;