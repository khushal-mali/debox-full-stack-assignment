import { api } from "@/lib/api";
import { User } from "@/types";

export const authService = {
  login: async (
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (data: {
    email: string;
    password: string;
    role: "MASTER" | "ADMIN";
  }): Promise<User> => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },
};
