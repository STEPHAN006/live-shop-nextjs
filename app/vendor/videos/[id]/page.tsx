'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Eye, Heart, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getSupabaseBrowserClient } from '@/lib/supabase';

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

export default function VendorVideoDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [video, setVideo] = useState<DbVideo | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const videoId = String(id ?? '');
    if (!videoId) return;
    if (isAuthLoading) return;
    if (!user) return;

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error: loadError } = await supabase
          .from('videos')
          .select('id, vendor_id, title, description, thumbnail, video_url, is_live, likes, view_count, created_at')
          .eq('id', videoId)
          .maybeSingle();

        if (loadError) throw loadError;
        if (!data) {
          setVideo(null);
          return;
        }

        if (data.vendor_id !== user.id) {
          setVideo(null);
          setError('Access denied');
          return;
        }

        setVideo(data as DbVideo);
      } catch (err: any) {
        setVideo(null);
        setError(err?.message || 'Failed to load video');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id, user, isAuthLoading]);

  if (isLoading || isAuthLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-500">
          <Loader2 className="animate-spin" size={18} /> Loading...
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div className="bg-white p-6 rounded-3xl border border-zinc-200">
          <p className="text-sm text-zinc-600">{error || 'Video not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link
        href="/vendor/videos"
        className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        <ArrowLeft size={18} /> Back to Content
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-zinc-200">
            <video
              src={video.video_url}
              controls
              autoPlay
              className="w-full h-full object-contain"
              poster={video.thumbnail}
            />
            {video.is_live ? (
              <div className="absolute top-6 left-6 flex items-center gap-3">
                <span className="live-badge">Live</span>
                <span className="bg-black/40 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                  <Eye size={14} /> {video.view_count}
                </span>
              </div>
            ) : null}
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{video.title}</h1>
                <div className="flex items-center gap-4 text-sm text-zinc-500 font-medium">
                  <span>{new Date(video.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Eye size={16} /> {video.view_count}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl border bg-zinc-50 border-zinc-100 text-zinc-500 font-bold flex items-center gap-2">
                  <Heart size={18} /> {video.likes}
                </div>
              </div>
            </div>

            <p className="text-zinc-600 leading-relaxed">{video.description}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
            <h3 className="font-bold text-zinc-900">Thumbnail</h3>
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50">
              <Image src={video.thumbnail} alt={video.title} fill className="object-cover" referrerPolicy="no-referrer" />
            </div>
            <Link
              href={`/vendor/videos/${video.id}/stats`}
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all"
            >
              View analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
