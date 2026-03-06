import { create } from "zustand";
import { api } from "@/lib/api";
import { Admin } from "@/types/admin";

interface AuthState {
  admin: Admin | null;
  fetchAdmin: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,

  fetchAdmin: async () => {
    const res = await api.get<{ data: Admin }>("/admins/me");

    set({
      admin: res.data.data,
    });
  },
}));
