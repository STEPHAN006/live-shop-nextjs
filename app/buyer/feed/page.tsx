'use client';

import { MOCK_VIDEOS, MOCK_USERS } from '@/lib/data';
import { Video } from '@/lib/types';
import { motion } from 'motion/react';
import { Play, Heart, MessageCircle, Eye, UserPlus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function BuyerFeedPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Live Feed</h1>
          <p className="text-zinc-500">Discover what&apos;s happening right now</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold shadow-md">Trending</button>
          <button className="px-4 py-2 bg-white text-zinc-500 border border-zinc-200 rounded-xl text-sm font-bold hover:bg-zinc-50">Newest</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {MOCK_VIDEOS.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}

function VideoCard({ video }: { video: Video }) {
  const vendor = MOCK_USERS.find(u => u.id === video.vendorId);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white rounded-3xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-xl transition-all"
    >
      <Link href={`/buyer/videos/${video.id}`} className="block relative aspect-video overflow-hidden">
        <Image 
          src={video.thumbnail} 
          alt={video.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
            <Play fill="white" size={32} />
          </div>
        </div>
        
        {video.isLive && (
          <div className="absolute top-4 left-4">
            <span className="live-badge">Live</span>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-bold text-xs">
              {vendor?.name[0]}
            </div>
            <span className="text-sm font-bold drop-shadow-md">{vendor?.name}</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <span className="flex items-center gap-1"><Eye size={14} /> {video.viewCount}</span>
            <span className="flex items-center gap-1"><Heart size={14} /> {video.likes}</span>
          </div>
        </div>
      </Link>

      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-zinc-900 leading-tight group-hover:text-red-600 transition-colors">
              <Link href={`/buyer/videos/${video.id}`}>{video.title}</Link>
            </h3>
            <p className="text-sm text-zinc-500 line-clamp-2">{video.description}</p>
          </div>
          <button className="p-2.5 bg-zinc-50 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-zinc-100">
            <UserPlus size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 pt-2">
          {video.attachedProductIds.slice(0, 2).map((pid, idx) => (
            <div key={pid} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 border border-zinc-100 rounded-lg text-xs font-bold text-zinc-600">
              <ShoppingBag size={14} /> Product {idx + 1}
            </div>
          ))}
          {video.attachedProductIds.length > 2 && (
            <span className="text-xs text-zinc-400 font-bold">+{video.attachedProductIds.length - 2} more</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
