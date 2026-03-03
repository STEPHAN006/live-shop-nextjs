'use client';

import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingBag,
  Users
} from 'lucide-react';
import { MOCK_PURCHASES, MOCK_PRODUCTS } from '@/lib/data';
import Image from 'next/image';

export default function VendorHistoryPage() {
  const stats = [
    { label: 'Total Revenue', value: '$45,200', trend: '+12.5%', up: true, icon: <DollarSign /> },
    { label: 'Total Orders', value: '1,240', trend: '+8.2%', up: true, icon: <ShoppingBag /> },
    { label: 'Avg. Order Value', value: '$36.45', trend: '-2.4%', up: false, icon: <TrendingUp /> },
    { label: 'New Customers', value: '145', trend: '+15.8%', up: true, icon: <Users /> },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Sales History</h1>
          <p className="text-zinc-500">Analyze your shop&apos;s performance over time</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-zinc-200 rounded-xl font-bold text-zinc-900 hover:bg-zinc-50 transition-all shadow-sm">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-50 text-zinc-400 flex items-center justify-center">
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-bold text-zinc-900">{stat.value}</h3>
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold ${stat.up ? 'text-emerald-600' : 'text-red-600'}`}>
              {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {stat.trend}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="font-bold text-zinc-900 text-xl flex items-center gap-2">
            <Calendar size={20} className="text-zinc-400" /> Recent Sales
          </h2>
          <div className="flex gap-2">
            <button className="px-4 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-bold">7 Days</button>
            <button className="px-4 py-1.5 bg-zinc-50 text-zinc-500 rounded-lg text-xs font-bold hover:bg-zinc-100">30 Days</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50">
                <th className="px-8 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Order ID</th>
                <th className="px-8 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Product</th>
                <th className="px-8 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {MOCK_PURCHASES.map((purchase) => {
                const product = MOCK_PRODUCTS.find(p => p.id === purchase.productId);
                return (
                  <tr key={purchase.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-8 py-6 text-sm font-bold text-zinc-900">#{purchase.id}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0">
                          <Image src={product?.image || ''} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-sm font-medium text-zinc-700 truncate max-w-[200px]">{product?.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-zinc-500">{new Date(purchase.createdAt).toLocaleDateString()}</td>
                    <td className="px-8 py-6 text-sm font-bold text-zinc-900">${purchase.amount.toFixed(2)}</td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        purchase.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {purchase.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
