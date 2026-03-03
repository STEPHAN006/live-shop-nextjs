'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Home, 
  Users, 
  Video, 
  User, 
  CreditCard, 
  Search, 
  LogOut,
  Bell
} from 'lucide-react';
import { motion } from 'motion/react';

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  const navItems = [
    { icon: <Home size={20} />, label: 'Feed', href: '/buyer/feed' },
    { icon: <Video size={20} />, label: 'Catalogue', href: '/buyer/videos' },
    { icon: <CreditCard size={20} />, label: 'Purchases', href: '/buyer/purchases' },
    { icon: <User size={20} />, label: 'Profile', href: '/buyer/profile' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-zinc-200 sticky top-0 h-screen">
        <div className="p-6">
          <Link href="/buyer/feed" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-zinc-900">
            <ShoppingBag className="text-red-600" /> Live<span className="text-red-600">Shop</span>
          </Link>
        </div>

        <nav className="flex-grow px-4 space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                pathname === item.href 
                  ? 'bg-zinc-900 text-white shadow-lg' 
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-100 space-y-4">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold border border-zinc-200">
              {user.name[0]}
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-bold text-zinc-900 truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate">${user.walletBalance.toFixed(2)}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all"
          >
            <LogOut size={20} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-zinc-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/buyer/feed" className="flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-900">
          <ShoppingBag className="text-red-600" size={24} /> LiveShop
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/search"><Search size={24} className="text-zinc-500" /></Link>
          <Link href="/buyer/profile" className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold border border-zinc-200 text-xs">
            {user.name[0]}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0">
        {/* Top Bar - Desktop */}
        <header className="hidden md:flex h-20 bg-white border-b border-zinc-200 items-center justify-between px-8 sticky top-0 z-40">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search videos, products, or creators..."
              className="w-full pl-12 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-zinc-500 hover:text-zinc-900 transition-colors">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">2</span>
            </button>
            <Link href="/finance/wallet" className="flex items-center gap-2 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl hover:bg-zinc-100 transition-all">
              <CreditCard size={18} className="text-zinc-500" />
              <span className="text-sm font-bold text-zinc-900">${user.walletBalance.toFixed(2)}</span>
            </Link>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-6 py-3 flex items-center justify-between z-50">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center gap-1 ${
                pathname === item.href ? 'text-zinc-900' : 'text-zinc-400'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
