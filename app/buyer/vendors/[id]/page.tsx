'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { getSupabaseBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

type DbProfile = {
  id: string;
  name: string;
  avatar: string | null;
  is_verified: boolean;
};

type DbVideo = {
  id: string;
  vendor_id: string;
  title: string;
  description: string;
  thumbnail: string;
  video_url: string;
  is_live: boolean;
  likes: number;
  view_count: number;
  created_at: string;
};

type DbProduct = {
  id: string;
  vendor_id: string;
  name: string;
  price: number;
  image: string;
};

export default function BuyerVendorPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = getSupabaseBrowserClient();

  const vendorId = String(id ?? '');

  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<DbProfile | null>(null);
  const [videos, setVideos] = useState<DbVideo[]>([]);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  useEffect(() => {
    if (!vendorId) return;

    const run = async () => {
      setLoading(true);
      try {
        const { data: prof, error: pErr } = await supabase
          .from('profiles')
          .select('id, name, avatar, is_verified')
          .eq('id', vendorId)
          .maybeSingle();
        if (pErr) throw pErr;
        if (!prof) {
          setVendor(null);
          setVideos([]);
          setProducts([]);
          setIsFollowing(false);
          return;
        }
        setVendor(prof as DbProfile);

        const [{ data: vids, error: vErr }, { data: prods, error: prErr }] = await Promise.all([
          supabase
            .from('videos')
            .select('id, vendor_id, title, description, thumbnail, video_url, is_live, likes, view_count, created_at')
            .eq('vendor_id', vendorId)
            .eq('is_live', false)
            .order('created_at', { ascending: false }),
          supabase
            .from('products')
            .select('id, vendor_id, name, price, image')
            .eq('vendor_id', vendorId)
            .order('created_at', { ascending: false }),
        ]);

        if (vErr) throw vErr;
        if (prErr) throw prErr;
        setVideos((vids ?? []) as DbVideo[]);
        setProducts((prods ?? []) as DbProduct[]);

        if (user) {
          const { data: followRow, error: fErr } = await supabase
            .from('vendor_follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('vendor_id', vendorId)
            .maybeSingle();
          if (fErr) throw fErr;
          setIsFollowing(!!followRow);
        } else {
          setIsFollowing(false);
        }
      } catch (e) {
        console.error(e);
        setVendor(null);
        setVideos([]);
        setProducts([]);
        setIsFollowing(false);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [supabase, user, vendorId]);

  const toggleFollow = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!vendorId) return;

    setFollowBusy(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('vendor_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('vendor_id', vendorId);
        if (error) throw error;
        setIsFollowing(false);
      } else {
        const { error } = await supabase
          .from('vendor_follows')
          .insert({ follower_id: user.id, vendor_id: vendorId });
        if (error) throw error;
        setIsFollowing(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFollowBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-zinc-400" size={48} />
        </div>
      </div>
    );
  }

  if (!vendor) {
    return <div className="max-w-6xl mx-auto">Vendor not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Link href="/buyer/feed" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
        <ArrowLeft size={18} /> Back
      </Link>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-zinc-900 text-white flex items-center justify-center font-bold text-3xl shadow-lg">
              {vendor.name?.[0] ?? '?'}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{vendor.name}</h1>
                {vendor.is_verified && (
                  <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                    Verified
                  </div>
                )}
              </div>
              <div className="flex items-center gap-6 text-sm text-zinc-500">
                <span>{videos.length} Videos</span>
                <span>•</span>
                <span>{products.length} Products</span>
              </div>
            </div>
          </div>

          <button
            onClick={toggleFollow}
            disabled={followBusy}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-60 ${
              isFollowing
                ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
                : 'bg-zinc-900 text-white hover:bg-zinc-800'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>

      {videos.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-900">Videos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {videos.map((v, idx) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                className="group relative aspect-[9/16] bg-zinc-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
              >
                <Link href={`/buyer/videos/${v.id}`} className="block relative h-full">
                  <Image src={v.thumbnail} alt={v.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="text-xs font-bold text-white line-clamp-2 drop-shadow-md">{v.title}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {products.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-900">Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                className="bg-white rounded-2xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image src={p.image} alt={p.name} fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold text-zinc-900 line-clamp-1">{p.name}</p>
                  <p className="text-sm font-bold text-red-600">${p.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {videos.length === 0 && products.length === 0 && (
        <div className="text-center py-20 opacity-40">
          <p className="text-lg font-bold">No content yet</p>
        </div>
      )}
    </div>
  );
}
