import axios from "axios";
import { supabase } from "../lib/supabase";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:4000/api",
});

http.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

export default http;
