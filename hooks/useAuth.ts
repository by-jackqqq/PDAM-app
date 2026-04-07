import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { BASE_API_URL } from "@/global";

interface LoginPayload {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  role: "admin" | "customer";
  user: {
    id: number;
    name: string;
    username: string;
    role: "admin" | "customer";
  };
}

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<LoginResponse>(
        `${BASE_API_URL}/auth/login`,
        payload,
      );

      const { token, role, user } = response.data;

      // Simpan token & role ke cookie (expires 1 hari)
      Cookies.set("token", token, { expires: 1 });
      Cookies.set("role", role, { expires: 1 });

      // Simpan data user ke localStorage untuk akses di client
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect berdasarkan role
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/customer");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Login gagal. Periksa username dan password.",
        );
      } else {
        setError("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const getUser = () => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  };

  return { login, logout, getUser, loading, error };
}
