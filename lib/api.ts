import axios from "axios";
import { getCookie } from "./client-cookies";
import { BASE_API_URL, APP_KEY } from "@/global";

export const api = axios.create({
  baseURL: BASE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = getCookie("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["App-Key"] = APP_KEY;

  return config;
});
