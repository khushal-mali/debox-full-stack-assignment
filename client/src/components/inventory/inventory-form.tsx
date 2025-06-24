"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Inventory } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import { useProducts } from "@/hooks/use-products";
import { useInventory } from "@/hooks/use-inventory";

const formSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  available: z.number().min(0, "Quantity must be non-negative"),
  sold: z.number().min(0, "Sold must be non-negative"),
});

type InventoryFormProps = {
  inventory?: Inventory;
  onSuccess: () => void;
};

export function InventoryForm({ inventory, onSuccess }: InventoryFormProps) {
  const { products } = useProducts();
  const { createInventory, updateInventory } = useInventory();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: inventory?.productId._id || "",
      available: inventory?.available || 0,
      sold: inventory?.sold || 0,
    },
  });

  useEffect(() => {
    if (inventory) {
      form.reset({
        productId: inventory.productId._id,
        available: inventory.available,
        sold: inventory.sold,
      });
    }
  }, [inventory, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (inventory) {
      updateInventory({ id: inventory._id, data: values });
    } else {
      createInventory(values);
    }
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product._id} value={product._id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="available"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Available</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter available quantity"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sold</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter quantity"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {inventory ? "Update Inventory" : "Create Inventory"}
        </Button>
      </form>
    </Form>
  );
}
