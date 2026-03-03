'use client';

import { motion } from 'motion/react';
import { Eye, Heart, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { getSupabaseBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

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

type DbProfile = {
  id: string;
  name: string;
  avatar: string | null;
};

export default function BuyerVideosPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const [videos, setVideos] = useState<DbVideo[]>([]);
  const [profilesById, setProfilesById] = useState<Record<string, DbProfile>>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  const { user } = useAuth();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('videos')
          .select('id, vendor_id, title, description, thumbnail, video_url, is_live, likes, view_count, created_at', {
            count: 'exact',
          })
          .eq('is_live', false)
          .order('created_at', { ascending: false });

        if (searchQuery.trim()) {
          const q = searchQuery.trim();
          query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
        }

        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;
        const { data, error, count } = await query.range(from, to);
        if (error) throw error;

        const safe = (data ?? []) as DbVideo[];
        setVideos(safe);

        const c = count ?? 0;
        setTotalCount(c);
        setTotalPages(Math.max(1, Math.ceil(c / pageSize)));

        const vendorIds = [...new Set(safe.map(v => v.vendor_id))].filter(Boolean);
        if (vendorIds.length === 0) {
          setProfilesById({});
          return;
        }

        const { data: profs, error: pErr } = await supabase
          .from('profiles')
          .select('id, name, avatar')
          .in('id', vendorIds);

        if (pErr) throw pErr;
        const map: Record<string, DbProfile> = {};
        for (const p of (profs ?? []) as DbProfile[]) map[p.id] = p;
        setProfilesById(map);
      } catch (e) {
        console.error(e);
        setVideos([]);
        setProfilesById({});
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [currentPage, searchQuery, supabase]);

  const handleLike = async (videoId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.rpc('like_video', {
        video_id: videoId,
        user_id: user.id,
      });
      if (error) throw error;

      // refresh current page (simple + consistent)
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error: qErr } = await supabase
        .from('videos')
        .select('id, vendor_id, title, description, thumbnail, video_url, is_live, likes, view_count, created_at')
        .eq('is_live', false)
        .order('created_at', { ascending: false })
        .range(from, to);
      if (qErr) throw qErr;
      setVideos((data ?? []) as DbVideo[]);
    } catch (e) {
      console.error(e);
    }
  };

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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-12 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-zinc-400" size={48} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {videos.map((video) => (
              <VerticalVideoCard
                key={video.id}
                video={video}
                vendor={profilesById[video.vendor_id]}
                onLike={handleLike}
              />
            ))}
          </div>

          {videos.length === 0 && (
            <div className="text-center py-20 opacity-40">
              <Search size={48} className="mx-auto mb-4" />
              <p className="text-lg font-bold">No videos found matching your search</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>

              <span className="text-sm text-zinc-600">
                Page {currentPage} of {totalPages} ({totalCount} videos)
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function VerticalVideoCard({
  video,
  vendor,
  onLike,
}: {
  video: DbVideo;
  vendor?: DbProfile;
  onLike: (videoId: string) => Promise<void>;
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likes);

  const handleLikeClick = () => {
    onLike(video.id);
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative aspect-[9/16] bg-zinc-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
    >
      <Link href={`/buyer/videos/${video.id}`} className="block relative h-full">
        <Image 
          src={video.thumbnail} 
          alt={video.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-bold text-[8px]">
                {vendor?.name?.[0] || '?'}
              </div>
              <span className="text-xs font-bold text-white drop-shadow-md">{vendor?.name || 'Unknown'}</span>
            </div>

            <h3 className="text-xs font-bold text-white line-clamp-2 drop-shadow-md">{video.title}</h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[10px] font-bold text-white/80">
                <span className="flex items-center gap-1"><Eye size={10} /> {video.view_count}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLikeClick();
                  }}
                  className="flex items-center gap-1 hover:text-red-400 transition-colors"
                >
                  <Heart size={10} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
                  {likeCount}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
