'use client';

import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  Video, 
  ShoppingBag, 
  ArrowUpRight, 
  Clock,
  ChevronRight
} from 'lucide-react';
import { MOCK_VIDEOS, MOCK_PRODUCTS } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';

export default function VendorDashboardPage() {
  const stats = [
    { label: 'Total Sales', value: '$12,450', icon: <TrendingUp />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Viewers', value: '1.2k', icon: <Users />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Videos', value: '24', icon: <Video />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Products Sold', value: '450', icon: <ShoppingBag />, color: 'text-amber-600', bg: 'bg-amber-50' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="font-bold text-zinc-900 text-lg">Recent Videos</h2>
              <Link href="/vendor/videos" className="text-sm font-bold text-emerald-600 hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-zinc-100">
              {MOCK_VIDEOS.map((video) => (
                <div key={video.id} className="p-6 flex items-center gap-6 hover:bg-zinc-50 transition-colors group">
                  <div className="relative w-32 aspect-video rounded-xl overflow-hidden border border-zinc-200 shrink-0">
                    <Image src={video.thumbnail} alt={video.title} fill className="object-cover" referrerPolicy="no-referrer" />
                    {video.isLive && <span className="absolute top-2 left-2 live-badge">Live</span>}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-zinc-900 truncate group-hover:text-emerald-600 transition-colors">{video.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium mt-1">
                      <span className="flex items-center gap-1"><Users size={12} /> {video.viewCount} views</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(video.createdAt).toLocaleDateString()}</span>
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
              {MOCK_PRODUCTS.slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-zinc-200 shrink-0">
                    <Image src={product.image} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">{product.name}</p>
                    <p className="text-xs text-zinc-500 font-medium">$ {product.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-zinc-900">124</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Sales</p>
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
