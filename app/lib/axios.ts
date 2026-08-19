// src/lib/axios.ts
import axios from "axios";
import { getOrCreateDeviceId } from "@/app/utils/database/db";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor — attaches X-Device-Id to every outgoing request
axiosInstance.interceptors.request.use(async (config) => {
  const deviceId = await getOrCreateDeviceId();
  config.headers = config.headers || {};
  config.headers["X-Device-Id"] = deviceId;
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const deviceId = await getOrCreateDeviceId();
        const refreshResponse = await axios.post(
          `${API_URL}/api/verify/refresh-token`,
          {},
          {
            withCredentials: true,
            headers: { "X-Device-Id": deviceId },
          }
        );

        if (refreshResponse.data.success) {
          processQueue();
          return axiosInstance(originalRequest);
        } else {
          processQueue(new Error("Refresh token failed"));
          window.location.href = "/auth?session=expired";
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError);
        window.location.href = "/auth?session=expired";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;