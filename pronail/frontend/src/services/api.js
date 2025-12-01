import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://wa0swcochl.execute-api.us-east-1.amazonaws.com';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (email, password) => api.post("/login", { email, password }),
  register: (email, password, role) =>
    api.post("/users", { email, password, role }),
};

export const userService = {
  getCurrentUser: () => api.get("/users/me"),
  register: (userData) => api.post("/register", userData),
};

export const technicianService = {
  getTechnicians: () => api.get("/technicians"),
  getTechnician: (id) => api.get(`/technicians/${id}`),
  createTechnician: (data) => api.post("/technicians", data),
  updateTechnician: (id, data) => api.put(`/technicians/${id}`, data),
  deleteTechnician: (id) => api.delete(`/technicians/${id}`),
};

export const clientService = {
  getClients: () => api.get("/clients"),
  getClient: (id) => api.get(`/clients/${id}`),
  createClient: (data) => api.post("/clients", data),
  updateClient: (id, data) => api.put(`/clients/${id}`, data),
  deleteClient: (id) => api.delete(`/clients/${id}`),
};

export const bookingService = {
  getBookings: () => api.get("/bookings"),
  getBooking: (id) => api.get(`/bookings/${id}`),
  createBooking: (data) => api.post("/bookings", data),
  updateBooking: (id, data) => api.put(`/bookings/${id}`, data),
  deleteBooking: (id) => api.delete(`/bookings/${id}`),
};


export const aiInteractionService = {
  virtualAssistant: (query, userId) =>
    api.post("/ai-interactions/virtual-assistant", { query, userId }),
  getAIInteractions: (params) => api.get("/ai-interactions", params),
  getAIInteraction: (id) => api.get(`/ai-interactions/${id}`),
  createAIInteraction: (data) => api.post("/ai-interactions", data)
};

export default api;
