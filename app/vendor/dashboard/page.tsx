'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  Video, 
  ShoppingBag, 
  ArrowUpRight, 
  Clock,
  ChevronRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { getSupabaseBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

type DbVideo = {
  id: string;
  title: string;
  thumbnail: string;
  is_live: boolean;
  view_count: number;
  created_at: string;
};

type DbProduct = {
  id: string;
  name: string;
  image: string;
  price: number;
  created_at: string;
};

type DbPurchase = {
  id: string;
  amount: number;
  created_at: string;
};

export default function VendorDashboardPage() {
  const { user } = useAuth();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [recentVideos, setRecentVideos] = useState<DbVideo[]>([]);
  const [topProducts, setTopProducts] = useState<DbProduct[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalVideos, setTotalVideos] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalViews, setTotalViews] = useState(0);

  useEffect(() => {
    if (!user) return;

    const run = async () => {
      setLoading(true);
      try {
        const [pRes, vRes, prodRes] = await Promise.all([
          supabase
            .from('purchases')
            .select('id, amount, created_at')
            .eq('vendor_id', user.id)
            .order('created_at', { ascending: false })
            .limit(200),
          supabase
            .from('videos')
            .select('id, title, thumbnail, is_live, view_count, created_at', { count: 'exact' })
            .eq('vendor_id', user.id)
            .order('created_at', { ascending: false })
            .limit(6),
          supabase
            .from('products')
            .select('id, name, image, price, created_at', { count: 'exact' })
            .eq('vendor_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3),
        ]);

        if (pRes.error) throw pRes.error;
        if (vRes.error) throw vRes.error;
        if (prodRes.error) throw prodRes.error;

        const purchases = (pRes.data ?? []) as DbPurchase[];
        const sales = purchases.reduce((sum, p) => sum + Number(p.amount ?? 0), 0);
        setTotalSales(sales);

        const vids = (vRes.data ?? []) as DbVideo[];
        setRecentVideos(vids);
        setTotalVideos(vRes.count ?? vids.length);
        setTotalViews(vids.reduce((sum, v) => sum + Number(v.view_count ?? 0), 0));

        const prods = (prodRes.data ?? []) as DbProduct[];
        setTopProducts(prods);
        setTotalProducts(prodRes.count ?? prods.length);
      } catch (e) {
        console.error(e);
        setRecentVideos([]);
        setTopProducts([]);
        setTotalSales(0);
        setTotalVideos(0);
        setTotalProducts(0);
        setTotalViews(0);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [supabase, user]);

  const stats = [
    {
      label: 'Total Sales',
      value: `$${totalSales.toFixed(2)}`,
      icon: <TrendingUp />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Total Views',
      value: `${totalViews}`,
      icon: <Users />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Videos',
      value: `${totalVideos}`,
      icon: <Video />,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Products',
      value: `${totalProducts}`,
      icon: <ShoppingBag />,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm space-y-4"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-zinc-900">{stat.value}</h3>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <ArrowUpRight size={14} /> +12% from last week
            </div>
          </motion.div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 className="animate-spin text-zinc-400" size={32} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="font-bold text-zinc-900 text-lg">Recent Videos</h2>
              <Link href="/vendor/videos" className="text-sm font-bold text-emerald-600 hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-zinc-100">
              {recentVideos.map((video) => (
                <div key={video.id} className="p-6 flex items-center gap-6 hover:bg-zinc-50 transition-colors group">
                  <div className="relative w-32 aspect-video rounded-xl overflow-hidden border border-zinc-200 shrink-0">
                    <Image src={video.thumbnail} alt={video.title} fill className="object-cover" referrerPolicy="no-referrer" />
                    {video.is_live && <span className="absolute top-2 left-2 live-badge">Live</span>}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-zinc-900 truncate group-hover:text-emerald-600 transition-colors">{video.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium mt-1">
                      <span className="flex items-center gap-1"><Users size={12} /> {video.view_count} views</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(video.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link href={`/vendor/videos/${video.id}/stats`} className="p-2 bg-zinc-50 text-zinc-400 hover:text-zinc-900 rounded-lg border border-zinc-100 transition-all">
                    <ChevronRight size={20} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100">
              <h2 className="font-bold text-zinc-900 text-lg">Top Products</h2>
            </div>
            <div className="p-6 space-y-6">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-zinc-200 shrink-0">
                    <Image src={product.image} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">{product.name}</p>
                    <p className="text-xs text-zinc-500 font-medium">$ {product.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-zinc-900">$</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Price</p>
                  </div>
                </div>
              ))}
              <Link href="/vendor/products" className="block w-full py-3 bg-zinc-50 text-zinc-500 text-center rounded-xl text-sm font-bold hover:bg-zinc-100 transition-all border border-zinc-100">
                Manage Catalog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
