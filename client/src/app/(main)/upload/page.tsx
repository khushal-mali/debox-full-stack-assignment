"use client";

import { useAuth } from "@/hooks/use-auth";
import { CSVUpload } from "@/components/upload/csv-upload";
import { redirect } from "next/navigation";

export default function UploadPage() {
  const { user } = useAuth();

  if (!user || user.role !== "MASTER") {
    redirect("/products");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">CSV Bulk Upload</h1>
      <CSVUpload />
    </div>
  );
}
