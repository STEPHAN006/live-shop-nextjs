'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { Modal } from '@/components/ui/modal';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (isLoading) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <div className="max-w-3xl mx-auto p-6 md:p-12">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center mx-auto shadow-lg">
              <Shield size={28} />
            </div>
            <p className="text-xl font-bold text-zinc-900">Admin Panel</p>
            <p className="text-sm text-zinc-500">Visitor mode is enabled. Log in to access admin tools.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/login" className="px-6 py-3 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all">
                Log in
              </Link>
              <Link href="/register/role" className="px-6 py-3 bg-white border border-zinc-200 rounded-2xl font-bold text-zinc-900 hover:bg-zinc-50 transition-all">
                Create account
              </Link>
            </div>
            <div className="pt-3">
              <Link href="/" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<
    { type: 'user' | 'video' | 'transaction' | 'dispute'; id: string; title: string; subtitle: string; href: string }[]
  >([]);

  const searchTimerRef = useRef<number | null>(null);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifications, setNotifications] = useState<
    { id: string; title: string; description: string; href: string; kind: 'info' | 'warning' | 'success' }[]
  >([]);

  // Visitor mode: allow navigation without forcing auth.

  const performSearch = async (q: string) => {
    const supabase = getSupabaseBrowserClient();
    const like = `%${q}%`;

    const [usersRes, videosRes, purchasesRes, disputesRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, name, email')
        .or(`name.ilike.${like},email.ilike.${like}`)
        .limit(5),
      supabase
        .from('videos')
        .select('id, title')
        .ilike('title', like)
        .limit(5),
      supabase
        .from('purchases')
        .select('id')
        .ilike('id', like)
        .limit(5),
      supabase
        .from('disputes')
        .select('id, reason')
        .or(`id.ilike.${like},reason.ilike.${like}`)
        .limit(5),
    ]);

    const results: { type: 'user' | 'video' | 'transaction' | 'dispute'; id: string; title: string; subtitle: string; href: string }[] = [];

    for (const u of usersRes.data ?? []) {
      results.push({
        type: 'user',
        id: u.id,
        title: u.name ?? 'User',
        subtitle: u.email ?? '',
        href: '/admin/users',
      });
    }

    for (const v of videosRes.data ?? []) {
      results.push({
        type: 'video',
        id: v.id,
        title: v.title ?? 'Video',
        subtitle: v.id,
        href: '/admin/videos',
      });
    }

    for (const p of purchasesRes.data ?? []) {
      results.push({
        type: 'transaction',
        id: p.id,
        title: `Transaction #${p.id}`,
        subtitle: 'Purchase',
        href: '/admin/transactions',
      });
    }

    for (const d of disputesRes.data ?? []) {
      results.push({
        type: 'dispute',
        id: d.id,
        title: `Dispute #${d.id}`,
        subtitle: d.reason ?? '',
        href: '/admin/disputes',
      });
    }

    setSearchResults(results);
  };

  const handleSearchInput = (v: string) => {
    setSearchQuery(v);
    const q = v.trim();
    if (!q) {
      if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current);
      setSearchResults([]);
      setSearchLoading(false);
      setSearchOpen(false);
      return;
    }

    setSearchOpen(true);
    setSearchLoading(true);
    if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current);
    searchTimerRef.current = window.setTimeout(async () => {
      try {
        await performSearch(q);
      } finally {
        setSearchLoading(false);
      }
    }, 250);
  };

  const loadNotifications = async () => {
    setNotifLoading(true);
    const supabase = getSupabaseBrowserClient();

    const [pendingVendorsRes, openDisputesRes, recentPurchasesRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, name, email')
        .eq('role', 'VENDOR')
        .eq('is_verified', false)
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('disputes')
        .select('id, reason')
        .eq('status', 'OPEN')
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('purchases')
        .select('id, amount')
        .order('created_at', { ascending: false })
        .limit(3),
    ]);

    const items: { id: string; title: string; description: string; href: string; kind: 'info' | 'warning' | 'success' }[] = [];

    for (const v of pendingVendorsRes.data ?? []) {
      items.push({
        id: `vendor-${v.id}`,
        title: 'Pending vendor verification',
        description: `${v.name ?? 'Vendor'} · ${v.email ?? ''}`,
        href: `/admin/vendors/${v.id}`,
        kind: 'warning',
      });
    }

    for (const d of openDisputesRes.data ?? []) {
      items.push({
        id: `dispute-${d.id}`,
        title: 'Open dispute',
        description: d.reason ?? d.id,
        href: '/admin/disputes',
        kind: 'warning',
      });
    }

    for (const p of recentPurchasesRes.data ?? []) {
      items.push({
        id: `purchase-${p.id}`,
        title: 'New transaction',
        description: `#${p.id} · $${Number(p.amount ?? 0).toFixed(2)}`,
        href: '/admin/transactions',
        kind: 'info',
      });
    }

    setNotifications(items);
    setNotifLoading(false);
  };

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
      <Modal
        open={searchOpen}
        title="Search"
        onClose={() => setSearchOpen(false)}
        footer={
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all"
          >
            Close
          </button>
        }
      >
        <div className="space-y-4">
          <input
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Search platform..."
            className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
          />
          {searchLoading ? (
            <p className="text-sm text-zinc-600">Loading...</p>
          ) : searchResults.length === 0 ? (
            <p className="text-sm text-zinc-600">No results.</p>
          ) : (
            <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-2xl overflow-hidden">
              {searchResults.map((r) => (
                <button
                  key={`${r.type}-${r.id}`}
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    router.push(r.href);
                  }}
                  className="w-full text-left p-4 hover:bg-zinc-50 transition-colors"
                >
                  <p className="text-sm font-bold text-zinc-900">{r.title}</p>
                  <p className="text-xs text-zinc-500">{r.subtitle}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={notifOpen}
        title="Notifications"
        onClose={() => setNotifOpen(false)}
        footer={
          <button
            type="button"
            onClick={() => setNotifOpen(false)}
            className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all"
          >
            Close
          </button>
        }
      >
        {notifLoading ? (
          <p className="text-sm text-zinc-600">Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-zinc-600">No notifications.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  setNotifOpen(false);
                  router.push(n.href);
                }}
                className="w-full text-left p-4 rounded-2xl border border-zinc-200 hover:bg-zinc-50 transition-colors"
              >
                <p className="text-sm font-bold text-zinc-900">{n.title}</p>
                <p className="text-xs text-zinc-500">{n.description}</p>
              </button>
            ))}
          </div>
        )}
      </Modal>

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
          {user ? (
            <>
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
            </>
          ) : (
            <div className="px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Visitor mode</p>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-xs font-bold text-white hover:bg-white/15 transition-all">
                  Log in
                </Link>
                <Link href="/register/role" className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all">
                  Sign up
                </Link>
              </div>
            </div>
          )}
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
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim()) setSearchOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setSearchOpen(true);
                }}
                className="w-64 pl-12 pr-4 py-2 bg-zinc-100 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all text-sm outline-none"
              />
            </div>
            <button
              type="button"
              onClick={async () => {
                setNotifOpen(true);
                if (user) await loadNotifications();
              }}
              className="relative text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                {notifications.length || '0'}
              </span>
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
