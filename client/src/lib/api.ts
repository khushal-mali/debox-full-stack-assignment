import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  LoginResponse,
  SignupResponse,
  LoginCredentials,
  SignupCredentials,
} from "../types";

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response: AxiosResponse<LoginResponse> = await api.post(
    "/auth/login",
    credentials
  );
  return response.data;
};

export const signup = async (credentials: SignupCredentials): Promise<SignupResponse> => {
  const response: AxiosResponse<SignupResponse> = await api.post(
    "/auth/signup",
    credentials
  );
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};
