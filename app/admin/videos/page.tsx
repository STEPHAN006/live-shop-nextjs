'use client';

import { motion } from 'motion/react';
import { Search, Filter, Play, Eye, Heart, MoreVertical, ShieldAlert, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { Modal } from '@/components/ui/modal';

export default function AdminVideosPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [videos, setVideos] = useState<any[]>([]);
  const [vendorsById, setVendorsById] = useState<Record<string, any>>({});

  const [infoOpen, setInfoOpen] = useState(false);
  const [infoTitle, setInfoTitle] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmVideoId, setConfirmVideoId] = useState<string | null>(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [liveFilter, setLiveFilter] = useState<'ALL' | 'LIVE_ONLY' | 'NOT_LIVE'>('ALL');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const supabase = getSupabaseBrowserClient();

      const { data: vids, error: vidsError } = await supabase
        .from('videos')
        .select('id, vendor_id, title, description, thumbnail, video_url, is_live, likes, view_count, created_at')
        .order('created_at', { ascending: false });

      if (vidsError) {
        setVideos([]);
        setVendorsById({});
        setIsLoading(false);
        return;
      }

      const vendorIds = Array.from(new Set((vids ?? []).map((v) => v.vendor_id).filter(Boolean)));
      if (vendorIds.length > 0) {
        const { data: vendorProfiles } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', vendorIds);
        const map: Record<string, any> = {};
        for (const v of vendorProfiles ?? []) map[v.id] = v;
        setVendorsById(map);
      } else {
        setVendorsById({});
      }

      setVideos(vids ?? []);
      setIsLoading(false);
    };

    load();
  }, []);

  const filteredVideos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return videos.filter((v) => {
      const matchesQ = !q || String(v.title ?? '').toLowerCase().includes(q);
      const matchesLive =
        liveFilter === 'ALL'
          ? true
          : liveFilter === 'LIVE_ONLY'
            ? Boolean(v.is_live)
            : !Boolean(v.is_live);
      return matchesQ && matchesLive;
    });
  }, [liveFilter, videos, searchQuery]);

  const handleFlag = async (id: string) => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('videos').update({ is_live: false }).eq('id', id);
    if (error) {
      setInfoTitle('Error');
      setInfoMessage(error.message);
      setInfoOpen(true);
      return;
    }
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, is_live: false } : v)));
  };

  const handleDelete = async (id: string) => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (error) {
      setInfoTitle('Error');
      setInfoMessage(error.message);
      setInfoOpen(true);
      return;
    }
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const openInfo = (title: string, message: string) => {
    setInfoTitle(title);
    setInfoMessage(message);
    setInfoOpen(true);
  };

  const requestDelete = (id: string) => {
    setConfirmVideoId(id);
    setConfirmOpen(true);
  };

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

      <Modal
        open={filterOpen}
        title="Filter videos"
        onClose={() => setFilterOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setLiveFilter('ALL');
                setFilterOpen(false);
              }}
              className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-900 rounded-xl text-xs font-bold hover:bg-zinc-50 transition-all"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all"
            >
              Apply
            </button>
          </>
        }
      >
        <div className="space-y-2">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Live status</p>
          <select
            value={liveFilter}
            onChange={(e) => setLiveFilter(e.target.value as any)}
            className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
          >
            <option value="ALL">All</option>
            <option value="LIVE_ONLY">Live only</option>
            <option value="NOT_LIVE">Not live</option>
          </select>
        </div>
      </Modal>

      <Modal
        open={confirmOpen}
        title="Delete video"
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-900 rounded-xl text-xs font-bold hover:bg-zinc-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!confirmVideoId) return;
                setConfirmOpen(false);
                await handleDelete(confirmVideoId);
                setConfirmVideoId(null);
              }}
              className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-zinc-600 leading-relaxed">This will permanently delete the video.</p>
      </Modal>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Content Moderation</h1>
          <p className="text-zinc-500">Monitor and manage all video content on the platform</p>
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
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-500 hover:text-zinc-900 transition-all shadow-sm"
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? null : filteredVideos.map((video) => {
          const vendor = vendorsById[video.vendor_id];
          return (
            <motion.div 
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col"
            >
              <div className="relative aspect-video overflow-hidden bg-zinc-50">
                <Image 
                  src={video.thumbnail} 
                  alt={video.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                {video.is_live && <span className="absolute top-4 left-4 live-badge">Live</span>}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <Link href={`/buyer/videos/${video.id}`} className="p-3 bg-white text-zinc-900 rounded-2xl shadow-lg hover:scale-110 transition-all">
                    <Play fill="currentColor" size={24} />
                  </Link>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-grow flex flex-col">
                <div className="space-y-2 flex-grow">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-zinc-100 text-[8px] font-bold flex items-center justify-center border border-zinc-200">
                      {vendor?.name[0]}
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{vendor?.name}</span>
                  </div>
                  <h3 className="font-bold text-zinc-900 group-hover:text-red-600 transition-colors line-clamp-1">{video.title}</h3>
                  <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Eye size={12} /> {video.view_count}</span>
                    <span className="flex items-center gap-1"><Heart size={12} /> {video.likes}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-bold rounded-full uppercase tracking-wider border border-emerald-100">
                      Safe
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => handleFlag(video.id)}
                      className="p-2.5 bg-zinc-50 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all border border-zinc-100" 
                      title="Flag Content"
                    >
                      <ShieldAlert size={16} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => requestDelete(video.id)}
                      className="p-2.5 bg-zinc-50 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-zinc-100" 
                      title="Delete Content"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex gap-4 items-start text-amber-800">
        <AlertCircle className="shrink-0 mt-1" size={24} />
        <div className="space-y-1">
          <h4 className="font-bold">Moderation Guidelines</h4>
          <p className="text-sm leading-relaxed opacity-80">
            All content must adhere to the platform community standards. Flagged content will be reviewed by the senior moderation team within 12 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
