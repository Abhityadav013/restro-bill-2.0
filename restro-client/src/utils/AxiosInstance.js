import axios from "axios";
import { base_url } from "../utils/apiList";

// Create an axios instance
const axiosInstance = axios.create({
  baseURL: base_url,
});

// Add a request interceptor to include the token dynamically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token"); // Get the token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Attach the token dynamically
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); // Handle errors
  }
);

export default axiosInstance;

  