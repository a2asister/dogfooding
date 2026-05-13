export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: { id: number; name: string };
  seller: { id: number; username: string; avatar?: string };
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Favorite {
  id: number;
  product: Product;
  createdAt: string;
}
