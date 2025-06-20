"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpload } from "@/hooks/use-upload";

export function CSVUpload() {
  const [file, setFile] = useState<File | null>(null);
  const { uploadCSV } = useUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!file) return;
      uploadCSV(file);
      setFile(null);
    } catch (error) {
      console.log("csv-upload:", new Error().stack?.split("\n")[1].trim(), error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Upload CSV File</label>
        <Input type="file" accept=".csv" onChange={handleFileChange} />
      </div>
      <Button type="submit" disabled={!file}>
        Upload
      </Button>
    </form>
  );
}
