import axios from "axios";
import { getItemInLocalStorage } from "../utils/localStorage";

const HrmsAuth = axios.create({
  // baseURL: "https://13.126.205.205/",
  baseURL: "https://api.hrms.vibecopilot.ai/",
});

HrmsAuth.interceptors.request.use(
  (config) => {
    const token = getItemInLocalStorage<string>("VIBETOKEN");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default HrmsAuth;
