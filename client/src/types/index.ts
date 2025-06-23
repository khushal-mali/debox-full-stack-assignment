export interface User {
  _id: string;
  email: string;
  role: "MASTER" | "ADMIN";
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  categories: Category[];
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  products: Product[];
}

export interface Inventory {
  _id: string;
  productId: Product;
  available: number;
  sold: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SignupResponse {
  message: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  role: "Master" | "Admin";
}
