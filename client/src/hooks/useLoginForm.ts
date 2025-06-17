import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { setAuthData } from "@/lib/auth";
import { LoginCredentials, LoginResponse } from "@/types";
import { login } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const useLoginForm = () => {
  const router = useRouter();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: login,
    onSuccess: ({ token, user }) => {
      setAuthData(token, user);
      router.push("/dashboard");
    },
    onError: (error: any) => {
      form.setError("root", { message: error.response?.data?.error || "Login failed" });
    },
  });

  return { form, loginMutation };
};
