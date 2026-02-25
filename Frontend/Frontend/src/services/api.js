import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token automatically
API.interceptors.request.use((req) => {
  // Try to get token from multiple sources
  let token = localStorage.getItem("token");
  
  // If not found, try from user object
  if (!token) {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        token = userData.token;
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
      }
    }
  }

  // If token found, add it to headers
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;
