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
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import { useCategories } from "@/hooks/use-categories";
import { useProducts } from "@/hooks/use-products";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be non-negative"),
  stock: z.number().min(0, "Stock must be non-negative"),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
});

type ProductFormProps = {
  product?: Product;
  onSuccess: () => void;
};

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { categories } = useCategories();
  const { createProduct, updateProduct } = useProducts();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      stock: product?.stock || 0,
      categoryIds: product?.categories.map((cat) => cat._id) || [],
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        categoryIds: product.categories.map((cat) => cat._id),
      });
    }
  }, [product, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (product) {
      updateProduct({ id: product._id, data: values });
    } else {
      createProduct(values);
    }
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter product description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter price"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="1"
                  placeholder="Enter price"
                  min={"0"}
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => field.onChange([...field.value, value])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <div className="mt-2">
                {field.value.map((id) => {
                  const category = categories.find((cat) => cat._id === id);
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center px-2 py-1 mr-2 mb-2 bg-secondary text-secondary-foreground rounded"
                    >
                      {category?.name}
                      <button
                        type="button"
                        onClick={() =>
                          field.onChange(field.value.filter((catId) => catId !== id))
                        }
                        className="ml-2 text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {product ? "Update Product" : "Create Product"}
        </Button>
      </form>
    </Form>
  );
}
