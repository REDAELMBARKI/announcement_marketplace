
import { Product } from "../../types/Product";

const API = "http://127.0.0.1:8000/api";

export const getProducts = async (): Promise<Product[]> => {
  const res = await fetch(`${API}/products`);
  return res.json();
};

export const getProduct = async (id: number): Promise<Product> => {
  const res = await fetch(`${API}/products/${id}`);
  return res.json();
};

export const getMyProducts = async (token: string): Promise<Product[]> => {
  const res = await fetch(`${API}/my-products`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.json();
};

export const updateProduct = async (
  id: number,
  data: Partial<Product>,
  token: string
) => {
  return fetch(`${API}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
};