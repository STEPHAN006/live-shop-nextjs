'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  Store, 
  LayoutDashboard, 
  Package, 
  Video, 
  BarChart3, 
  Settings, 
  LogOut,
  PlusCircle,
  Radio
} from 'lucide-react';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'VENDOR')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/vendor/dashboard' },
    { icon: <Package size={20} />, label: 'Products', href: '/vendor/products' },
    { icon: <Video size={20} />, label: 'Videos', href: '/vendor/videos' },
    { icon: <BarChart3 size={20} />, label: 'Sales History', href: '/vendor/history' },
    { icon: <Settings size={20} />, label: 'Shop Profile', href: '/vendor/profile' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-zinc-900 text-zinc-400 border-r border-zinc-800 sticky top-0 h-screen">
        <div className="p-8">
          <Link href="/vendor/dashboard" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
            <Store className="text-emerald-500" /> Vendor<span className="text-emerald-500">Hub</span>
          </Link>
        </div>

        <nav className="flex-grow px-4 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                pathname === item.href 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                  : 'hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-zinc-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold border border-emerald-500 shadow-lg">
              {user.name[0]}
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate">Verified Seller</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl font-medium transition-all"
          >
            <LogOut size={20} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <h2 className="text-xl font-bold text-zinc-900">
            {navItems.find(i => i.href === pathname)?.label || 'Vendor Hub'}
          </h2>
          <div className="flex items-center gap-4">
            <Link 
              href="/vendor/live/create"
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95"
            >
              <Radio size={18} /> Go Live
            </Link>
            <Link 
              href="/vendor/products/create"
              className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
            >
              <PlusCircle size={18} /> Add Product
            </Link>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
