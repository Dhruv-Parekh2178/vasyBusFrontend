import api from "../utils/api";

const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

const login = async (userData) => {
  const response = await api.post("/auth/login", userData);
  return response.data;
};

const authService = {
  register,
  login,
};

export default authService;