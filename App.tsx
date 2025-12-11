import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ShopProvider, useShop } from './context/ShopContext';
import { CATEGORIES } from './constants';
import { Product, FilterState } from './types';
import { getStylistAdvice } from './services/geminiService';

// --- ICONS (Simple SVGs) ---
const Icons = {
  Cart: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
  User: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Menu: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  Close: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Sparkles: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
};

// --- COMPONENTS ---

// 1. Navigation
const Navbar = () => {
  const { cart, toggleCart } = useShop();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-brand-black hover:text-brand-gold">
              <Icons.Menu />
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-serif font-bold tracking-wider">
              SIKAWOFIE<span className="text-brand-gold">.</span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-brand-darkGray hover:text-brand-gold uppercase text-sm tracking-widest font-medium transition">Home</Link>
            <Link to="/shop" className="text-brand-darkGray hover:text-brand-gold uppercase text-sm tracking-widest font-medium transition">Shop</Link>
            <Link to="/admin" className="text-brand-darkGray hover:text-brand-gold uppercase text-sm tracking-widest font-medium transition">Admin</Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-6">
            <button onClick={() => toggleCart(true)} className="relative p-2 text-brand-black hover:text-brand-gold transition">
              <Icons.Cart />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-brand-gold rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-gold">Home</Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-gold">Shop</Link>
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-gold">Admin</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

// 2. Cart Drawer
const CartSidebar = () => {
  const { cart, isCartOpen, toggleCart, removeFromCart, updateCartQuantity } = useShop();
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => toggleCart(false)}></div>
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-serif font-bold text-brand-black">Your Bag</h2>
            <button onClick={() => toggleCart(false)} className="text-gray-400 hover:text-gray-500">
              <Icons.Close />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <Icons.Cart />
                <p className="mt-4">Your cart is empty.</p>
                <Link to="/shop" onClick={() => toggleCart(false)} className="mt-4 text-brand-gold font-medium hover:underline">Start Shopping</Link>
              </div>
            ) : (
              <ul className="space-y-6">
                {cart.map((item) => (
                  <li key={`${item.id}-${item.selectedSize}`} className="flex py-2">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover object-center" />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>{item.name}</h3>
                          <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{item.category} - Size {item.selectedSize}</p>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <div className="flex items-center border border-gray-300 rounded">
                           <button className="px-2 py-1 hover:bg-gray-100" onClick={() => updateCartQuantity(item.id, item.selectedSize, item.quantity - 1)}>-</button>
                           <span className="px-2">{item.quantity}</span>
                           <button className="px-2 py-1 hover:bg-gray-100" onClick={() => updateCartQuantity(item.id, item.selectedSize, item.quantity + 1)}>+</button>
                        </div>
                        <button type="button" onClick={() => removeFromCart(item.id, item.selectedSize)} className="font-medium text-red-500 hover:text-red-700">Remove</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-gray-100 p-6">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                <p>Subtotal</p>
                <p>${cartTotal.toFixed(2)}</p>
              </div>
              <p className="mt-0.5 text-sm text-gray-500 mb-6">Shipping and taxes calculated at checkout.</p>
              <Link to="/checkout" onClick={() => toggleCart(false)} className="flex items-center justify-center rounded-none border border-transparent bg-brand-black px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-brand-gold transition-colors">
                Checkout
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 3. Product Card
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="group relative">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-sm bg-gray-200 lg:aspect-none group-hover:opacity-90 transition-opacity lg:h-80">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover object-center lg:h-full lg:w-full" />
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">
            <Link to={`/product/${product.id}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-gray-500">{product.category}</p>
        </div>
        <p className="text-sm font-medium text-brand-black">${product.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

// 4. Gemini Stylist Chat
const GeminiStylist = () => {
  const { products } = useShop();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: "Hi! I'm Sika, your personal AI stylist. Ask me anything about our collection!" }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!query.trim()) return;
    const userMsg = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const advice = await getStylistAdvice(userMsg, products, messages);
    setMessages(prev => [...prev, { role: 'ai', content: advice }]);
    setLoading(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-brand-gold text-white p-4 rounded-full shadow-lg hover:bg-yellow-600 transition transform hover:scale-105"
      >
        <Icons.Sparkles />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-lg shadow-2xl z-40 flex flex-col border border-gray-200 max-h-[500px]">
          <div className="bg-brand-black text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-serif font-bold flex items-center gap-2"><Icons.Sparkles /> Sika AI Stylist</h3>
            <button onClick={() => setIsOpen(false)}><Icons.Close /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 h-80">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 text-sm ${m.role === 'user' ? 'bg-brand-gold text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-gray-500 italic">Sika is typing...</div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t bg-white rounded-b-lg flex gap-2">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for outfit ideas..." 
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-gold"
            />
            <button onClick={handleSend} disabled={loading} className="bg-brand-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50">Send</button>
          </div>
        </div>
      )}
    </>
  );
};

// --- PAGES ---

// 1. Home
const Home = () => {
  const { products } = useShop();
  const featured = products.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <div className="relative bg-gray-900 text-white">
        <div className="absolute inset-0">
          <img className="w-full h-full object-cover opacity-60" src="https://picsum.photos/id/1059/1600/900" alt="Hero" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold font-serif tracking-tight sm:text-5xl lg:text-6xl mb-6">
            Elegance is not standing out,<br />but being remembered.
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto">
            Discover the Sikawofie Collection. Premium streetwear tailored for the bold.
          </p>
          <div className="mt-10">
            <Link to="/shop" className="inline-block bg-brand-gold border border-transparent py-3 px-8 text-base font-medium text-white hover:bg-yellow-600 transition duration-300">
              Shop Collection
            </Link>
          </div>
        </div>
      </div>

      {/* Featured */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-brand-black">Featured Arrivals</h2>
          <div className="w-24 h-1 bg-brand-gold mx-auto mt-4"></div>
        </div>
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Categories Banner */}
      <div className="bg-brand-gray py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Sneakers', 'Tops', 'Jeans'].map((cat) => (
              <div key={cat} className="relative h-64 group overflow-hidden cursor-pointer">
                 <Link to={`/shop?category=${cat}`}>
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition"></div>
                    <img src={`https://picsum.photos/seed/${cat}/600/400`} alt={cat} className="w-full h-full object-cover transition transform group-hover:scale-110 duration-700" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-3xl font-bold text-white tracking-widest uppercase">{cat}</h3>
                    </div>
                 </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Shop
const Shop = () => {
  const { products } = useShop();
  const location = useLocation();
  const [filter, setFilter] = useState<FilterState>({
    category: 'All',
    minPrice: 0,
    maxPrice: 1000,
    searchQuery: ''
  });

  // Parse query param for initial category
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const cat = searchParams.get('category');
    if (cat && CATEGORIES.includes(cat)) {
      setFilter(prev => ({ ...prev, category: cat }));
    }
  }, [location.search]);

  const filteredProducts = products.filter(p => {
    const matchesCategory = filter.category === 'All' || p.category === filter.category;
    const matchesPrice = p.price >= filter.minPrice && p.price <= filter.maxPrice;
    const matchesSearch = p.name.toLowerCase().includes(filter.searchQuery.toLowerCase());
    return matchesCategory && matchesPrice && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
            <h3 className="text-lg font-bold mb-4 font-serif">Filters</h3>
            
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-brand-gold"
                  value={filter.searchQuery}
                  onChange={(e) => setFilter({...filter, searchQuery: e.target.value})}
                />
                <div className="absolute left-2.5 top-2.5 text-gray-400">
                  <Icons.Search />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="font-medium mb-2 text-sm uppercase tracking-wide text-gray-500">Category</h4>
              <ul className="space-y-2">
                {CATEGORIES.map(cat => (
                  <li key={cat}>
                    <button 
                      onClick={() => setFilter({...filter, category: cat})}
                      className={`text-sm ${filter.category === cat ? 'text-brand-gold font-bold' : 'text-gray-600 hover:text-brand-gold'}`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price */}
            <div>
              <h4 className="font-medium mb-2 text-sm uppercase tracking-wide text-gray-500">Max Price: ${filter.maxPrice}</h4>
              <input 
                type="range" 
                min="0" 
                max="500" 
                value={filter.maxPrice} 
                onChange={(e) => setFilter({...filter, maxPrice: Number(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-gold"
              />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <h1 className="text-2xl font-serif font-bold mb-6">{filter.category} Collection</h1>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No products found matching your criteria.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 3. Product Details
const ProductDetails = () => {
  const { id } = useParams();
  const { products, addToCart } = useShop();
  const product = products.find(p => p.id === id);
  const [selectedSize, setSelectedSize] = useState<string>('');

  if (!product) return <div className="text-center py-20">Product not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
        {/* Image */}
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover object-center" />
        </div>

        {/* Info */}
        <div className="mt-10 lg:mt-0">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-serif">{product.name}</h1>
          <div className="mt-3">
            <p className="text-2xl tracking-tight text-brand-gold">${product.price.toFixed(2)}</p>
          </div>

          <div className="mt-6">
             <h3 className="sr-only">Description</h3>
             <p className="text-base text-gray-700">{product.description}</p>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-900">Size</h3>
            <div className="grid grid-cols-4 gap-4 sm:grid-cols-8 lg:grid-cols-4 mt-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`border py-3 px-3 flex items-center justify-center text-sm font-medium uppercase sm:flex-1 rounded-sm focus:outline-none ${selectedSize === size ? 'bg-brand-black text-white border-brand-black' : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              if (selectedSize) addToCart(product, selectedSize);
              else alert('Please select a size');
            }}
            className="mt-10 flex w-full items-center justify-center rounded-none border border-transparent bg-brand-gold px-8 py-3 text-base font-medium text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            Add to Bag
          </button>
          
          <div className="mt-6 border-t pt-6">
            <h3 className="text-sm font-medium text-gray-900">Reviews</h3>
            {product.reviews.length > 0 ? (
               <div className="mt-4 space-y-4">
                 {product.reviews.map(r => (
                   <div key={r.id} className="text-sm">
                     <div className="flex items-center">
                       <span className="font-bold">{r.user}</span>
                       <span className="ml-2 text-brand-gold">{'★'.repeat(r.rating)}</span>
                     </div>
                     <p className="text-gray-600">{r.comment}</p>
                   </div>
                 ))}
               </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">No reviews yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. Checkout (Simulated)
const Checkout = () => {
  const { cart, placeOrder } = useShop();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'payment'>('form');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: ''
  });

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePaystackSim = () => {
    setLoading(true);
    // Simulate Paystack popup delay
    setTimeout(() => {
      const confirm = window.confirm("Paystack Checkout Simulation:\n\nAmount: GHS " + (total * 12).toFixed(2) + " (approx)\n\nClick OK to simulate successful payment.");
      setLoading(false);
      
      if (confirm) {
        placeOrder({
           items: cart,
           total: total,
           customer: formData
        });
        alert('Order placed successfully! Reference: ' + Math.random().toString(36).substr(2, 9).toUpperCase());
        navigate('/');
      }
    }, 1500);
  };

  if (cart.length === 0) return <div className="text-center py-20">Your cart is empty.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold mb-8 text-center">Checkout</h1>
      
      <div className="bg-white p-8 shadow-lg rounded-lg border border-gray-100">
        {step === 'form' ? (
          <form onSubmit={(e) => { e.preventDefault(); setStep('payment'); }}>
            <h2 className="text-xl font-medium mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-gold focus:border-brand-gold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input required type="email" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-gold focus:border-brand-gold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Shipping Address</label>
                <textarea required rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-gold focus:border-brand-gold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="submit" className="bg-brand-black text-white px-6 py-2 rounded-sm hover:bg-gray-800">Continue to Payment</button>
            </div>
          </form>
        ) : (
          <div>
            <h2 className="text-xl font-medium mb-4">Order Summary</h2>
            <ul className="mb-6 divide-y divide-gray-200">
              {cart.map(item => (
                <li key={`${item.id}-${item.selectedSize}`} className="py-2 flex justify-between text-sm">
                  <span>{item.name} (x{item.quantity})</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-bold text-lg mb-8 pt-4 border-t">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handlePaystackSim} 
              disabled={loading}
              className="w-full bg-[#00C3F7] text-white font-bold py-4 rounded-md shadow hover:bg-[#00a8d5] transition flex justify-center items-center gap-2"
            >
              {loading ? 'Processing...' : 'Pay with Paystack'}
            </button>
            <p className="text-xs text-center mt-2 text-gray-500">Secured by Paystack (Simulation)</p>
            <button onClick={() => setStep('form')} className="mt-4 text-sm text-gray-500 underline">Back to details</button>
          </div>
        )}
      </div>
    </div>
  );
};

// 5. Admin Dashboard
const Admin = () => {
  const { products, addProduct, deleteProduct, orders } = useShop();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  
  // New Product Form State
  const [newProd, setNewProd] = useState<Partial<Product>>({
    name: '', category: 'Sneakers', price: 0, image: '', description: '', sizes: []
  });
  const [sizeInput, setSizeInput] = useState('');

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProd.name && newProd.price) {
      addProduct({
        id: Math.random().toString(36).substr(2, 9),
        reviews: [],
        sizes: sizeInput.split(',').map(s => s.trim()),
        ...newProd
      } as Product);
      setNewProd({ name: '', category: 'Sneakers', price: 0, image: '', description: '', sizes: [] });
      setSizeInput('');
      alert('Product added!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold mb-8">Admin Dashboard</h1>
      
      <div className="flex space-x-4 mb-8 border-b">
        <button onClick={() => setActiveTab('products')} className={`pb-2 px-1 ${activeTab === 'products' ? 'border-b-2 border-brand-gold font-bold' : 'text-gray-500'}`}>Products</button>
        <button onClick={() => setActiveTab('orders')} className={`pb-2 px-1 ${activeTab === 'orders' ? 'border-b-2 border-brand-gold font-bold' : 'text-gray-500'}`}>Orders</button>
      </div>

      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Form */}
          <div className="bg-white p-6 shadow rounded-lg h-fit">
            <h2 className="text-xl font-bold mb-4">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <input placeholder="Product Name" className="w-full border p-2 rounded" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} required />
              <div className="flex gap-2">
                <input type="number" placeholder="Price" className="w-1/2 border p-2 rounded" value={newProd.price || ''} onChange={e => setNewProd({...newProd, price: parseFloat(e.target.value)})} required />
                <select className="w-1/2 border p-2 rounded" value={newProd.category} onChange={(e: any) => setNewProd({...newProd, category: e.target.value})}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <input placeholder="Image URL (e.g., https://picsum.photos/...)" className="w-full border p-2 rounded" value={newProd.image} onChange={e => setNewProd({...newProd, image: e.target.value})} required />
              <textarea placeholder="Description" className="w-full border p-2 rounded" value={newProd.description} onChange={e => setNewProd({...newProd, description: e.target.value})} required />
              <input placeholder="Sizes (comma separated, e.g. S, M, L)" className="w-full border p-2 rounded" value={sizeInput} onChange={e => setSizeInput(e.target.value)} required />
              <button type="submit" className="w-full bg-brand-black text-white py-2 rounded hover:bg-gray-800">Add Product</button>
            </form>
          </div>

          {/* Product List */}
          <div className="lg:col-span-2 bg-white p-6 shadow rounded-lg">
            <h2 className="text-xl font-bold mb-4">Current Inventory</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map(p => (
                    <tr key={p.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img className="h-10 w-10 rounded-full object-cover" src={p.image} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{p.name}</div>
                            <div className="text-sm text-gray-500">{p.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${p.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => deleteProduct(p.id)} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white p-6 shadow rounded-lg">
           <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
           {orders.length === 0 ? <p className="text-gray-500">No orders yet.</p> : (
             <ul className="divide-y divide-gray-200">
               {orders.map(order => (
                 <li key={order.id} className="py-4">
                   <div className="flex justify-between">
                     <div>
                       <p className="font-bold">Order #{order.id}</p>
                       <p className="text-sm text-gray-500">{order.customer.name} - {new Date(order.date).toLocaleDateString()}</p>
                     </div>
                     <div className="text-right">
                       <p className="font-bold text-green-600">{order.status}</p>
                       <p>${order.total.toFixed(2)}</p>
                     </div>
                   </div>
                 </li>
               ))}
             </ul>
           )}
        </div>
      )}
    </div>
  );
};

// 6. Footer
const Footer = () => (
  <footer className="bg-brand-black text-white pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
      <div>
        <h3 className="text-xl font-serif font-bold mb-4">SIKAWOFIE<span className="text-brand-gold">.</span></h3>
        <p className="text-gray-400 text-sm">Elevating streetwear with a touch of luxury. Designed for the modern individual.</p>
      </div>
      <div>
        <h4 className="font-bold mb-4 uppercase text-sm tracking-wider">Shop</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li><Link to="/shop?category=Sneakers" className="hover:text-white">Sneakers</Link></li>
          <li><Link to="/shop?category=Tops" className="hover:text-white">Tops</Link></li>
          <li><Link to="/shop?category=Jeans" className="hover:text-white">Jeans</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-4 uppercase text-sm tracking-wider">Support</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li><a href="#" className="hover:text-white">FAQ</a></li>
          <li><a href="#" className="hover:text-white">Shipping & Returns</a></li>
          <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-4 uppercase text-sm tracking-wider">Newsletter</h4>
        <div className="flex">
          <input type="email" placeholder="Your email" className="bg-gray-800 text-white px-3 py-2 text-sm focus:outline-none w-full" />
          <button className="bg-brand-gold px-4 py-2 text-white font-bold hover:bg-yellow-600">JOIN</button>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-800 pt-8 text-center text-xs text-gray-500">
      &copy; {new Date().getFullYear()} Sikawofie Collection. All rights reserved.
    </div>
  </footer>
);


const App = () => {
  return (
    <ShopProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col font-sans">
          <Navbar />
          <CartSidebar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <GeminiStylist />
          <Footer />
        </div>
      </HashRouter>
    </ShopProvider>
  );
};

export default App;