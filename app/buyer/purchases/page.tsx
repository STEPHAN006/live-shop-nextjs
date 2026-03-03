'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Package, Truck, CheckCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { getSupabaseBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

type DbPurchase = {
  id: string;
  buyer_id: string;
  vendor_id: string;
  product_id: string;
  amount: number;
  status: string;
  created_at: string;
};

type DbProduct = {
  id: string;
  name: string;
  image: string;
  price: number;
};

type DbProfile = {
  id: string;
  name: string;
  avatar: string | null;
};

export default function BuyerPurchasesPage() {
  const { user } = useAuth();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<DbPurchase[]>([]);
  const [productsById, setProductsById] = useState<Record<string, DbProduct>>({});
  const [vendorsById, setVendorsById] = useState<Record<string, DbProfile>>({});

  useEffect(() => {
    if (!user) return;

    const run = async () => {
      setLoading(true);
      try {
        const { data: pData, error: pErr } = await supabase
          .from('purchases')
          .select('id, buyer_id, vendor_id, product_id, amount, status, created_at')
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (pErr) throw pErr;
        const rows = (pData ?? []) as DbPurchase[];
        setPurchases(rows);

        const productIds = [...new Set(rows.map(r => r.product_id))].filter(Boolean);
        const vendorIds = [...new Set(rows.map(r => r.vendor_id))].filter(Boolean);

        const [{ data: prods, error: prodErr }, { data: vends, error: vErr }] = await Promise.all([
          productIds.length
            ? supabase.from('products').select('id, name, image, price').in('id', productIds)
            : Promise.resolve({ data: [], error: null } as any),
          vendorIds.length
            ? supabase.from('profiles').select('id, name, avatar').in('id', vendorIds)
            : Promise.resolve({ data: [], error: null } as any),
        ]);

        if (prodErr) throw prodErr;
        if (vErr) throw vErr;

        const prodMap: Record<string, DbProduct> = {};
        for (const p of (prods ?? []) as DbProduct[]) prodMap[p.id] = p;
        setProductsById(prodMap);

        const vendMap: Record<string, DbProfile> = {};
        for (const v of (vends ?? []) as DbProfile[]) vendMap[v.id] = v;
        setVendorsById(vendMap);
      } catch (e) {
        console.error(e);
        setPurchases([]);
        setProductsById({});
        setVendorsById({});
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [supabase, user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">My Purchases</h1>
        <p className="text-zinc-500">Track and manage your orders</p>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-zinc-400" size={48} />
          </div>
        ) : purchases.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl border border-zinc-200 text-center space-y-4 opacity-40">
            <ShoppingBag size={64} className="mx-auto" />
            <p className="text-xl font-bold uppercase tracking-widest">No purchases yet</p>
          </div>
        ) : (
          purchases.map((purchase) => {
            const product = productsById[purchase.product_id];
            const vendor = vendorsById[purchase.vendor_id];

            return (
              <motion.div
                key={purchase.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start md:items-center"
              >
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-zinc-100 shrink-0 bg-zinc-50">
                  {product?.image ? (
                    <Image src={product.image} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" />
                  ) : null}
                </div>

                <div className="flex-grow space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Order #{purchase.id}</span>
                    <span className="text-zinc-300">•</span>
                    <span className="text-xs font-medium text-zinc-500">{new Date(purchase.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900">{product?.name ?? 'Product'}</h3>
                  <p className="text-sm text-zinc-500 font-medium">
                    Sold by{' '}
                    <Link href={`/buyer/vendors/${purchase.vendor_id}`} className="text-zinc-900 font-bold hover:underline">
                      {vendor?.name ?? 'Vendor'}
                    </Link>
                  </p>
                </div>

                <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                  <div className="text-right">
                    <p className="text-xl font-bold text-zinc-900">${Number(purchase.amount).toFixed(2)}</p>
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${
                        purchase.status === 'delivered' || purchase.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-600'
                          : purchase.status === 'shipped' || purchase.status === 'SHIPPED'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {purchase.status === 'delivered' || purchase.status === 'DELIVERED' ? (
                        <CheckCircle2 size={12} />
                      ) : purchase.status === 'shipped' || purchase.status === 'SHIPPED' ? (
                        <Truck size={12} />
                      ) : (
                        <Package size={12} />
                      )}
                      {String(purchase.status).toUpperCase()}
                    </div>
                  </div>

                  {product?.id && (
                    <Link
                      href={`/buyer/products/${product.id}`}
                      className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all"
                    >
                      View product
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
