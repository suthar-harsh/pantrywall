
import { Category, Product, User, UserRole } from './types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Fruits & Veg', icon: 'fa-apple-whole' },
  { id: '2', name: 'Dairy & Eggs', icon: 'fa-egg' },
  { id: '3', name: 'Bakery', icon: 'fa-bread-slice' },
  { id: '4', name: 'Meat & Seafood', icon: 'fa-drumstick-bite' },
  { id: '5', name: 'Beverages', icon: 'fa-wine-glass' },
  { id: '6', name: 'Snacks', icon: 'fa-cookie' },
  { id: '7', name: 'Pantry', icon: 'fa-box' },
];

export const INITIAL_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Alice Customer', 
    email: 'alice@pantrywall.com', 
    role: UserRole.CUSTOMER, 
    status: 'active',
    joinedDate: '2023-01-15'
  },
  { 
    id: 'v1', 
    name: 'Green Grocers', 
    email: 'vendor@greengrocers.com', 
    role: UserRole.VENDOR, 
    status: 'active',
    joinedDate: '2023-02-20'
  },
  { 
    id: 'a1', 
    name: 'Pantry Admin', 
    email: 'admin@pantrywall.com', 
    role: UserRole.ADMIN, 
    status: 'active',
    joinedDate: '2022-12-01'
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Organic Honeycrisp Apples',
    description: 'Crispy, sweet, and locally grown organic apples.',
    price: 4.99,
    category: 'Fruits & Veg',
    vendorId: 'v1',
    vendorName: 'Green Grocers',
    stock: 50,
    image: 'https://picsum.photos/seed/apple/400/300',
    rating: 4.8,
    reviewsCount: 124
  },
  {
    id: 'p2',
    name: 'Whole Milk 1L',
    description: 'Fresh farm-to-door whole milk.',
    price: 3.50,
    category: 'Dairy & Eggs',
    vendorId: 'v1',
    vendorName: 'Green Grocers',
    stock: 30,
    image: 'https://picsum.photos/seed/milk/400/300',
    rating: 4.5,
    reviewsCount: 88
  },
  {
    id: 'p3',
    name: 'Sourdough Bread',
    description: 'Artisan sourdough baked fresh daily.',
    price: 6.25,
    category: 'Bakery',
    vendorId: 'v1',
    vendorName: 'Green Grocers',
    stock: 15,
    image: 'https://picsum.photos/seed/bread/400/300',
    rating: 4.9,
    reviewsCount: 45
  },
  {
    id: 'p4',
    name: 'Atlantic Salmon Fillet',
    description: 'Wild-caught fresh Atlantic salmon.',
    price: 18.99,
    category: 'Meat & Seafood',
    vendorId: 'v1',
    vendorName: 'Green Grocers',
    stock: 10,
    image: 'https://picsum.photos/seed/salmon/400/300',
    rating: 4.7,
    reviewsCount: 32
  },
  {
    id: 'p5',
    name: 'Greek Yogurt',
    description: 'Creamy high-protein Greek yogurt.',
    price: 5.50,
    category: 'Dairy & Eggs',
    vendorId: 'v1',
    vendorName: 'Green Grocers',
    stock: 25,
    image: 'https://picsum.photos/seed/yogurt/400/300',
    rating: 4.6,
    reviewsCount: 56
  }
];
