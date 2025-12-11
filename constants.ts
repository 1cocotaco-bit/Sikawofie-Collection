import { Product } from './types';

export const CATEGORIES = ['All', 'Sneakers', 'Tops', 'Jeans'];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Gold Rush High-Tops',
    price: 150.00,
    category: 'Sneakers',
    image: 'https://picsum.photos/id/103/500/500',
    description: 'Premium leather sneakers with gold accents. Perfect for making a statement.',
    sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'],
    reviews: [{ id: 'r1', user: 'Kwame', rating: 5, comment: 'Best shoes I own!' }]
  },
  {
    id: '2',
    name: 'Midnight Denim Jacket',
    price: 120.00,
    category: 'Tops',
    image: 'https://picsum.photos/id/1005/500/500',
    description: 'Dark wash denim jacket suitable for all seasons. Durable and stylish.',
    sizes: ['S', 'M', 'L', 'XL'],
    reviews: []
  },
  {
    id: '3',
    name: 'Distressed Urban Jeans',
    price: 90.00,
    category: 'Jeans',
    image: 'https://picsum.photos/id/342/500/500',
    description: 'Streetwear style distressed jeans with a comfortable fit.',
    sizes: ['30', '32', '34', '36'],
    reviews: [{ id: 'r2', user: 'Ama', rating: 4, comment: 'Great fit, slightly long.' }]
  },
  {
    id: '4',
    name: 'Sika Classic Tee',
    price: 45.00,
    category: 'Tops',
    image: 'https://picsum.photos/id/435/500/500',
    description: 'Essential cotton tee with the signature Sikawofie logo.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    reviews: []
  },
  {
    id: '5',
    name: 'Velvet Run Sneakers',
    price: 135.00,
    category: 'Sneakers',
    image: 'https://picsum.photos/id/21/500/500',
    description: 'Soft texture running shoes that combine luxury with athletics.',
    sizes: ['US 8', 'US 9', 'US 10'],
    reviews: []
  },
  {
    id: '6',
    name: 'Slim Fit Chinos',
    price: 85.00,
    category: 'Jeans',
    image: 'https://picsum.photos/id/177/500/500',
    description: 'Versatile pants that look like jeans but feel like heaven.',
    sizes: ['30', '32', '34'],
    reviews: []
  }
];

export const MOCK_PAYSTACK_KEY = "pk_test_xxxxxxxxxxxxxxxxxxxx"; // Dummy key for display
