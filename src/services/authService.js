import api from "../utils/api";

const register = (userData) => api.post("/auth/register", userData);
const login    = (userData) => api.post("/auth/login", userData);
const logoutUser = ()       => api.post("/auth/logout");

const authService = { register, login, logoutUser };
export default authService;