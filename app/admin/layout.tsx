'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  LayoutDashboard, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  CreditCard, 
  Video, 
  LogOut,
  Bell,
  Search
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: <Users size={20} />, label: 'Users', href: '/admin/users' },
    { icon: <CheckCircle size={20} />, label: 'Verifications', href: '/admin/verifications' },
    { icon: <AlertTriangle size={20} />, label: 'Disputes', href: '/admin/disputes' },
    { icon: <CreditCard size={20} />, label: 'Transactions', href: '/admin/transactions' },
    { icon: <Video size={20} />, label: 'Content Moderation', href: '/admin/videos' },
  ];

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 flex-col bg-zinc-900 text-zinc-400 sticky top-0 h-screen">
        <div className="p-8">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
            <Shield className="text-blue-500" /> Admin<span className="text-blue-500">Panel</span>
          </Link>
        </div>

        <nav className="flex-grow px-4 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                pathname === item.href 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-zinc-800 space-y-6">
          <div className="flex items-center gap-3 px-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg">
              {user.name[0]}
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate">Super Admin</p>
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
            {navItems.find(i => i.href === pathname)?.label || 'Admin Panel'}
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="Search platform..."
                className="w-64 pl-12 pr-4 py-2 bg-zinc-100 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all text-sm outline-none"
              />
            </div>
            <button className="relative text-zinc-400 hover:text-zinc-900 transition-colors">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">5</span>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
