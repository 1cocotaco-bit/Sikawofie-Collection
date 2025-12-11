import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Order } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

interface ShopContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  isCartOpen: boolean;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (isOpen: boolean) => void;
  placeOrder: (orderData: Omit<Order, 'id' | 'date' | 'status'>) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Admin Actions
  const addProduct = (product: Product) => {
    setProducts((prev) => [...prev, product]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter(p => p.id !== id));
  };

  // Cart Actions
  const addToCart = (product: Product, size: string) => {
    setCart((prev) => {
      const existingItem = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existingItem) {
        return prev.map(item => 
          (item.id === product.id && item.selectedSize === size)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, selectedSize: size, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart((prev) => prev.filter(item => !(item.id === productId && item.selectedSize === size)));
  };

  const updateCartQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) => prev.map(item => 
      (item.id === productId && item.selectedSize === size)
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => setCart([]);
  const toggleCart = (isOpen: boolean) => setIsCartOpen(isOpen);

  const placeOrder = (orderData: Omit<Order, 'id' | 'date' | 'status'>) => {
    const newOrder: Order = {
      ...orderData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      status: 'Paid', // Simulating successful payment immediately
    };
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
  };

  return (
    <ShopContext.Provider value={{
      products,
      cart,
      orders,
      isCartOpen,
      addProduct,
      updateProduct,
      deleteProduct,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleCart,
      placeOrder
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};