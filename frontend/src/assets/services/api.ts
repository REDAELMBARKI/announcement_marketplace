
import axios from "axios";
import route from "../../utils/route";
import { Product } from "../../types/Product";

export const getProducts = async (): Promise<Product[]> => {
  const res = await axios.get(route('announcements.all').toString());
  return res.data;
};

export const getProduct = async (id: number): Promise<Product> => {
  const res = await axios.get(route('announcements.show', { id }).toString());
  return res.data;
};

export const getMyProducts = async (token: string): Promise<Product[]> => {
  // We need user ID for this route, or we can use a generic my-products route if it exists
  // For now using user.announcements as an example
  const res = await axios.get(route('user.announcements', { userId: 'me' }).toString(), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.data;
};

export const updateProduct = async (
  id: number,
  data: Partial<Product>,
  token: string
) => {
  return axios.put(route('announcements.update-status', { announcementId: id }).toString(), data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};