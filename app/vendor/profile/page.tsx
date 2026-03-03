'use client';

import { useAuth } from '@/hooks/use-auth';
import { motion } from 'motion/react';
import { Store, Mail, ShieldCheck, CreditCard, BarChart3, Settings, Edit2, LogOut, ChevronRight, MapPin, Globe } from 'lucide-react';
import Link from 'next/link';

export default function VendorProfilePage() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading || !user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-emerald-600 text-white flex items-center justify-center text-4xl font-bold shadow-xl border-4 border-white">
            {user.name[0]}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{user.name}</h1>
            <p className="text-zinc-500 font-medium flex items-center gap-2">
              <Store size={16} /> Official Store
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-wider border border-emerald-100 flex items-center gap-1">
                <ShieldCheck size={12} /> Verified Vendor
              </span>
            </div>
          </div>
        </div>
        <button className="px-6 py-3 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg active:scale-95">
          <Edit2 size={18} /> Edit Store Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Store Info */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <Settings size={20} className="text-zinc-400" /> Store Information
            </h2>
            <div className="space-y-4">
              <InfoRow icon={<Mail size={18} />} label="Contact Email" value={user.email} />
              <InfoRow icon={<MapPin size={18} />} label="Location" value="San Francisco, CA" />
              <InfoRow icon={<Globe size={18} />} label="Website" value="www.techhaven.com" />
            </div>
            <div className="pt-4">
              <p className="text-sm font-bold text-zinc-700 mb-2">Store Description</p>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Tech Haven is your one-stop shop for the latest gadgets and accessories. We specialize in high-quality electronics and provide real-time unboxing and reviews through our live streams.
              </p>
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full p-6 bg-zinc-900 text-white rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-95"
          >
            <LogOut size={20} /> Log Out from Vendor Hub
          </button>
        </div>

        {/* Performance & Wallet */}
        <div className="space-y-6">
          <div className="bg-emerald-600 p-8 rounded-3xl text-white shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CreditCard size={20} className="text-emerald-200" /> Store Wallet
            </h2>
            <div className="space-y-1">
              <p className="text-emerald-100 text-sm font-medium">Available for Withdrawal</p>
              <h3 className="text-5xl font-bold tracking-tighter">${user.walletBalance.toFixed(2)}</h3>
            </div>
            <Link 
              href="/finance/wallet"
              className="block w-full py-4 bg-white text-emerald-600 rounded-2xl font-bold text-center hover:bg-zinc-50 transition-all active:scale-95"
            >
              Withdraw Funds
            </Link>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <BarChart3 size={20} className="text-zinc-400" /> Store Performance
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-center space-y-1">
                <p className="text-2xl font-bold text-zinc-900">1.2k</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Followers</p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-center space-y-1">
                <p className="text-2xl font-bold text-zinc-900">4.8</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Rating</p>
              </div>
            </div>
            <Link 
              href="/vendor/history"
              className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <BarChart3 size={18} className="text-emerald-600" />
                <span className="text-sm font-bold text-zinc-900">Detailed Analytics</span>
              </div>
              <ChevronRight size={18} className="text-zinc-300 group-hover:text-emerald-600" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
      <div className="flex items-center gap-3 text-zinc-400">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-bold text-zinc-900">{value}</span>
    </div>
  );
}
