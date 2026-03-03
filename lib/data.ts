import { User, Product, Video, Purchase, Dispute } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@liveshop.com',
    role: 'ADMIN',
    isVerified: true,
    walletBalance: 1000,
    followedVendors: [],
  },
  {
    id: 'v1',
    name: 'Tech Haven',
    email: 'vendor1@liveshop.com',
    role: 'VENDOR',
    isVerified: true,
    walletBalance: 500,
    followedVendors: [],
  },
  {
    id: 'v2',
    name: 'Fashion Forward',
    email: 'vendor2@liveshop.com',
    role: 'VENDOR',
    isVerified: false,
    walletBalance: 0,
    followedVendors: [],
  },
  {
    id: 'b1',
    name: 'John Doe',
    email: 'buyer1@liveshop.com',
    role: 'BUYER',
    isVerified: true,
    walletBalance: 250,
    followedVendors: ['v1'],
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    vendorId: 'v1',
    name: 'Wireless Headphones',
    description: 'High-quality noise-canceling headphones.',
    price: 199.99,
    image: 'https://picsum.photos/seed/headphones/400/400',
  },
  {
    id: 'p2',
    vendorId: 'v1',
    name: 'Smart Watch',
    description: 'Track your fitness and notifications.',
    price: 149.99,
    image: 'https://picsum.photos/seed/watch/400/400',
  },
  {
    id: 'p3',
    vendorId: 'v2',
    name: 'Summer Dress',
    description: 'Light and airy dress for summer.',
    price: 59.99,
    image: 'https://picsum.photos/seed/dress/400/400',
  },
];

export const MOCK_VIDEOS: Video[] = [
  {
    id: 'vid1',
    vendorId: 'v1',
    title: 'Unboxing the New Tech!',
    description: 'Checking out the latest gadgets from Tech Haven.',
    thumbnail: 'https://picsum.photos/seed/tech/800/450',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    isLive: true,
    likes: 124,
    viewCount: 1500,
    attachedProductIds: ['p1', 'p2'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vid2',
    vendorId: 'v2',
    title: 'Summer Collection Preview',
    description: 'A sneak peek at our upcoming summer styles.',
    thumbnail: 'https://picsum.photos/seed/fashion/800/450',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    isLive: false,
    likes: 45,
    viewCount: 800,
    attachedProductIds: ['p3'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const MOCK_PURCHASES: Purchase[] = [
  {
    id: 'pur1',
    buyerId: 'b1',
    vendorId: 'v1',
    productId: 'p1',
    amount: 199.99,
    status: 'DELIVERED',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const MOCK_DISPUTES: Dispute[] = [];
