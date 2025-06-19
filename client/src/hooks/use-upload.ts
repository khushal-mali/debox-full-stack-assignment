import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadService } from "@/api/upload";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useUpload() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadService.uploadCSV(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("CSV uploaded successfully");
      router.refresh(); // Refresh page to reflect new data
    },
    onError: (error) => {
      console.log("use-upload:", new Error().stack?.split("\n")[1].trim(), error.stack);
      toast.error(error.message || "Failed to upload CSV");
    },
  });

  return {
    uploadCSV: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
  };
}
