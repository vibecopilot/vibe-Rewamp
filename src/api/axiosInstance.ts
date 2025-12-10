import axios from "axios";
import { getItemInLocalStorage } from "../utils/localStorage";

const axiosInstance = axios.create({
  // baseURL: "http://13.215.74.38",
  baseURL: "https://admin.vibecopilot.ai",
  // baseURL: "http://localhost:3000",
});

axiosInstance.interceptors.request.use(
  (authenticate) => {
    const token = getItemInLocalStorage<string>("TOKEN");
    if (token) {
      authenticate.headers["Authorization"] = `${token}`;
    }
    return authenticate;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
