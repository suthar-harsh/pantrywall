
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, UserRole, Product, Order, CartItem, Category } from './types';
import { INITIAL_USERS, INITIAL_PRODUCTS, CATEGORIES } from './constants';
import { getPantryAdvice, generateProductDescription } from './services/gemini';

// --- Shared Components ---

const Navbar: React.FC<{ 
  user: User | null; 
  cartCount: number; 
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onOpenCart: () => void;
}> = ({ user, cartCount, onNavigate, onLogout, onOpenCart }) => (
  <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 px-4 py-3">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-8">
        <h1 
          className="text-2xl font-bold text-green-600 cursor-pointer flex items-center gap-2"
          onClick={() => onNavigate('home')}
        >
          <i className="fa-solid fa-basket-shopping"></i>
          PantryWall
        </h1>
        <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          <button onClick={() => onNavigate('home')} className="hover:text-green-600 transition">Shop</button>
          {user?.role === UserRole.VENDOR && <button onClick={() => onNavigate('vendor-dashboard')} className="hover:text-green-600 transition">Vendor Portal</button>}
          {user?.role === UserRole.ADMIN && <button onClick={() => onNavigate('admin-dashboard')} className="hover:text-green-600 transition">Admin Panel</button>}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Search groceries..." 
            className="pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-green-500 transition outline-none w-48 md:w-64"
          />
          <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>

        {user ? (
          <div className="flex items-center gap-4">
            <button 
              onClick={onOpenCart}
              className="relative p-2 text-gray-600 hover:text-green-600 transition"
            >
              <i className="fa-solid fa-cart-shopping text-xl"></i>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <div className="h-8 w-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs uppercase cursor-pointer" title={user.name}>
              {user.name.charAt(0)}
            </div>
            <button onClick={onLogout} className="text-gray-400 hover:text-red-500 transition">
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        ) : (
          <button 
            onClick={() => onNavigate('login')}
            className="bg-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-green-700 transition"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  </nav>
);

const Footer = () => (
  <footer className="bg-white border-t border-gray-200 pt-12 pb-8 mt-12">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <h3 className="text-xl font-bold text-green-600 mb-4">PantryWall</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          The best local products delivered fresh from our pantry to your wall. Supporting local farmers and vendors across the globe.
        </p>
      </div>
      <div>
        <h4 className="font-semibold mb-4 text-gray-800">Shop</h4>
        <ul className="text-gray-500 text-sm space-y-2">
          <li>Fruits & Vegetables</li>
          <li>Dairy & Eggs</li>
          <li>Bakery & Pastries</li>
          <li>Meats & Seafood</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-4 text-gray-800">Support</h4>
        <ul className="text-gray-500 text-sm space-y-2">
          <li>Help Center</li>
          <li>Contact Us</li>
          <li>Terms of Service</li>
          <li>Privacy Policy</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-4 text-gray-800">For Vendors</h4>
        <ul className="text-gray-500 text-sm space-y-2">
          <li>Sell on PantryWall</li>
          <li>Vendor Guidelines</li>
          <li>Partner Program</li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-gray-400 text-xs">&copy; 2024 PantryWall Inc. All rights reserved.</p>
      <div className="flex gap-4 text-gray-400">
        <i className="fa-brands fa-facebook cursor-pointer hover:text-green-600"></i>
        <i className="fa-brands fa-twitter cursor-pointer hover:text-green-600"></i>
        <i className="fa-brands fa-instagram cursor-pointer hover:text-green-600"></i>
      </div>
    </div>
  </footer>
);

// --- Pages ---

const HomeView: React.FC<{ 
  products: Product[]; 
  categories: Category[]; 
  onAddToCart: (p: Product) => void;
  onNavigate: (v: string, id?: string) => void;
}> = ({ products, categories, onAddToCart, onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter(p => p.category === selectedCategory);
  }, [selectedCategory, products]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="relative h-64 md:h-80 bg-green-700 rounded-3xl overflow-hidden mb-12 flex items-center px-8 md:px-16">
        <div className="z-10 relative max-w-lg text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Freshness Delivered To Your Door</h2>
          <p className="text-green-100 mb-6">Get 20% off your first order of fresh seasonal produce.</p>
          <button className="bg-white text-green-700 px-8 py-3 rounded-full font-bold hover:bg-green-50 transition shadow-lg">Shop Now</button>
        </div>
        <img src="https://picsum.photos/seed/grocery/1200/600" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
      </div>

      {/* Categories */}
      <div className="mb-12">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <i className="fa-solid fa-list-ul text-green-600"></i>
          Explore Categories
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-3 rounded-2xl flex flex-col items-center gap-2 min-w-[120px] transition border-2 ${!selectedCategory ? 'border-green-600 bg-green-50 text-green-700' : 'border-transparent bg-white text-gray-600 hover:border-gray-200'}`}
          >
            <i className="fa-solid fa-border-all text-xl"></i>
            <span className="text-sm font-medium">All</span>
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-6 py-3 rounded-2xl flex flex-col items-center gap-2 min-w-[120px] transition border-2 ${selectedCategory === cat.name ? 'border-green-600 bg-green-50 text-green-700' : 'border-transparent bg-white text-gray-600 hover:border-gray-200'}`}
            >
              <i className={`fa-solid ${cat.icon} text-xl`}></i>
              <span className="text-sm font-medium whitespace-nowrap">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <i className="fa-solid fa-fire-flame-curved text-orange-500"></i>
          {selectedCategory || 'Trending Items'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredProducts.map(p => (
            <div key={p.id} className="bg-white group rounded-2xl p-4 border border-transparent hover:border-green-100 hover:shadow-xl transition-all duration-300">
              <div 
                className="aspect-square rounded-xl overflow-hidden mb-4 bg-gray-50 relative cursor-pointer"
                onClick={() => onNavigate('product-detail', p.id)}
              >
                <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                  {p.rating} <i className="fa-solid fa-star text-yellow-400"></i>
                </div>
              </div>
              <p className="text-xs text-green-600 font-semibold mb-1">{p.category}</p>
              <h4 className="font-bold mb-1 truncate text-gray-800">{p.name}</h4>
              <p className="text-xs text-gray-400 mb-3 truncate">By {p.vendorName}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">${p.price.toFixed(2)}</span>
                <button 
                  onClick={() => onAddToCart(p)}
                  className="bg-green-100 text-green-700 w-10 h-10 rounded-xl flex items-center justify-center hover:bg-green-600 hover:text-white transition shadow-sm"
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="py-20 text-center text-gray-400">
            <i className="fa-solid fa-box-open text-5xl mb-4 opacity-20"></i>
            <p>No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductDetailView: React.FC<{ 
  productId: string; 
  products: Product[]; 
  onAddToCart: (p: Product) => void;
  onNavigate: (v: string) => void;
}> = ({ productId, products, onAddToCart, onNavigate }) => {
  const product = products.find(p => p.id === productId);
  if (!product) return <div>Product not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <button onClick={() => onNavigate('home')} className="mb-8 text-gray-500 hover:text-green-600 flex items-center gap-2">
        <i className="fa-solid fa-arrow-left"></i> Back to shop
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-3xl shadow-sm">
        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50">
          <img src={product.image} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-sm text-green-600 font-bold uppercase tracking-wider">{product.category}</span>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-yellow-400 text-sm">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fa-solid fa-star ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`}></i>
                  ))}
                </div>
                <span className="text-sm text-gray-400">({product.reviewsCount} reviews)</span>
              </div>
            </div>
            <button className="p-3 text-gray-400 hover:text-red-500 transition">
              <i className="fa-regular fa-heart text-2xl"></i>
            </button>
          </div>
          
          <p className="text-gray-500 leading-relaxed mb-8">{product.description}</p>
          
          <div className="bg-gray-50 p-6 rounded-2xl mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 font-medium">Sold by</span>
              <span className="font-bold text-green-600 flex items-center gap-2">
                <i className="fa-solid fa-store text-xs"></i>
                {product.vendorName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Availability</span>
              <span className={`font-bold ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
              </span>
            </div>
          </div>

          <div className="mt-auto flex items-center gap-6">
            <div className="text-4xl font-bold text-gray-900">${product.price.toFixed(2)}</div>
            <button 
              onClick={() => onAddToCart(product)}
              disabled={product.stock <= 0}
              className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 transition shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartSidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  products: Product[];
  onUpdateQty: (id: string, delta: number) => void;
  onCheckout: () => void;
}> = ({ isOpen, onClose, cart, products, onUpdateQty, onCheckout }) => {
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const cartDetails = cart.map(item => {
    const p = products.find(prod => prod.id === item.productId);
    return p ? { ...p, quantity: item.quantity } : null;
  }).filter(Boolean) as (Product & { quantity: number })[];

  const subtotal = cartDetails.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  const handleGetAdvice = async () => {
    if (cartDetails.length === 0) return;
    setLoadingAdvice(true);
    const names = cartDetails.map(p => p.name);
    const advice = await getPantryAdvice(names);
    setAiAdvice(advice || "Try mixing some ingredients for a fresh salad!");
    setLoadingAdvice(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
        <div className="p-6 border-b flex items-center justify-between bg-white sticky top-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <i className="fa-solid fa-cart-shopping text-green-600"></i>
            Your Pantry
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 transition">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {cartDetails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <i className="fa-solid fa-basket-shopping text-6xl mb-4 opacity-20"></i>
              <p>Your cart is empty.</p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {cartDetails.map(p => (
                  <div key={p.id} className="flex gap-4 group">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                      <img src={p.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 truncate mb-1">{p.name}</h4>
                      <p className="text-xs text-gray-400 mb-2 truncate">Vendor: {p.vendorName}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-2 py-1">
                          <button onClick={() => onUpdateQty(p.id, -1)} className="text-gray-500 hover:text-green-600"><i className="fa-solid fa-minus text-[10px]"></i></button>
                          <span className="text-sm font-bold w-4 text-center">{p.quantity}</span>
                          <button onClick={() => onUpdateQty(p.id, 1)} className="text-gray-500 hover:text-green-600"><i className="fa-solid fa-plus text-[10px]"></i></button>
                        </div>
                        <span className="font-bold text-gray-900">${(p.price * p.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Advice Box */}
              <div className="mt-12 bg-green-50 rounded-2xl p-4 border border-green-100 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-green-800 font-bold flex items-center gap-2 text-sm">
                    <i className="fa-solid fa-sparkles"></i>
                    AI Pantry Assistant
                  </h4>
                  <button 
                    onClick={handleGetAdvice}
                    disabled={loadingAdvice}
                    className="text-[10px] bg-green-600 text-white px-3 py-1 rounded-full font-bold hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {loadingAdvice ? 'Thinking...' : 'Get Recipe Ideas'}
                  </button>
                </div>
                {aiAdvice ? (
                  <p className="text-xs text-green-700 leading-relaxed italic">{aiAdvice}</p>
                ) : (
                  <p className="text-xs text-green-600/70">Need ideas? Ask our AI assistant for meal suggestions based on your items!</p>
                )}
                <i className="fa-solid fa-utensils absolute -bottom-4 -right-4 text-6xl text-green-100/50"></i>
              </div>
            </>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery</span>
              <span className="text-green-600 font-bold">FREE</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={onCheckout}
            disabled={cartDetails.length === 0}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 transition shadow-lg disabled:bg-gray-300"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

const VendorDashboard: React.FC<{
  user: User;
  products: Product[];
  onAddProduct: (p: Partial<Product>) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
}> = ({ user, products, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
  const vendorProducts = products.filter(p => p.vendorId === user.id);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    category: CATEGORIES[0].name,
    stock: 0,
    description: '',
    image: 'https://picsum.photos/seed/new/400/300'
  });

  const handleGenerateDesc = async () => {
    if (!newProduct.name) return alert('Enter a product name first');
    setIsGenerating(true);
    const desc = await generateProductDescription(newProduct.name, newProduct.category);
    setNewProduct(prev => ({ ...prev, description: desc || prev.description }));
    setIsGenerating(false);
  };

  const handleAdd = () => {
    onAddProduct({ ...newProduct, vendorId: user.id, vendorName: user.name });
    setShowAddModal(false);
    setNewProduct({
      name: '',
      price: 0,
      category: CATEGORIES[0].name,
      stock: 0,
      description: '',
      image: 'https://picsum.photos/seed/new/400/300'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user.name}. Manage your inventory here.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-700 transition"
        >
          <i className="fa-solid fa-plus"></i> Add New Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Active Products', val: vendorProducts.length, icon: 'fa-box', color: 'bg-blue-500' },
          { label: 'Out of Stock', val: vendorProducts.filter(p => p.stock === 0).length, icon: 'fa-triangle-exclamation', color: 'bg-orange-500' },
          { label: 'Total Sales', val: '$1,240.00', icon: 'fa-chart-line', color: 'bg-green-500' },
          { label: 'Store Rating', val: '4.9/5', icon: 'fa-star', color: 'bg-yellow-500' },
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className={`w-12 h-12 ${s.color} text-white rounded-2xl flex items-center justify-center mb-4 text-xl shadow-lg`}>
              <i className={`fa-solid ${s.icon}`}></i>
            </div>
            <p className="text-gray-500 text-sm font-medium">{s.label}</p>
            <h3 className="text-2xl font-bold text-gray-900">{s.val}</h3>
          </div>
        ))}
      </div>

      {/* Product List */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-8 py-5">Product</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Price</th>
                <th className="px-8 py-5">Stock</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vendorProducts.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={p.image} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">ID: {p.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500 font-medium">{p.category}</td>
                  <td className="px-8 py-5 font-bold text-gray-800">${p.price.toFixed(2)}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock > 10 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => {}} className="p-2 text-gray-400 hover:text-blue-500"><i className="fa-solid fa-pen"></i></button>
                      <button onClick={() => onDeleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-500"><i className="fa-solid fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <h2 className="text-2xl font-bold mb-6">List New Product</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Name</label>
                  <input 
                    type="text" 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-transparent border-2 focus:border-green-600 focus:bg-white rounded-2xl outline-none transition" 
                    placeholder="e.g. Organic Strawberries" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Category</label>
                  <select 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-transparent border-2 focus:border-green-600 focus:bg-white rounded-2xl outline-none transition"
                  >
                    {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Price ($)</label>
                  <input 
                    type="number" 
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border-transparent border-2 focus:border-green-600 focus:bg-white rounded-2xl outline-none transition" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Initial Stock</label>
                  <input 
                    type="number" 
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border-transparent border-2 focus:border-green-600 focus:bg-white rounded-2xl outline-none transition" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-700">Description</label>
                  <button 
                    onClick={handleGenerateDesc}
                    disabled={isGenerating}
                    className="text-[10px] bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold hover:bg-purple-200 transition"
                  >
                    <i className="fa-solid fa-sparkles mr-1"></i>
                    {isGenerating ? 'Writing...' : 'AI Generate'}
                  </button>
                </div>
                <textarea 
                  rows={3} 
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-transparent border-2 focus:border-green-600 focus:bg-white rounded-2xl outline-none transition resize-none" 
                  placeholder="Describe your fresh product..."
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-100 text-gray-500 font-bold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAdd}
                  className="flex-1 px-6 py-4 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 transition shadow-lg"
                >
                  Create Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard: React.FC<{
  users: User[];
  onToggleUserStatus: (id: string) => void;
  products: Product[];
}> = ({ users, onToggleUserStatus, products }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Oversight</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Users', val: users.length, icon: 'fa-users', color: 'bg-indigo-500' },
          { label: 'Total Vendors', val: users.filter(u => u.role === UserRole.VENDOR).length, icon: 'fa-store', color: 'bg-emerald-500' },
          { label: 'Total Products', val: products.length, icon: 'fa-box', color: 'bg-amber-500' },
          { label: 'Platform Revenue', val: '$14,580', icon: 'fa-sack-dollar', color: 'bg-rose-500' },
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className={`w-12 h-12 ${s.color} text-white rounded-2xl flex items-center justify-center mb-4 text-xl shadow-lg`}>
              <i className={`fa-solid ${s.icon}`}></i>
            </div>
            <p className="text-gray-500 text-sm font-medium">{s.label}</p>
            <h3 className="text-2xl font-bold text-gray-900">{s.val}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="font-bold text-lg">User Management</h3>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Customer & Vendors</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-gray-800">{u.name}</p>
                      <p className="text-[10px] text-gray-400">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${u.role === UserRole.ADMIN ? 'border-purple-200 text-purple-600 bg-purple-50' : u.role === UserRole.VENDOR ? 'border-blue-200 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-600 bg-gray-50'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`w-2 h-2 rounded-full inline-block mr-2 ${u.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-xs font-medium capitalize">{u.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== UserRole.ADMIN && (
                        <button 
                          onClick={() => onToggleUserStatus(u.id)}
                          className={`text-[10px] font-bold px-3 py-1 rounded-lg transition ${u.status === 'active' ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="font-bold text-lg">System Logs</h3>
            <button className="text-xs text-green-600 font-bold hover:underline">View All</button>
          </div>
          <div className="p-6 space-y-6">
            {[
              { msg: 'Vendor "Green Grocers" added 5 new products', time: '2 mins ago', icon: 'fa-plus', col: 'text-blue-500' },
              { msg: 'New customer "Sarah Miller" registered', time: '15 mins ago', icon: 'fa-user-plus', col: 'text-green-500' },
              { msg: 'Order #PW-9283 marked as Delivered', time: '1 hour ago', icon: 'fa-check-circle', col: 'text-purple-500' },
              { msg: 'Suspended user "MaliciousActor"', time: '3 hours ago', icon: 'fa-ban', col: 'text-red-500' },
            ].map((log, i) => (
              <div key={i} className="flex gap-4">
                <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 ${log.col}`}>
                  <i className={`fa-solid ${log.icon} text-sm`}></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{log.msg}</p>
                  <p className="text-xs text-gray-400">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Logic ---

export default function App() {
  const [view, setView] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persistence (Simulated DB)
  useEffect(() => {
    const storedUsers = localStorage.getItem('pw_users');
    const storedProds = localStorage.getItem('pw_products');
    if (storedUsers) setUsers(JSON.parse(storedUsers));
    if (storedProds) setProducts(JSON.parse(storedProds));
  }, []);

  const saveToStorage = (u: User[], p: Product[]) => {
    localStorage.setItem('pw_users', JSON.stringify(u));
    localStorage.setItem('pw_products', JSON.stringify(p));
  };

  const handleNavigate = (v: string, id?: string) => {
    setView(v);
    if (id) setSelectedProductId(id);
    window.scrollTo(0,0);
  };

  const handleLogin = (role: UserRole) => {
    const user = users.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      setView('home');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCart([]);
    setView('home');
  };

  const handleAddToCart = (p: Product) => {
    if (!currentUser) {
      alert('Please sign in to add items to cart!');
      return setView('login');
    }
    setCart(prev => {
      const existing = prev.find(item => item.productId === p.id);
      if (existing) {
        return prev.map(item => item.productId === p.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId: p.id, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleAddProduct = (p: Partial<Product>) => {
    const newProd: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: p.name || 'Unnamed',
      description: p.description || '',
      price: p.price || 0,
      category: p.category || CATEGORIES[0].name,
      vendorId: p.vendorId || '',
      vendorName: p.vendorName || '',
      stock: p.stock || 0,
      image: p.image || 'https://picsum.photos/400/300',
      rating: 5,
      reviewsCount: 0
    };
    const updated = [...products, newProd];
    setProducts(updated);
    saveToStorage(users, updated);
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveToStorage(users, updated);
  };

  const handleToggleUserStatus = (id: string) => {
    const updated = users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u);
    setUsers(updated as User[]);
    saveToStorage(updated as User[], products);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        user={currentUser} 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="flex-1">
        {view === 'home' && (
          <HomeView 
            products={products} 
            categories={CATEGORIES} 
            onAddToCart={handleAddToCart}
            onNavigate={handleNavigate}
          />
        )}

        {view === 'product-detail' && (
          <ProductDetailView 
            productId={selectedProductId} 
            products={products} 
            onAddToCart={handleAddToCart}
            onNavigate={handleNavigate}
          />
        )}

        {view === 'login' && (
          <div className="max-w-md mx-auto py-24 px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Welcome to PantryWall</h2>
            <p className="text-gray-500 mb-12">Select your persona to enter the platform (Demo Mode)</p>
            <div className="space-y-4">
              <button onClick={() => handleLogin(UserRole.CUSTOMER)} className="w-full bg-white border-2 border-green-600 text-green-700 p-4 rounded-2xl font-bold hover:bg-green-50 transition flex items-center justify-between">
                <span>Customer Portal</span>
                <i className="fa-solid fa-user"></i>
              </button>
              <button onClick={() => handleLogin(UserRole.VENDOR)} className="w-full bg-white border-2 border-blue-600 text-blue-700 p-4 rounded-2xl font-bold hover:bg-blue-50 transition flex items-center justify-between">
                <span>Vendor Portal</span>
                <i className="fa-solid fa-store"></i>
              </button>
              <button onClick={() => handleLogin(UserRole.ADMIN)} className="w-full bg-white border-2 border-purple-600 text-purple-700 p-4 rounded-2xl font-bold hover:bg-purple-50 transition flex items-center justify-between">
                <span>Admin Panel</span>
                <i className="fa-solid fa-user-shield"></i>
              </button>
            </div>
          </div>
        )}

        {view === 'vendor-dashboard' && currentUser?.role === UserRole.VENDOR && (
          <VendorDashboard 
            user={currentUser} 
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={() => {}}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {view === 'admin-dashboard' && currentUser?.role === UserRole.ADMIN && (
          <AdminDashboard 
            users={users}
            onToggleUserStatus={handleToggleUserStatus}
            products={products}
          />
        )}
      </main>

      <Footer />

      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        products={products}
        onUpdateQty={handleUpdateCartQty}
        onCheckout={() => {
          alert("Order placed successfully! Checkout logic would proceed to payment gateway.");
          setCart([]);
          setIsCartOpen(false);
          setView('home');
        }}
      />
    </div>
  );
}
