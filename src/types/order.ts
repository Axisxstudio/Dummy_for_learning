export type Order = {
  id: string;
  email: string;
  stripe_session_id: string; // used as payment reference id
  total_amount: number;
  status: string;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};
