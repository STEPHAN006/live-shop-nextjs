'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  ShoppingBag, 
  Send, 
  Eye, 
  ArrowLeft,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
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
  attached_product_ids: string[];
  created_at: string;
};

type DbProfile = {
  id: string;
  name: string;
  avatar: string | null;
};

type DbProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type DbVideoComment = {
  id: string;
  video_id: string;
  user_id: string;
  user_name: string;
  text: string;
  created_at: string;
};

export default function VideoDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [video, setVideo] = useState<DbVideo | null>(null);
  const [vendor, setVendor] = useState<DbProfile | null>(null);
  const [products, setProducts] = useState<DbProduct[]>([]);

  const [comments, setComments] = useState<DbVideoComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const [liveProductIds, setLiveProductIds] = useState<string[]>([]);
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);
  const [isVertical, setIsVertical] = useState(false);

  useEffect(() => {
    const videoId = String(id ?? '');
    if (!videoId) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const supabase = getSupabaseBrowserClient();

        const { data: v, error: vErr } = await supabase
          .from('videos')
          .select(
            'id, vendor_id, title, description, thumbnail, video_url, is_live, likes, view_count, attached_product_ids, created_at'
          )
          .eq('id', videoId)
          .maybeSingle();

        if (vErr) throw vErr;
        if (!v) {
          setVideo(null);
          setVendor(null);
          setProducts([]);
          setLiveProductIds([]);
          return;
        }

        setVideo(v as DbVideo);
        setLikeCount(Number((v as any).likes ?? 0));
        setLiveProductIds(((v as any).attached_product_ids ?? []) as string[]);

        const { data: prof, error: pErr } = await supabase
          .from('profiles')
          .select('id, name, avatar')
          .eq('id', (v as any).vendor_id)
          .maybeSingle();

        if (pErr) throw pErr;
        setVendor((prof ?? null) as DbProfile | null);

        if (user) {
          const [{ data: likeRow, error: likeErr }, { data: followRow, error: fErr }] = await Promise.all([
            supabase
              .from('video_likes')
              .select('id')
              .eq('user_id', user.id)
              .eq('video_id', videoId)
              .maybeSingle(),
            supabase
              .from('vendor_follows')
              .select('id')
              .eq('follower_id', user.id)
              .eq('vendor_id', String((v as any).vendor_id))
              .maybeSingle(),
          ]);

          if (likeErr) throw likeErr;
          if (fErr) throw fErr;
          setIsLiked(!!likeRow);
          setIsFollowing(!!followRow);
        } else {
          setIsLiked(false);
          setIsFollowing(false);
        }

        const { data: links, error: lErr } = await supabase
          .from('video_products')
          .select('product_id')
          .eq('video_id', videoId);

        if (lErr) throw lErr;
        const productIds = (links ?? []).map((r: any) => String(r.product_id)).filter(Boolean);

        if (productIds.length === 0) {
          setProducts([]);
          return;
        }

        const { data: prods, error: prodErr } = await supabase
          .from('products')
          .select('id, name, price, image')
          .in('id', productIds);

        if (prodErr) throw prodErr;
        setProducts((prods ?? []) as DbProduct[]);

        const { data: existingComments, error: cErr } = await supabase
          .from('video_comments')
          .select('id, video_id, user_id, user_name, text, created_at')
          .eq('video_id', videoId)
          .order('created_at', { ascending: true });

        if (cErr) throw cErr;
        setComments((existingComments ?? []) as DbVideoComment[]);
      } finally {
        setIsLoading(false);
      }
    };

    load().catch(() => {
      setVideo(null);
      setVendor(null);
      setProducts([]);
      setLiveProductIds([]);
      setIsLoading(false);
    });
  }, [id]);

  useEffect(() => {
    const videoId = String(id ?? '');
    if (!videoId) return;

    // Initialize Socket.io
    const newSocket = io();
    socketRef.current = newSocket;

    newSocket.emit('join-video', videoId);

    newSocket.on('new-comment', (comment: DbVideoComment) => {
      if (!comment?.id) return;
      setComments(prev => {
        if (prev.some(c => c.id === comment.id)) return prev;
        return [...prev, comment];
      });
    });

    newSocket.on('live-products-updated', (productIds) => {
      setLiveProductIds(productIds);
    });

    return () => {
      newSocket.emit('leave-video', videoId);
      newSocket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-500">
          <Loader2 className="animate-spin" size={18} /> Loading...
        </div>
      </div>
    );
  }

  if (!video) return <div className="max-w-6xl mx-auto">Video not found</div>;

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      const supabase = getSupabaseBrowserClient();
      const payload = {
        video_id: String(id),
        user_id: user.id,
        user_name: user.name,
        text: newComment.trim(),
      };

      const { data: inserted, error } = await supabase
        .from('video_comments')
        .insert(payload)
        .select('id, video_id, user_id, user_name, text, created_at')
        .single();

      if (error) throw error;

      const comment = inserted as DbVideoComment;
      setComments(prev => [...prev, comment]);

      if (socketRef.current) {
        socketRef.current.emit('send-comment', {
          comment,
        });
      }

      setNewComment('');
    } catch (err) {
      console.error('Failed to save comment:', err);
    }
  };

  const handlePurchase = async (productId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, price, vendor_id')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          buyer_id: user.id,
          vendor_id: (product as any).vendor_id,
          product_id: productId,
          amount: (product as any).price,
          status: 'completed',
        });

      if (purchaseError) throw purchaseError;

      setShowPurchaseSuccess(true);
      setTimeout(() => setShowPurchaseSuccess(false), 3000);
    } catch (error) {
      console.error('Error processing purchase:', error);
    }
  };

  const handleToggleLike = async () => {
    if (!user || !video) {
      router.push('/login');
      return;
    }
    if (likeBusy) return;

    setLikeBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const nextLiked = !isLiked;
      setIsLiked(nextLiked);
      setLikeCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));

      const { error } = await supabase.rpc('like_video', {
        video_id: video.id,
        user_id: user.id,
      });

      if (error) throw error;

      const { data: refreshed, error: rErr } = await supabase
        .from('videos')
        .select('likes')
        .eq('id', video.id)
        .maybeSingle();
      if (rErr) throw rErr;
      if (refreshed) setLikeCount(Number((refreshed as any).likes ?? 0));
    } catch (e) {
      console.error('Error liking video:', e);
    } finally {
      setLikeBusy(false);
    }
  };

  const handleShare = async () => {
    if (!video) return;
    const url = `${window.location.origin}/buyer/videos/${video.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: video.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
    } catch (e) {
      console.error('Share failed:', e);
    }
  };

  const handleToggleFollow = async () => {
    if (!user || !video) {
      router.push('/login');
      return;
    }
    if (followBusy) return;

    setFollowBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (isFollowing) {
        const { error } = await supabase
          .from('vendor_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('vendor_id', video.vendor_id);
        if (error) throw error;
        setIsFollowing(false);
      } else {
        const { error } = await supabase
          .from('vendor_follows')
          .insert({ follower_id: user.id, vendor_id: video.vendor_id });
        if (error) throw error;
        setIsFollowing(true);
      }
    } catch (e) {
      console.error('Follow toggle failed:', e);
    } finally {
      setFollowBusy(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link
        href="/buyer/feed"
        className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        <ArrowLeft size={18} /> Back to Feed
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video Player Section */}
        <div className="lg:col-span-2 space-y-6">
          <div
            className={`relative bg-black rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 mx-auto w-full max-w-3xl max-h-[70vh] ${
              isVertical ? 'aspect-[9/16]' : 'aspect-video'
            }`}
          >
            <video
              src={video.video_url}
              controls
              autoPlay
              className="w-full h-full object-contain"
              poster={video.thumbnail}
              onLoadedMetadata={(e) => {
                const el = e.currentTarget;
                const w = Number(el.videoWidth || 0);
                const h = Number(el.videoHeight || 0);
                if (w && h) setIsVertical(h > w);
              }}
            />
            {video.is_live && (
              <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full font-bold text-sm shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{video.title}</h1>
                <div className="flex items-center gap-4 text-sm text-zinc-500 font-medium">
                  <span>{new Date(video.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{video.view_count} views</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleLike}
                  disabled={likeBusy}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-2 font-bold ${
                    isLiked
                      ? 'bg-red-50 border-red-100 text-red-600 shadow-sm'
                      : 'bg-zinc-50 border-zinc-100 text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                  {likeCount}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-3 bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-zinc-900 rounded-2xl transition-all"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                  {(vendor?.name?.[0] ?? '?')}
                </div>
                <div>
                  <p className="font-bold text-zinc-900">{vendor?.name ?? 'Vendor'}</p>
                  <p className="text-xs text-zinc-500 font-medium">Verified Vendor</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleFollow}
                disabled={followBusy}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-70 ${
                  isFollowing
                    ? 'bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50'
                    : 'bg-zinc-900 text-white hover:bg-zinc-800'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>

            <p className="text-zinc-600 leading-relaxed">{video.description}</p>
          </div>
        </div>

        {/* Sidebar: Chat & Products */}
        <div className="space-y-8 h-full flex flex-col">
          {/* Live Products */}
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col max-h-[400px]">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h2 className="font-bold text-zinc-900 flex items-center gap-2">
                <ShoppingBag size={18} className="text-red-600" /> Featured Products
              </h2>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{liveProductIds.length} items</span>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto flex-grow custom-scrollbar">
              {liveProductIds.map(pid => {
                const product = products.find(p => p.id === pid);
                if (!product) return null;
                return (
                  <div key={pid} className="group p-3 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-zinc-300 transition-all flex gap-4 items-center">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-200 shrink-0">
                      <Image src={product.image} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-bold text-zinc-900 truncate">{product.name}</p>
                      <p className="text-sm font-bold text-red-600">${product.price}</p>
                    </div>
                    <button 
                      onClick={() => handlePurchase(product.id)}
                      className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-md active:scale-95"
                    >
                      Buy
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Chat */}
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col flex-grow min-h-[400px]">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h2 className="font-bold text-zinc-900 flex items-center gap-2">
                <MessageCircle size={18} className="text-blue-600" /> Live Chat
              </h2>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Live</span>
              </div>
            </div>
            
            <div className="flex-grow p-6 overflow-y-auto space-y-4 custom-scrollbar bg-zinc-50/30">
              {comments.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-40">
                  <MessageCircle size={32} />
                  <p className="text-xs font-bold uppercase tracking-widest">No messages yet</p>
                </div>
              )}
              {comments.map((c) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={c.id} 
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {c.user_name?.[0] ?? '?'}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-zinc-900">{c.user_name}</p>
                    <div className="px-3 py-2 bg-white border border-zinc-100 rounded-2xl rounded-tl-none shadow-sm inline-block">
                      <p className="text-sm text-zinc-600">{c.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={commentsEndRef} />
            </div>

            <form onSubmit={handleSendComment} className="p-4 border-t border-zinc-100 bg-white">
              <div className="relative">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Say something..."
                  className="w-full pl-4 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all text-sm"
                />
                <button 
                  type="submit"
                  disabled={!newComment.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Purchase Success Toast */}
      <AnimatePresence>
        {showPurchaseSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-4 bg-emerald-600 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500"
          >
            <CheckCircle2 size={24} />
            <div>
              <p className="font-bold">Purchase Successful!</p>
              <p className="text-xs text-emerald-100">Your order has been placed successfully.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
