import axios from "axios";
import { getItemInLocalStorage } from "../utils/localStorage";

const vibeAuth = axios.create({
  baseURL: "https://vibecopilot.ai",
});

vibeAuth.interceptors.request.use(
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

export default vibeAuth;
