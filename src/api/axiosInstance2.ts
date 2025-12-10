import axios from "axios";

const axiosInstance2 = axios.create({
  //  baseURL: "http://13.215.74.38",
  baseURL: "https://admin.vibecopilot.ai",
  // Use proxy in development, direct URL in production
  //   baseURL: import.meta.env.DEV ? "/api" : "http://localhost:3000",
  // baseURL: "https://app.myciti.life",
  // baseURL: "http://localhost:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosInstance2.interceptors.request.use(
  (authenticate) => {
    // Don't add Authorization header for axiosInstance2 - token is passed as query param
    console.log("AxiosInstance2 Request headers:", authenticate.headers);
    return authenticate;
  },
  (error) => {
    console.error("AxiosInstance2 Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
axiosInstance2.interceptors.response.use(
  (response) => {
    console.log("AxiosInstance2 Response received:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("AxiosInstance2 Response error:", error);
    if (error.response) {
      console.error("Error status:", error.response.status);
      console.error("Error data:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance2;
