'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingBag,
  Users,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { getSupabaseBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

type DbPurchase = {
  id: string;
  product_id: string;
  amount: number;
  status: string;
  created_at: string;
};

type DbProduct = {
  id: string;
  name: string;
  image: string;
};

export default function VendorHistoryPage() {
  const { user } = useAuth();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Sales History</h1>
          <p className="text-zinc-500">Log in as a seller to analyze your sales</p>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-10 text-center space-y-4">
          <BarChart3 size={44} className="mx-auto text-zinc-400" />
          <p className="text-lg font-bold text-zinc-900">Visitor mode</p>
          <p className="text-sm text-zinc-500">To view revenue stats and export sales, please log in.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/login" className="px-6 py-3 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all">
              Log in
            </Link>
            <Link href="/register/role" className="px-6 py-3 bg-white border border-zinc-200 rounded-2xl font-bold text-zinc-900 hover:bg-zinc-50 transition-all">
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [loading, setLoading] = useState(true);
  const [windowDays, setWindowDays] = useState<7 | 30>(7);
  const [purchases, setPurchases] = useState<DbPurchase[]>([]);
  const [productsById, setProductsById] = useState<Record<string, DbProduct>>({});

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);
  const [uniqueBuyers, setUniqueBuyers] = useState(0);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();
        const { data, error } = await supabase
          .from('purchases')
          .select('id, product_id, amount, status, created_at, buyer_id')
          .eq('vendor_id', user.id)
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(200);

        if (error) throw error;
        const rows = (data ?? []) as any[];

        setPurchases(rows as DbPurchase[]);
        setTotalOrders(rows.length);
        setTotalRevenue(rows.reduce((s, r) => s + Number(r.amount ?? 0), 0));
        setAvgOrderValue(rows.length ? rows.reduce((s, r) => s + Number(r.amount ?? 0), 0) / rows.length : 0);
        setUniqueBuyers(new Set(rows.map(r => String(r.buyer_id))).size);

        const productIds = [...new Set(rows.map(r => String(r.product_id)))].filter(Boolean);
        if (productIds.length) {
          const { data: prods, error: pErr } = await supabase.from('products').select('id, name, image').in('id', productIds);
          if (pErr) throw pErr;
          const map: Record<string, DbProduct> = {};
          for (const p of (prods ?? []) as DbProduct[]) map[p.id] = p;
          setProductsById(map);
        } else {
          setProductsById({});
        }
      } catch (e) {
        console.error(e);
        setPurchases([]);
        setProductsById({});
        setTotalRevenue(0);
        setTotalOrders(0);
        setAvgOrderValue(0);
        setUniqueBuyers(0);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [supabase, user, windowDays]);

  const exportCsv = () => {
    const rows = purchases.map((p) => {
      const prod = productsById[p.product_id];
      return {
        id: p.id,
        product: prod?.name ?? '',
        amount: Number(p.amount ?? 0),
        status: p.status,
        created_at: p.created_at,
      };
    });

    const header = ['id', 'product', 'amount', 'status', 'created_at'];
    const csv = [header.join(','), ...rows.map(r => header.map(h => JSON.stringify((r as any)[h] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_${windowDays}d.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, trend: '', up: true, icon: <DollarSign /> },
    { label: 'Total Orders', value: `${totalOrders}`, trend: '', up: true, icon: <ShoppingBag /> },
    { label: 'Avg. Order Value', value: `$${avgOrderValue.toFixed(2)}`, trend: '', up: true, icon: <BarChart3 /> },
    { label: 'Unique Buyers', value: `${uniqueBuyers}`, trend: '', up: true, icon: <Users /> },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Sales History</h1>
          <p className="text-zinc-500">Analyze your shop&apos;s performance over time</p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-zinc-200 rounded-xl font-bold text-zinc-900 hover:bg-zinc-50 transition-all shadow-sm"
        >
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
            <button
              type="button"
              onClick={() => setWindowDays(7)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold ${windowDays === 7 ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100'}`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setWindowDays(30)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold ${windowDays === 30 ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100'}`}
            >
              30 Days
            </button>
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-zinc-400">
                    <div className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Loading...</div>
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => {
                  const product = productsById[purchase.product_id];
                  return (
                    <tr key={purchase.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-8 py-6 text-sm font-bold text-zinc-900">#{purchase.id}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0">
                            {product?.image ? (
                              <Image src={product.image} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" />
                            ) : null}
                          </div>
                          <span className="text-sm font-medium text-zinc-700 truncate max-w-[200px]">{product?.name ?? 'Product'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-zinc-500">{new Date(purchase.created_at).toLocaleDateString()}</td>
                      <td className="px-8 py-6 text-sm font-bold text-zinc-900">${Number(purchase.amount).toFixed(2)}</td>
                      <td className="px-8 py-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            String(purchase.status).toUpperCase() === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-600'
                              : String(purchase.status).toUpperCase() === 'SHIPPED'
                                ? 'bg-blue-50 text-blue-600'
                                : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {String(purchase.status).toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
