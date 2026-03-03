'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Video, ShoppingBag, Users, ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { getSupabaseBrowserClient } from '@/lib/supabase';

type DbVideo = {
  id: string;
  vendor_id: string;
  title: string;
  thumbnail: string;
  is_live: boolean;
  view_count: number;
};

type DbProduct = {
  id: string;
  vendor_id: string;
  name: string;
  price: number;
  image: string;
};

type DbVendor = {
  id: string;
  name: string;
  avatar: string | null;
  is_verified: boolean;
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'VIDEOS' | 'PRODUCTS' | 'VENDORS'>('ALL');

  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<DbVideo[]>([]);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [vendors, setVendors] = useState<DbVendor[]>([]);

  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setVideos([]);
      setProducts([]);
      setVendors([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const t = setTimeout(async () => {
      try {
        const [vRes, pRes, vendorRes] = await Promise.all([
          supabase
            .from('videos')
            .select('id, vendor_id, title, thumbnail, is_live, view_count')
            .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
            .order('created_at', { ascending: false })
            .limit(20),
          supabase
            .from('products')
            .select('id, vendor_id, name, price, image')
            .ilike('name', `%${q}%`)
            .order('created_at', { ascending: false })
            .limit(20),
          supabase
            .from('profiles')
            .select('id, name, avatar, is_verified')
            .eq('role', 'VENDOR')
            .ilike('name', `%${q}%`)
            .order('created_at', { ascending: false })
            .limit(20),
        ]);

        if (vRes.error) throw vRes.error;
        if (pRes.error) throw pRes.error;
        if (vendorRes.error) throw vendorRes.error;

        if (cancelled) return;
        setVideos((vRes.data ?? []) as DbVideo[]);
        setProducts((pRes.data ?? []) as DbProduct[]);
        setVendors((vendorRes.data ?? []) as DbVendor[]);
      } catch (e) {
        console.error(e);
        if (cancelled) return;
        setVideos([]);
        setProducts([]);
        setVendors([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, supabase]);

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-white border border-zinc-200 rounded-xl text-zinc-500 hover:text-zinc-900 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input 
              type="text" 
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for videos, products, or vendors..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all text-lg shadow-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['ALL', 'VIDEOS', 'PRODUCTS', 'VENDORS'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-zinc-900 text-white shadow-lg' 
                  : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {!query && (
          <div className="text-center py-20 space-y-4 opacity-40">
            <Search size={64} className="mx-auto" />
            <p className="text-xl font-bold">Start typing to search LiveShop</p>
          </div>
        )}

        {query && (
          <div className="space-y-12">
            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-zinc-400" size={32} />
              </div>
            )}
            {/* Videos Results */}
            {(activeTab === 'ALL' || activeTab === 'VIDEOS') && videos.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <Video size={20} className="text-red-600" /> Videos ({videos.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {videos.map(video => (
                    <Link key={video.id} href={`/buyer/videos/${video.id}`} className="group bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl transition-all">
                      <div className="relative aspect-video">
                        <Image src={video.thumbnail} alt={video.title} fill className="object-cover" referrerPolicy="no-referrer" />
                        {video.is_live && <span className="absolute top-4 left-4 live-badge">Live</span>}
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-zinc-900 group-hover:text-red-600 transition-colors">{video.title}</h3>
                        <p className="text-xs text-zinc-500 mt-1">{video.view_count} views</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Products Results */}
            {(activeTab === 'ALL' || activeTab === 'PRODUCTS') && products.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <ShoppingBag size={20} className="text-emerald-600" /> Products ({products.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {products.map(product => (
                    <div key={product.id} className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
                      <div className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-100">
                        <Image src={product.image} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900 text-sm truncate">{product.name}</h3>
                        <p className="text-emerald-600 font-bold">$ {product.price}</p>
                      </div>
                      <Link
                        href={`/buyer/products/${product.id}`}
                        className="block w-full py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all text-center"
                      >
                        View Product
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Vendors Results */}
            {(activeTab === 'ALL' || activeTab === 'VENDORS') && vendors.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <Users size={20} className="text-blue-600" /> Vendors ({vendors.length})
                </h2>
                <div className="space-y-4">
                  {vendors.map(vendor => (
                    <Link
                      key={vendor.id}
                      href={`/buyer/vendors/${vendor.id}`}
                      className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center font-bold text-xl border border-zinc-200">
                          {vendor.name?.[0] ?? '?'}
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-900">{vendor.name}</h3>
                          <p className="text-xs text-zinc-500">{vendor.is_verified ? 'Verified Seller' : 'Seller'}</p>
                        </div>
                      </div>
                      <div className="p-3 bg-zinc-50 text-zinc-400 hover:text-zinc-900 rounded-xl border border-zinc-100 transition-all">
                        <ChevronRight size={20} />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {query && !loading && videos.length === 0 && products.length === 0 && vendors.length === 0 && (
              <div className="text-center py-20 space-y-4 opacity-40">
                <Search size={64} className="mx-auto" />
                <p className="text-xl font-bold">No results found for &quot;{query}&quot;</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
