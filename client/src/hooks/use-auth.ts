import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/api/auth";
import { User } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const userQuery = useQuery<User | null>({
    queryKey: ["user"],
    queryFn: () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      if (token && user) {
        return JSON.parse(user);
      }
      return null;
    },
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: ({ user, token }) => {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      queryClient.setQueryData(["user"], user);
      toast.success("Logged in successfully");
      router.push("/products");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
      toast.success("Logged out successfully");
      router.push("/login");
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && userQuery.data) {
      logoutMutation.mutate();
    }
  }, [userQuery.data]);

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
