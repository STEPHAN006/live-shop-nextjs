'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, XCircle, Store, Video, ShoppingBag, User as UserIcon } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { Modal } from '@/components/ui/modal';

export default function AdminVendorDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const vendorId = params?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [vendor, setVendor] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);

  const [infoOpen, setInfoOpen] = useState(false);
  const [infoTitle, setInfoTitle] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => {
    if (!vendorId) return;

    const load = async () => {
      setIsLoading(true);
      const supabase = getSupabaseBrowserClient();

      const [vendorRes, productsRes, videosRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, name, email, role, is_verified, wallet_balance, created_at')
          .eq('id', vendorId)
          .maybeSingle(),
        supabase
          .from('products')
          .select('id, name, price, created_at')
          .eq('vendor_id', vendorId)
          .order('created_at', { ascending: false }),
        supabase
          .from('videos')
          .select('id, title, is_live, view_count, likes, created_at')
          .eq('vendor_id', vendorId)
          .order('created_at', { ascending: false }),
      ]);

      if (vendorRes.error) {
        setVendor(null);
        setProducts([]);
        setVideos([]);
        setInfoTitle('Error');
        setInfoMessage(vendorRes.error.message);
        setInfoOpen(true);
        setIsLoading(false);
        return;
      }

      setVendor(vendorRes.data ?? null);
      setProducts(productsRes.data ?? []);
      setVideos(videosRes.data ?? []);
      setIsLoading(false);
    };

    load();
  }, [vendorId]);

  const openInfo = (title: string, message: string) => {
    setInfoTitle(title);
    setInfoMessage(message);
    setInfoOpen(true);
  };

  const setVerified = async (isVerified: boolean) => {
    if (!vendorId) return;
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('profiles').update({ is_verified: isVerified }).eq('id', vendorId);
    if (error) {
      openInfo('Error', error.message);
      return;
    }
    setVendor((prev: any) => (prev ? { ...prev, is_verified: isVerified } : prev));
  };

  const stats = useMemo(() => {
    return {
      products: products.length,
      videos: videos.length,
    };
  }, [products.length, videos.length]);

  return (
    <div className="space-y-8">
      <Modal
        open={infoOpen}
        title={infoTitle}
        onClose={() => setInfoOpen(false)}
        footer={
          <button
            type="button"
            onClick={() => setInfoOpen(false)}
            className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all"
          >
            Close
          </button>
        }
      >
        <p className="text-sm text-zinc-600 leading-relaxed">{infoMessage}</p>
      </Modal>

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 hover:bg-zinc-50 transition-all shadow-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openInfo('Documents', 'Documents review is not implemented yet (storage / uploads).')}
            className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-md"
          >
            Review Documents
          </button>
          <button
            type="button"
            onClick={() => setVerified(false)}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-100 transition-all shadow-sm text-xs font-bold"
          >
            <span className="inline-flex items-center gap-2"><XCircle size={16} /> Reject</span>
          </button>
          <button
            type="button"
            onClick={() => setVerified(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg text-xs font-bold"
          >
            <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} /> Approve</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-8 space-y-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold text-xl">
              {vendor?.name?.[0] ?? '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">{vendor?.name ?? 'Vendor'}</h1>
              <p className="text-sm text-zinc-500">{vendor?.email ?? ''}</p>
              <div className="mt-3">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    vendor?.is_verified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}
                >
                  <Store size={12} /> {vendor?.is_verified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Products</p>
              <p className="text-2xl font-bold text-zinc-900 mt-2">{stats.products}</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Videos</p>
              <p className="text-2xl font-bold text-zinc-900 mt-2">{stats.videos}</p>
            </div>
          </div>
        </div>

        {isLoading ? null : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2"><ShoppingBag size={16} className="text-zinc-400" /> Products</h2>
              <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <div className="divide-y divide-zinc-100">
                  {products.length === 0 ? (
                    <div className="p-6 text-sm text-zinc-500">No products</div>
                  ) : (
                    products.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => openInfo('Product', `${p.name} ($${Number(p.price ?? 0).toFixed(2)})`)}
                        className="w-full text-left p-6 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-zinc-900 truncate">{p.name}</p>
                          <p className="text-xs text-zinc-500">${Number(p.price ?? 0).toFixed(2)}</p>
                        </div>
                        <span className="text-xs font-bold text-zinc-500">Details</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2"><Video size={16} className="text-zinc-400" /> Videos</h2>
              <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <div className="divide-y divide-zinc-100">
                  {videos.length === 0 ? (
                    <div className="p-6 text-sm text-zinc-500">No videos</div>
                  ) : (
                    videos.map((v) => (
                      <button
                        type="button"
                        key={v.id}
                        onClick={() => openInfo('Video', v.title)}
                        className="w-full text-left p-6 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-zinc-900 truncate">{v.title}</p>
                          <p className="text-xs text-zinc-500">Views: {Number(v.view_count ?? 0)} · Likes: {Number(v.likes ?? 0)}</p>
                        </div>
                        <span className="text-xs font-bold text-zinc-500">Details</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
