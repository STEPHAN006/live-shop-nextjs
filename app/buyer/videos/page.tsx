'use client';

import { MOCK_VIDEOS, MOCK_USERS } from '@/lib/data';
import { Video } from '@/lib/types';
import { motion } from 'motion/react';
import { Play, Heart, Eye, ShoppingBag, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function BuyerVideosPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVideos = MOCK_VIDEOS.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Browse Videos</h1>
          <p className="text-zinc-500">Explore all on-demand and live content</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all w-full md:w-64"
            />
          </div>
          <button className="p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-500 hover:text-zinc-900 transition-all shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVideos.map((video) => (
          <VideoGridCard key={video.id} video={video} />
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-20 opacity-40">
          <Search size={48} className="mx-auto mb-4" />
          <p className="text-lg font-bold">No videos found matching your search</p>
        </div>
      )}
    </div>
  );
}

function VideoGridCard({ video }: { video: Video }) {
  const vendor = MOCK_USERS.find(u => u.id === video.vendorId);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group bg-white rounded-2xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-md transition-all flex flex-col"
    >
      <Link href={`/buyer/videos/${video.id}`} className="relative aspect-video overflow-hidden block">
        <Image 
          src={video.thumbnail} 
          alt={video.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        {video.isLive && (
          <div className="absolute top-3 left-3">
            <span className="live-badge !text-[8px] !px-1">Live</span>
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/10">
          {video.isLive ? 'LIVE' : '12:45'}
        </div>
      </Link>

      <div className="p-4 space-y-3 flex-grow flex flex-col">
        <div className="flex-grow">
          <h3 className="font-bold text-zinc-900 line-clamp-1 group-hover:text-red-600 transition-colors">
            <Link href={`/buyer/videos/${video.id}`}>{video.title}</Link>
          </h3>
          <p className="text-xs text-zinc-500 line-clamp-1 mt-1">{vendor?.name}</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
          <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            <span className="flex items-center gap-1"><Eye size={12} /> {video.viewCount}</span>
            <span className="flex items-center gap-1"><Heart size={12} /> {video.likes}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 uppercase">
            <ShoppingBag size={12} /> {video.attachedProductIds.length}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
