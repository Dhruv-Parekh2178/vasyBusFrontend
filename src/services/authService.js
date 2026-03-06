import { logout } from "../redux/authSlice";
import api from "../utils/api";

const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

const login = async (userData) => {
  const response = await api.post("/auth/login", userData);
  return response.data;
};

const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};


const authService = {
  register,
  login,
  logoutUser,
};

export default authService;