export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Sneakers' | 'Tops' | 'Jeans';
  image: string;
  description: string;
  sizes: string[];
  reviews: Review[];
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
}

export interface CartItem extends Product {
  selectedSize: string;
  quantity: number;
}

export interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  searchQuery: string;
}

export type OrderStatus = 'Pending' | 'Paid' | 'Failed';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  date: string;
  customer: {
    name: string;
    email: string;
    address: string;
  };
}