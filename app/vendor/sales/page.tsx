'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Clock
} from 'lucide-react';
import Image from 'next/image';

import { getSupabaseBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

type DbPurchase = {
  id: string;
  vendor_id: string;
  buyer_id: string;
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

type DbBuyer = {
  id: string;
  name: string;
  avatar: string | null;
};

export default function VendorSalesPage() {
  const { user } = useAuth();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<DbPurchase[]>([]);
  const [productsById, setProductsById] = useState<Record<string, DbProduct>>({});
  const [buyersById, setBuyersById] = useState<Record<string, DbBuyer>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const run = async () => {
      setLoading(true);
      try {
        const { data: pData, error: pErr } = await supabase
          .from('purchases')
          .select('id, vendor_id, buyer_id, product_id, amount, status, created_at')
          .eq('vendor_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (pErr) throw pErr;
        const rows = (pData ?? []) as DbPurchase[];
        setOrders(rows);

        const productIds = [...new Set(rows.map(r => r.product_id))].filter(Boolean);
        const buyerIds = [...new Set(rows.map(r => r.buyer_id))].filter(Boolean);

        const [{ data: prods, error: prodErr }, { data: buyers, error: bErr }] = await Promise.all([
          productIds.length
            ? supabase.from('products').select('id, name, image').in('id', productIds)
            : Promise.resolve({ data: [], error: null } as any),
          buyerIds.length
            ? supabase.from('profiles').select('id, name, avatar').in('id', buyerIds)
            : Promise.resolve({ data: [], error: null } as any),
        ]);

        if (prodErr) throw prodErr;
        if (bErr) throw bErr;

        const prodMap: Record<string, DbProduct> = {};
        for (const p of (prods ?? []) as DbProduct[]) prodMap[p.id] = p;
        setProductsById(prodMap);

        const buyerMap: Record<string, DbBuyer> = {};
        for (const b of (buyers ?? []) as DbBuyer[]) buyerMap[b.id] = b;
        setBuyersById(buyerMap);
      } catch (e) {
        console.error(e);
        setOrders([]);
        setProductsById({});
        setBuyersById({});
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [supabase, user]);

  const normalized = (s: string) => s.toLowerCase();
  const filtered = orders.filter((o) => {
    if (!query.trim()) return true;
    const q = normalized(query.trim());
    const product = productsById[o.product_id];
    const buyer = buyersById[o.buyer_id];
    return (
      normalized(String(o.id)).includes(q) ||
      normalized(product?.name ?? '').includes(q) ||
      normalized(buyer?.name ?? '').includes(q)
    );
  });

  const pendingOrders = filtered.filter(p => String(p.status).toUpperCase() === 'PENDING');
  const shippedOrders = filtered.filter(p => String(p.status).toUpperCase() === 'SHIPPED');

  const nextStatus = (s: string) => {
    const up = String(s).toUpperCase();
    if (up === 'PENDING') return 'shipped';
    if (up === 'SHIPPED') return 'delivered';
    return 'delivered';
  };

  const handleAdvanceStatus = async (order: DbPurchase) => {
    if (busyId) return;
    setBusyId(order.id);
    try {
      const newStatus = nextStatus(order.status);
      const { error } = await supabase
        .from('purchases')
        .update({ status: newStatus })
        .eq('id', order.id)
        .eq('vendor_id', order.vendor_id);
      if (error) throw error;
      setOrders(prev => prev.map(o => (o.id === order.id ? { ...o, status: newStatus } : o)));
    } catch (e) {
      console.error(e);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Order Management</h1>
          <p className="text-zinc-500">Track and fulfill your customer orders</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search orders..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all w-full md:w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30">
              <h2 className="font-bold text-zinc-900 flex items-center gap-2">
                <Clock size={18} className="text-amber-500" /> Active Orders
              </h2>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{filtered.length} Total</span>
            </div>
            <div className="divide-y divide-zinc-100">
              {loading ? (
                <div className="p-10 text-center text-zinc-400">Loading...</div>
              ) : filtered.map((order) => {
                const product = productsById[order.product_id];
                const buyer = buyersById[order.buyer_id];
                
                return (
                  <div key={order.id} className="p-6 hover:bg-zinc-50 transition-colors group">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-zinc-100 shrink-0">
                        {product?.image ? (
                          <Image src={product.image} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" />
                        ) : null}
                      </div>
                      
                      <div className="flex-grow space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Order #{order.id}</span>
                          <span className="text-zinc-300">•</span>
                          <span className="text-xs font-medium text-zinc-500">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 truncate">{product?.name ?? 'Product'}</h3>
                        <p className="text-sm text-zinc-500 font-medium">Customer: <span className="text-zinc-900 font-bold">{buyer?.name ?? 'Buyer'}</span></p>
                      </div>

                      <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                        <div className="text-right">
                          <p className="text-lg font-bold text-zinc-900">${Number(order.amount).toFixed(2)}</p>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${
                            String(order.status).toUpperCase() === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' : 
                            String(order.status).toUpperCase() === 'SHIPPED' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {String(order.status).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(order)}
                            disabled={busyId === order.id}
                            className="flex-grow md:flex-grow-0 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-md disabled:opacity-70"
                          >
                            Advance status
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Stats */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-8">
            <h2 className="text-xl font-bold text-zinc-900">Order Summary</h2>
            
            <div className="space-y-4">
              <StatRow label="Pending Fulfillment" value={pendingOrders.length} color="text-amber-600" bg="bg-amber-50" icon={<Clock size={18} />} />
              <StatRow label="In Transit" value={shippedOrders.length} color="text-blue-600" bg="bg-blue-50" icon={<Truck size={18} />} />
              <StatRow label="Delivered" value={Math.max(0, filtered.length - pendingOrders.length - shippedOrders.length)} color="text-emerald-600" bg="bg-emerald-50" icon={<CheckCircle2 size={18} />} />
            </div>

            <div className="pt-6 border-t border-zinc-100">
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex gap-3 text-zinc-500">
                <AlertCircle className="shrink-0" size={20} />
                <p className="text-xs leading-relaxed font-medium">
                  Orders should be shipped within 48 hours to maintain your vendor rating.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, color, bg, icon }: { label: string, value: number, color: string, bg: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-zinc-50 bg-zinc-50/50">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-sm font-bold text-zinc-700">{label}</span>
      </div>
      <span className={`text-xl font-bold ${color}`}>{value}</span>
    </div>
  );
}
