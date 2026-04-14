export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string | null;
  price_lkr: number;
  image_url: string | null;
  image_urls: string[];
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
};
