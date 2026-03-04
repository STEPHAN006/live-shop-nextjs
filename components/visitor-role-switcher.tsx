'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Store, ShoppingBag } from 'lucide-react';

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  if (href === '/buyer/feed') return pathname.startsWith('/buyer');
  if (href === '/vendor/dashboard') return pathname.startsWith('/vendor');
  if (href === '/admin/dashboard') return pathname.startsWith('/admin');
  return pathname === href;
}

export function VisitorRoleSwitcher() {
  const pathname = usePathname();

  const items = [
    { key: 'buyer', label: 'Buyer', href: '/buyer/feed', icon: ShoppingBag },
    { key: 'seller', label: 'Seller', href: '/vendor/dashboard', icon: Store },
    { key: 'admin', label: 'Admin', href: '/admin/dashboard', icon: Shield },
  ] as const;

  return (
    <div className="fixed bottom-5 right-5 z-[100]">
      <div className="rounded-2xl bg-white/90 backdrop-blur border border-zinc-200 shadow-xl p-1">
        <div className="flex items-center gap-1">
          {items.map((it) => {
            const active = isActive(pathname, it.href);
            const Icon = it.icon;
            return (
              <Link
                key={it.key}
                href={it.href}
                className={`h-11 px-3 rounded-xl flex items-center gap-2 text-sm font-bold transition-all select-none ${
                  active
                    ? 'bg-zinc-900 text-white shadow-md'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{it.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
