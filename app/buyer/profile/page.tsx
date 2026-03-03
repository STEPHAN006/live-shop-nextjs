'use client';

import { useAuth } from '@/hooks/use-auth';
import { motion } from 'motion/react';
import { User, Mail, ShieldCheck, CreditCard, ShoppingBag, Settings, Edit2, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function BuyerProfilePage() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading || !user) return null;

  return (
    <div className=" mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-zinc-900 text-white flex items-center justify-center text-4xl font-bold shadow-xl border-4 border-white">
            {user.name[0]}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{user.name}</h1>
            <p className="text-zinc-500 font-medium flex items-center gap-2">
              <Mail size={16} /> {user.email}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-wider border border-emerald-100 flex items-center gap-1">
                <ShieldCheck size={12} /> Verified Buyer
              </span>
            </div>
          </div>
        </div>
        <Link 
          href="/buyer/profile/edit"
          className="px-6 py-3 bg-white border border-zinc-200 rounded-2xl font-bold text-zinc-900 flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all shadow-sm active:scale-95"
        >
          <Edit2 size={18} /> Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Account Overview */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <Settings size={20} className="text-zinc-400" /> Account Settings
            </h2>
            <div className="space-y-4">
              <ProfileLink 
                icon={<CreditCard className="text-blue-600" />}
                title="Payment Methods"
                description="Manage your credit cards and wallet"
                href="/finance/wallet"
              />
              <ProfileLink 
                icon={<ShoppingBag className="text-emerald-600" />}
                title="Purchase History"
                description="View all your past orders and receipts"
                href="/buyer/purchases"
              />
              <ProfileLink 
                icon={<ShieldCheck className="text-purple-600" />}
                title="Security"
                description="Change password and 2FA settings"
                href="#"
              />
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full p-6 bg-red-50 text-red-600 rounded-3xl border border-red-100 font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-all active:scale-95"
          >
            <LogOut size={20} /> Log Out from LiveShop
          </button>
        </div>

        {/* Stats & Activity */}
        <div className="space-y-6">
          <div className="bg-zinc-900 p-8 rounded-3xl text-white shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CreditCard size={20} className="text-emerald-500" /> Wallet Balance
            </h2>
            <div className="space-y-1">
              <p className="text-zinc-400 text-sm font-medium">Available Funds</p>
              <h3 className="text-5xl font-bold tracking-tighter">${user.walletBalance.toFixed(2)}</h3>
            </div>
            <Link 
              href="/finance/wallet"
              className="block w-full py-4 bg-white text-zinc-900 rounded-2xl font-bold text-center hover:bg-zinc-100 transition-all active:scale-95"
            >
              Add Funds
            </Link>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <ShoppingBag size={20} className="text-zinc-400" /> Activity Summary
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-center space-y-1">
                <p className="text-2xl font-bold text-zinc-900">12</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Followers</p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-center space-y-1">
                <p className="text-2xl font-bold text-zinc-900">45</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Likes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileLink({ icon, title, description, href }: { icon: React.ReactNode, title: string, description: string, href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-100 transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900">{title}</p>
          <p className="text-[10px] text-zinc-500 font-medium">{description}</p>
        </div>
      </div>
      <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-900 transition-colors" />
    </Link>
  );
}
