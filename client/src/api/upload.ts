import { api } from "@/lib/api";

export const uploadService = {
  uploadCSV: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);
    await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
