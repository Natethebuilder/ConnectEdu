import axios from "axios";
import { supabase } from "../lib/supabase";

const baseURL = import.meta.env.VITE_API_BASE;
if (!baseURL) {
  console.error("❌ VITE_API_BASE is not set!");
}

const http = axios.create({
  baseURL: baseURL || "http://localhost:3000", // fallback for development
  timeout: 10000, // 10 second default timeout
});

http.interceptors.request.use(async (config) => {
  try {
    if (!config) return config;
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) {
      if (!config.headers) {
        config.headers = {} as any;
      }
      config.headers.Authorization = `Bearer ${data.session.access_token}`;
    }
  } catch (err) {
    console.error("❌ HTTP interceptor error:", err);
  }
  return config;
});

// Add response interceptor to handle auth errors
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error("❌ 401 Unauthorized");
      await supabase.auth.signOut();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default http;
