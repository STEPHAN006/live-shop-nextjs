'use client';

import { useAuth } from '@/hooks/use-auth';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  ArrowLeft,
  History,
  Wallet,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function WalletPage() {
  const { user, isLoading } = useAuth();
  const [isDepositing, setIsDepositing] = useState(false);
  const [amount, setAmount] = useState('');

  if (isLoading || !user) return null;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDepositing(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsDepositing(false);
    setAmount('');
    alert('Deposit successful! (Demo only)');
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-12">
      <div className=" mx-auto space-y-8">
        <Link 
          href={user.role === 'BUYER' ? '/buyer/feed' : '/vendor/dashboard'} 
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wallet Card */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-zinc-900 rounded-[2.5rem] p-10 text-white shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-800 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500 rounded-full translate-y-1/2 -translate-x-1/2 opacity-10 blur-3xl"></div>
              
              <div className="relative space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                      <Wallet size={24} />
                    </div>
                    <span className="font-bold tracking-widest uppercase text-xs opacity-60">LiveShop Wallet</span>
                  </div>
                  <CreditCard size={32} className="opacity-40" />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-zinc-400">Current Balance</p>
                  <h2 className="text-5xl md:text-6xl font-bold tracking-tighter">${user.walletBalance.toFixed(2)}</h2>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button className="flex-grow py-4 bg-white text-zinc-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-100 transition-all active:scale-95">
                    <ArrowUpRight size={20} /> Withdraw
                  </button>
                  <button className="flex-grow py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-600/20">
                    <Plus size={20} /> Add Funds
                  </button>
                </div>
              </div>
            </motion.div>

            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="font-bold text-zinc-900 text-xl flex items-center gap-2">
                  <History size={20} className="text-zinc-400" /> Recent Transactions
                </h3>
                <button className="text-sm font-bold text-zinc-500 hover:text-zinc-900">View All</button>
              </div>
              <div className="divide-y divide-zinc-100">
                <TransactionItem 
                  type="DEPOSIT"
                  title="Wallet Top-up"
                  date="Oct 24, 2026"
                  amount={+150.00}
                  status="COMPLETED"
                />
                <TransactionItem 
                  type="PURCHASE"
                  title="Wireless Headphones"
                  date="Oct 22, 2026"
                  amount={-199.99}
                  status="COMPLETED"
                />
                <TransactionItem 
                  type="WITHDRAWAL"
                  title="Bank Transfer"
                  date="Oct 18, 2026"
                  amount={-500.00}
                  status="PENDING"
                />
              </div>
            </div>
          </div>

          {/* Quick Deposit */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
              <h3 className="font-bold text-zinc-900 text-lg">Quick Deposit</h3>
              <form onSubmit={handleDeposit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Amount ($)</label>
                  <input 
                    type="number" 
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all text-2xl font-bold"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[50, 100, 200].map(val => (
                    <button 
                      key={val}
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      className="py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-100 transition-all"
                    >
                      +${val}
                    </button>
                  ))}
                </div>
                <button 
                  type="submit"
                  disabled={isDepositing || !amount}
                  className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {isDepositing ? <Loader2 className="animate-spin" size={20} /> : 'Deposit Now'}
                </button>
              </form>
              <div className="pt-4 border-t border-zinc-100 flex items-center gap-3 text-zinc-400">
                <CheckCircle2 size={16} />
                <p className="text-[10px] font-bold uppercase tracking-widest">Secure 256-bit SSL Encryption</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TransactionItem({ type, title, date, amount, status }: { type: string, title: string, date: string, amount: number, status: string }) {
  const isPositive = amount > 0;
  return (
    <div className="p-6 flex items-center justify-between hover:bg-zinc-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
          type === 'DEPOSIT' ? 'bg-emerald-50 text-emerald-600' : 
          type === 'WITHDRAWAL' ? 'bg-blue-50 text-blue-600' : 'bg-zinc-100 text-zinc-900'
        }`}>
          {type === 'DEPOSIT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
        </div>
        <div>
          <p className="font-bold text-zinc-900">{title}</p>
          <p className="text-xs text-zinc-500 font-medium">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold ${isPositive ? 'text-emerald-600' : 'text-zinc-900'}`}>
          {isPositive ? '+' : ''}{amount.toFixed(2)}
        </p>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${
          status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'
        }`}>{status}</p>
      </div>
    </div>
  );
}
