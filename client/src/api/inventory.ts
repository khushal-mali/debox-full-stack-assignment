import { api } from "@/lib/api";
import { Inventory } from "@/types";

export const inventoryService = {
  getAll: async (): Promise<Inventory[]> => {
    const response = await api.get("/inventory");
    console.log(response.data);
    return response.data;
  },

  getById: async (id: string): Promise<Inventory> => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  create: async (data: {
    productId: string;
    available: number;
    sold: number;
  }): Promise<Inventory> => {
    const response = await api.post("/inventory", data);
    return response.data;
  },

  update: async (
    id: string,
    data: {
      productId: string;
      available: number;
      sold: number;
    }
  ): Promise<Inventory> => {
    const response = await api.put(`/inventory/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/inventory/${id}`);
  },
};
