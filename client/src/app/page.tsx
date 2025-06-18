"use client";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/useLogout";
import { getUserEmail, getUserRole } from "@/lib/auth";
import React, { useEffect, useState } from "react";

const DashboardPage: React.FC = () => {
  const { mutate, isPending } = useLogout();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserEmail(getUserEmail());
    setUserRole(getUserRole());
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <p className="mb-4">
        Welcome, {userEmail || "User"} ({userRole || "Unknown"})
      </p>
      <Button onClick={() => mutate()} disabled={isPending}>
        {isPending ? "Logging out..." : "Logout"}
      </Button>
    </div>
  );
};

export default DashboardPage;
