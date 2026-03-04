'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Eye, Heart, Loader2, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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

export default function BuyerFeedPage() {
  const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');
  const [videos, setVideos] = useState<DbVideo[]>([]);
  const [profilesById, setProfilesById] = useState<Record<string, DbProfile>>({});
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        let baseQuery = supabase
          .from('videos')
          .select('id, vendor_id, title, description, thumbnail, video_url, is_live, likes, view_count, created_at')
          .eq('is_live', false)
          .order('created_at', { ascending: false })
          .limit(30);

        if (activeTab === 'following') {
          if (!user) {
            setVideos([]);
            setProfilesById({});
            return;
          }

          const { data: follows, error: fErr } = await supabase
            .from('vendor_follows')
            .select('vendor_id')
            .eq('follower_id', user.id);

          if (fErr) throw fErr;

          const vendorIds = (follows ?? []).map((f: any) => String(f.vendor_id)).filter(Boolean);
          if (vendorIds.length === 0) {
            setVideos([]);
            setProfilesById({});
            return;
          }

          baseQuery = baseQuery.in('vendor_id', vendorIds);
        } else {
          // “For You” simple ranking (likes/views + recency ordering already)
          baseQuery = baseQuery.order('likes', { ascending: false }).order('view_count', { ascending: false });
        }

        const { data: vids, error: vErr } = await baseQuery;
        if (vErr) throw vErr;

        const safeVids = (vids ?? []) as DbVideo[];
        setVideos(safeVids);

        const vendorIds = [...new Set(safeVids.map(v => v.vendor_id))].filter(Boolean);
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
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [activeTab, supabase, user]);

  return (
    <div className="space-y-6">

      <div className="relative max-w-sm mx-auto">
        <div className="relative p-1 rounded-2xl bg-zinc-900/5 border border-zinc-200/70 shadow-sm backdrop-blur">
          <motion.div
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-xl bg-white shadow-md border border-zinc-200"
            animate={{ x: activeTab === 'foryou' ? 0 : '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          />

          <div className="relative grid grid-cols-2">
            <button
              type="button"
              onClick={() => setActiveTab('foryou')}
              aria-pressed={activeTab === 'foryou'}
              className={`h-11 px-5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 ${
                activeTab === 'foryou' ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Sparkles size={16} />
              Pour toi
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('following')}
              aria-pressed={activeTab === 'following'}
              className={`h-11 px-5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 ${
                activeTab === 'following' ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Users size={16} />
              Suivi
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-zinc-400" size={48} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {videos.map((video, index) => (
              <VerticalVideoCard
                key={video.id}
                video={video}
                vendor={profilesById[video.vendor_id]}
                index={index}
              />
            ))}
          </div>

          {videos.length === 0 && (
            <div className="text-center py-20 opacity-40">
              {activeTab === 'following' ? (
                <>
                  <Users size={48} className="mx-auto mb-4" />
                  <p className="text-lg font-bold">Aucun vendeur suivi</p>
                  <p className="text-sm text-zinc-500 mt-2">Suis des vendeurs pour voir leurs vidéos ici</p>
                </>
              ) : (
                <>
                  <Sparkles size={48} className="mx-auto mb-4" />
                  <p className="text-lg font-bold">Aucune vidéo</p>
                  <p className="text-sm text-zinc-500 mt-2">Reviens plus tard</p>
                </>
              )}
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
  index,
}: {
  video: DbVideo;
  vendor?: DbProfile;
  index: number;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
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

            <div className="flex items-center gap-3 text-[10px] font-bold text-white/80">
              <span className="flex items-center gap-1"><Eye size={10} /> {video.view_count}</span>
              <span className="flex items-center gap-1"><Heart size={10} /> {video.likes}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
