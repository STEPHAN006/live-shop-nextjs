'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2, ShoppingBag } from 'lucide-react';

import { getSupabaseBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

type DbProduct = {
  id: string;
  vendor_id: string;
  name: string;
  price: number;
  image: string;
  description: string | null;
};

type DbProfile = {
  id: string;
  name: string;
  avatar: string | null;
};

export default function BuyerProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = getSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [vendor, setVendor] = useState<DbProfile | null>(null);
  const [buyBusy, setBuyBusy] = useState(false);
  const [buyOk, setBuyOk] = useState(false);

  useEffect(() => {
    const productId = String(id ?? '');
    if (!productId) return;

    const run = async () => {
      setLoading(true);
      try {
        const { data: p, error: pErr } = await supabase
          .from('products')
          .select('id, vendor_id, name, price, image, description')
          .eq('id', productId)
          .maybeSingle();

        if (pErr) throw pErr;
        if (!p) {
          setProduct(null);
          setVendor(null);
          return;
        }

        setProduct(p as DbProduct);

        const { data: v, error: vErr } = await supabase
          .from('profiles')
          .select('id, name, avatar')
          .eq('id', (p as any).vendor_id)
          .maybeSingle();

        if (vErr) throw vErr;
        setVendor((v ?? null) as DbProfile | null);
      } catch (e) {
        console.error(e);
        setProduct(null);
        setVendor(null);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id, supabase]);

  const handleBuy = async () => {
    if (!product) return;
    if (!user) {
      router.push('/login');
      return;
    }

    setBuyBusy(true);
    setBuyOk(false);
    try {
      const { error } = await supabase
        .from('purchases')
        .insert({
          buyer_id: user.id,
          vendor_id: product.vendor_id,
          product_id: product.id,
          amount: product.price,
          status: 'completed',
        });

      if (error) throw error;
      setBuyOk(true);
      setTimeout(() => setBuyOk(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setBuyBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-20 flex justify-center">
        <Loader2 className="animate-spin text-zinc-400" size={48} />
      </div>
    );
  }

  if (!product) {
    return <div className="max-w-5xl mx-auto">Product not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link href="/search" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
        <ArrowLeft size={18} /> Back to search
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="relative aspect-square">
            <Image src={product.image} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-8 space-y-5">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{product.name}</h1>
            <p className="text-2xl font-bold text-emerald-600">$ {product.price}</p>
          </div>

          {vendor && (
            <Link href={`/buyer/vendors/${vendor.id}`} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-zinc-300 transition-all">
              <div>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Sold by</p>
                <p className="font-bold text-zinc-900">{vendor.name}</p>
              </div>
              <div className="text-xs font-bold text-zinc-500">Visit store</div>
            </Link>
          )}

          {product.description && <p className="text-zinc-600 leading-relaxed">{product.description}</p>}

          <button
            type="button"
            onClick={handleBuy}
            disabled={buyBusy}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg active:scale-95 disabled:opacity-70"
          >
            <ShoppingBag size={18} /> {buyBusy ? 'Processing...' : 'Buy now'}
          </button>

          {buyOk && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-bold">
              Purchase successful.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
