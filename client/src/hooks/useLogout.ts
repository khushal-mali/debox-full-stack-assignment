import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api";
import { clearAuthData } from "@/lib/auth";

export const useLogout = () => {
  const router = useRouter();

  return useMutation<void, Error>({
    mutationFn: logout,
    onSuccess: () => {
      clearAuthData();
      router.push("/auth/login");
    },
    onError: (error: any) => {
      console.error("Logout failed:", error);
      throw new Error("Logout failed");
    },
  });
};
