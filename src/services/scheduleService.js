import api from "../utils/api";
 
const getCitySuggestions = (query) =>
  api.get(`/routes/cities?query=${encodeURIComponent(query)}`);
 
const searchSchedules = (source, destination, travelDate) =>
  api.get("/schedules/search", {
    params: { source, destination, travelDate },
  });
 
const scheduleService = { getCitySuggestions, searchSchedules };
export default scheduleService;