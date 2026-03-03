'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Edit2, Trash2, Video, Play, Eye, Heart, BarChart3 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { Modal } from '@/components/ui/modal';

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

export default function VendorVideosPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [videos, setVideos] = useState<DbVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');

  const [infoOpen, setInfoOpen] = useState(false);
  const [infoTitle, setInfoTitle] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmVideoId, setConfirmVideoId] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editVideoId, setEditVideoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editThumbnail, setEditThumbnail] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) return;

    const load = async () => {
      setIsLoading(true);
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('videos')
        .select('id, vendor_id, title, description, thumbnail, video_url, is_live, likes, view_count, created_at')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setVideos([]);
        setIsLoading(false);
        return;
      }

      setVideos((data ?? []) as DbVideo[]);
      setIsLoading(false);
    };

    load();
  }, [user, isAuthLoading]);

  const filteredVideos = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return videos;
    return videos.filter((v) => v.title.toLowerCase().includes(q));
  }, [videos, query]);

  const openInfo = (title: string, message: string) => {
    setInfoTitle(title);
    setInfoMessage(message);
    setInfoOpen(true);
  };

  const requestDelete = (id: string) => {
    setConfirmVideoId(id);
    setConfirmOpen(true);
  };

  const handleDelete = async (id: string) => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (error) {
      openInfo('Error', error.message);
      return;
    }
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const requestEdit = (v: DbVideo) => {
    setEditVideoId(v.id);
    setEditTitle(v.title ?? '');
    setEditDescription(v.description ?? '');
    setEditThumbnail(v.thumbnail ?? '');
    setEditUrl(v.video_url ?? '');
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editVideoId) return;
    setEditSaving(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('videos')
        .update({
          title: editTitle,
          description: editDescription,
          thumbnail: editThumbnail,
          video_url: editUrl,
        })
        .eq('id', editVideoId);

      if (error) throw error;

      setVideos((prev) =>
        prev.map((v) =>
          v.id === editVideoId
            ? { ...v, title: editTitle, description: editDescription, thumbnail: editThumbnail, video_url: editUrl }
            : v
        )
      );
      setEditOpen(false);
      setEditVideoId(null);
    } catch (err: any) {
      openInfo('Error', err.message || 'Failed to update video');
    } finally {
      setEditSaving(false);
    }
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

      <Modal
        open={editOpen}
        title="Edit video"
        onClose={() => setEditOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-900 rounded-xl text-xs font-bold hover:bg-zinc-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={editSaving}
              onClick={saveEdit}
              className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all disabled:opacity-60"
            >
              Save
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Title</p>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Description</p>
            <textarea
              rows={4}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all resize-none"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Thumbnail URL</p>
            <input
              value={editThumbnail}
              onChange={(e) => setEditThumbnail(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Video URL</p>
            <input
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
            />
          </div>
        </div>
      </Modal>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Video Content</h1>
          <p className="text-zinc-500">Manage your live streams and pre-recorded videos</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search videos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all w-full md:w-64"
            />
          </div>
          <Link 
            href="/vendor/videos/create"
            className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-lg active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} /> Upload New
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? null : filteredVideos.map((video) => (
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
              <div className="space-y-1 flex-grow">
                <h3 className="font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{video.title}</h3>
                <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
                  <span className="flex items-center gap-1"><Eye size={12} /> {video.view_count}</span>
                  <span className="flex items-center gap-1"><Heart size={12} /> {video.likes}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                <Link 
                  href={`/vendor/videos/${video.id}/stats`}
                  className="px-4 py-2 bg-zinc-50 text-zinc-600 border border-zinc-100 rounded-xl text-xs font-bold hover:bg-zinc-100 transition-all flex items-center gap-2"
                >
                  <BarChart3 size={14} /> Analytics
                </Link>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => requestEdit(video)}
                    className="p-2.5 bg-zinc-50 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-zinc-100"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => requestDelete(video.id)}
                    className="p-2.5 bg-zinc-50 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-zinc-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        <Link 
          href="/vendor/videos/create"
          className="group border-2 border-dashed border-zinc-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all min-h-[200px]"
        >
          <div className="w-16 h-16 rounded-2xl bg-zinc-50 text-zinc-400 flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all">
            <Plus size={32} />
          </div>
          <div>
            <p className="font-bold text-zinc-900">Upload New Video</p>
            <p className="text-xs text-zinc-500">Share more content with your followers</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
