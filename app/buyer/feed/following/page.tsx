'use client';

import { MOCK_VIDEOS, MOCK_USERS } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { Video } from '@/lib/types';
import { motion } from 'motion/react';
import { Play, Heart, Eye, UserPlus, ShoppingBag, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function FollowingFeedPage() {
  const { user } = useAuth();
  
  const followingVideos = MOCK_VIDEOS.filter(v => 
    user?.followedVendors.includes(v.vendorId)
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Following</h1>
          <p className="text-zinc-500">Live streams from vendors you follow</p>
        </div>
      </div>

      {followingVideos.length === 0 ? (
        <div className="bg-white p-20 rounded-3xl border border-zinc-200 text-center space-y-4">
          <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-400">
            <Users size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-zinc-900">No live streams yet</h3>
            <p className="text-zinc-500 max-w-xs mx-auto">Follow more vendors to see their live streams here in your personalized feed.</p>
          </div>
          <Link 
            href="/buyer/feed" 
            className="inline-flex px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all"
          >
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {followingVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
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
        </div>

        <div className="flex items-center gap-2 pt-2">
          {video.attachedProductIds.slice(0, 2).map((pid, idx) => (
            <div key={pid} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 border border-zinc-100 rounded-lg text-xs font-bold text-zinc-600">
              <ShoppingBag size={14} /> Product {idx + 1}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
