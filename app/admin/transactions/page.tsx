'use client';

import { motion } from 'motion/react';
import { Search, Filter, DollarSign, Download, ArrowUpRight, ArrowDownRight, CreditCard, ShoppingBag, Users, BarChart3, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export default function AdminTransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [buyersById, setBuyersById] = useState<Record<string, any>>({});

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('purchases')
        .select('id, buyer_id, product_id, amount, status, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        setPurchases([]);
        setBuyersById({});
        setIsLoading(false);
        return;
      }

      const buyerIds = Array.from(new Set((data ?? []).map((p) => p.buyer_id).filter(Boolean)));
      if (buyerIds.length > 0) {
        const { data: buyers } = await supabase.from('profiles').select('id, name').in('id', buyerIds);
        const map: Record<string, any> = {};
        for (const b of buyers ?? []) map[b.id] = b;
        setBuyersById(map);
      } else {
        setBuyersById({});
      }

      setPurchases(data ?? []);
      setIsLoading(false);
    };

    load();
  }, []);

  const filteredPurchases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return purchases;
    return purchases.filter((p) => {
      const buyerName = String(buyersById[p.buyer_id]?.name ?? '').toLowerCase();
      return String(p.id ?? '').toLowerCase().includes(q) || buyerName.includes(q);
    });
  }, [buyersById, purchases, searchQuery]);

  const { totalVolume, totalFees, totalTransactions, activeWallets } = useMemo(() => {
    const total = purchases.reduce((acc, p) => acc + Number(p.amount ?? 0), 0);
    const fees = purchases.reduce((acc, p) => acc + Number(p.amount ?? 0) * 0.1, 0);
    const wallets = new Set(purchases.map((p) => p.buyer_id).filter(Boolean)).size;
    return {
      totalVolume: total,
      totalFees: fees,
      totalTransactions: purchases.length,
      activeWallets: wallets,
    };
  }, [purchases]);

  const stats = useMemo(() => {
    return [
      { label: 'Total Volume', value: `$${totalVolume.toFixed(2)}`, trend: 'Live', up: true, icon: <DollarSign /> },
      { label: 'Platform Fees', value: `$${totalFees.toFixed(2)}`, trend: 'Live', up: true, icon: <TrendingUp /> },
      { label: 'Total Transactions', value: totalTransactions.toLocaleString(), trend: 'Live', up: true, icon: <ShoppingBag /> },
      { label: 'Active Wallets', value: activeWallets.toLocaleString(), trend: 'Live', up: true, icon: <Users /> },
    ];
  }, [activeWallets, totalFees, totalTransactions, totalVolume]);

  const handleExport = () => {
    const rows = filteredPurchases.map((p) => {
      const buyerName = buyersById[p.buyer_id]?.name ?? '';
      const fee = Number(p.amount ?? 0) * 0.1;
      return {
        id: p.id,
        type: 'Purchase',
        buyer: buyerName,
        created_at: p.created_at,
        amount: Number(p.amount ?? 0),
        fee,
      };
    });

    const header = ['id', 'type', 'buyer', 'created_at', 'amount', 'fee'];
    const csv = [
      header.join(','),
      ...rows.map((r) =>
        header
          .map((k) => {
            const v = (r as any)[k];
            const s = String(v ?? '');
            return `"${s.replace(/\"/g, '""')}"`;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Financial Auditing</h1>
          <p className="text-zinc-500">Monitor all platform transactions and platform revenue</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-zinc-200 rounded-xl font-bold text-zinc-900 hover:bg-zinc-50 transition-all shadow-sm"
          >
            <Download size={18} /> Export Audit Log
          </button>
        </div>
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
        <div className="p-8 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="font-bold text-zinc-900 text-xl flex items-center gap-2">
            <CreditCard size={20} className="text-zinc-400" /> Transaction Log
          </h2>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by ID or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all w-full md:w-64"
              />
            </div>
            <button className="p-2 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-500 hover:text-zinc-900 transition-all">
              <Filter size={18} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50">
                <th className="px-8 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Transaction ID</th>
                <th className="px-8 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">User</th>
                <th className="px-8 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? null : filteredPurchases.map((purchase) => {
                const buyer = buyersById[purchase.buyer_id];
                const amount = Number(purchase.amount ?? 0);
                return (
                  <tr key={purchase.id} className="hover:bg-zinc-50 transition-colors group">
                    <td className="px-8 py-6 text-sm font-bold text-zinc-900">#{purchase.id}</td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider border border-blue-100">
                        Purchase
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">
                          {buyer?.name[0]}
                        </div>
                        <span className="text-sm font-medium text-zinc-700">{buyer?.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-zinc-500">{new Date(purchase.created_at).toLocaleDateString()}</td>
                    <td className="px-8 py-6 text-sm font-bold text-zinc-900">${amount.toFixed(2)}</td>
                    <td className="px-8 py-6 text-sm font-bold text-emerald-600">+${(amount * 0.1).toFixed(2)}</td>
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
