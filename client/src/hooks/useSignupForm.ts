import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SignupCredentials, SignupResponse } from "@/types";
import { signup } from "@/lib/api";
// import { Signup, SignupCredentials, SignupResponse } from "../lib/api";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["Master", "Admin"], { message: "Invalid role" }),
});

type SignupFormData = z.infer<typeof signupSchema>;

export const useSignupForm = () => {
  const router = useRouter();
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", role: "Admin" },
  });

  const signupMutation = useMutation<SignupResponse, Error, SignupCredentials>({
    mutationFn: signup,
    onSuccess: () => {
      router.push("/auth/login");
    },
    onError: (error: any) => {
      form.setError("root", { message: error.response?.data?.error || "Sign-up failed" });
    },
  });

  return { form, signupMutation };
};
