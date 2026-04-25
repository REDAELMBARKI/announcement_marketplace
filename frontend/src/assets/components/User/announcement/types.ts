export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface Media {
  id: number;
  file_path?: string;
  path?: string;
  url?: string;
  collection?: string;
  is_temporary: boolean;
  mediable_id: number;
  mediable_type: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface ProductItem {
  id: number;
  product_id: number;
  item_name: string;
  item_condition: string;
  item_gender: string;
  recommended_age: string;
  item_brand?: string;
  item_material?: string;
  item_season?: string;
  item_quantity: number;
  item_sizes: string[];
  item_colors: string[];
}

export interface Product {
  id: number;
  user_id: number;
  super_category_id: number;
  listing_mode: 'sell' | 'donate';
  listing_type: 'single' | 'collection';
  title: string;
  description?: string;
  price?: string | number;
  currency: string;
  price_negotiable: boolean;
  pickup_address?: string;
  contact_phone?: string | null;
  handover_method: 'pickup' | 'delivery' | 'both';
  status: 'draft' | 'active' | 'sell' | 'donate' | 'reserved' | 'sold' | 'donated' | 'closed';
  condition: string;
  gender: string;
  age_range: string;
  brand?: string;
  season?: string;
  sizes?: string[];
  colors?: string[];
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
  thumbnail?: Media;
  gallery?: Media[];
  user?: User;
  categories?: Category[];
  items?: ProductItem[];
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  [key: string]: any;
}
