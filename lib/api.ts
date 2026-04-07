// lib/api.ts
import axios from "axios";
import { BASE_API_URL, APP_KEY } from "@/global";
import { getCookie } from "@/lib/client-cookies";

export const api = axios.create({
  baseURL: BASE_API_URL,
});

// Inject token & app-key otomatis di setiap request
api.interceptors.request.use((config) => {
  const token = getCookie("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["App-Key"] = APP_KEY;
  return config;
});
