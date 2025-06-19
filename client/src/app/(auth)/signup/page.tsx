"use client";

import { SignupForm } from "@/components/auth/signup-form";
import { useAuth } from "@/hooks/use-auth";

export default function SignupPage() {
  const { user } = useAuth();

  if (user?.role !== "MASTER") {
    return (
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Access Denied</h1>
        <p className="text-center">Only Master users can register new users.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
      <SignupForm />
    </div>
  );
}
