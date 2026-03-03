export type UserRole = 'BUYER' | 'VENDOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
  walletBalance: number;
  followedVendors: string[]; // IDs of vendors
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface Video {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  isLive: boolean;
  likes: number;
  viewCount: number;
  attachedProductIds: string[];
  createdAt: string;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Purchase {
  id: string;
  buyerId: string;
  vendorId: string;
  productId: string;
  amount: number;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'REFUNDED' | 'DISPUTED';
  createdAt: string;
}

export interface Dispute {
  id: string;
  purchaseId: string;
  buyerId: string;
  vendorId: string;
  reason: string;
  status: 'OPEN' | 'RESOLVED' | 'ESCALATED';
  createdAt: string;
}
