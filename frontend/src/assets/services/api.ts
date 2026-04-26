
import axios from "axios";
import route from "../../utils/route";
import { Product } from "../../types/Product";

export const getProducts = async (): Promise<Product[]> => {
  const res = await axios.get(route('announcements.all').toString());
  return res.data;
};

export const getProduct = async (slug: string): Promise<Product> => {
  const res = await axios.get(route('announcements.show', { announcement: slug }).toString());
  return res.data;
};

export const getMyProducts = async (userSlug: string, token: string): Promise<Product[]> => {
  const res = await axios.get(route('users.announcements', { user: userSlug }).toString(), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.data;
};

export const updateProduct = async (
  userSlug: string,
  announcementSlug: string,
  data: Partial<Product>,
  token: string
) => {
  return axios.put(route('users.announcements.update-status', { user: userSlug, announcement: announcementSlug }).toString(), data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};