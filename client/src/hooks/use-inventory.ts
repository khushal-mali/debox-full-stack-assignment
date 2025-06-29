import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryService } from "@/api/inventory";
import { Inventory } from "@/types";
import { toast } from "sonner";

export function useInventory() {
  const queryClient = useQueryClient();

  const inventoryQuery = useQuery<Inventory[]>({
    queryKey: ["inventory"],
    queryFn: inventoryService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: { productId: string; available: number; sold: number }) =>
      inventoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Inventory created successfully");
    },
    onError: () => {
      toast.error("Failed to create inventory");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { productId: string; available: number; sold: number };
    }) => inventoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Inventory updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update inventory");
      console.log("use-inventory:", new Error().stack?.split("\n")[1].trim(), error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => inventoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Inventory deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete inventory");
    },
  });

  return {
    inventories: inventoryQuery.data || [],
    isLoading: inventoryQuery.isLoading,
    createInventory: createMutation.mutate,
    updateInventory: updateMutation.mutate,
    deleteInventory: deleteMutation.mutate,
  };
}
