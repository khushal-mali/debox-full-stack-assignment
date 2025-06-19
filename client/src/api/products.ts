import { api } from "@/lib/api";
import { Product } from "@/types";

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get("/products");
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    description: string;
    price: number;
    categoryIds: string[];
  }): Promise<Product> => {
    const response = await api.post("/products", data);
    return response.data;
  },

  update: async (
    id: string,
    data: {
      name: string;
      description: string;
      price: number;
      categoryIds: string[];
    }
  ): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};
