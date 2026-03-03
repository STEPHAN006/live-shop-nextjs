'use client';

import { useParams, useRouter } from 'next/navigation';
import { MOCK_VIDEOS, MOCK_USERS, MOCK_PRODUCTS } from '@/lib/data';
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

export default function VideoDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const video = MOCK_VIDEOS.find(v => v.id === id);
  const vendor = MOCK_USERS.find(u => u.id === video?.vendorId);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const [liveProductIds, setLiveProductIds] = useState<string[]>(video?.attachedProductIds || []);
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!video) return;

    // Initialize Socket.io
    const newSocket = io();
    socketRef.current = newSocket;

    newSocket.emit('join-video', id);

    newSocket.on('new-comment', (comment) => {
      setComments(prev => [...prev, comment]);
    });

    newSocket.on('live-products-updated', (productIds) => {
      setLiveProductIds(productIds);
    });

    return () => {
      newSocket.emit('leave-video', id);
      newSocket.disconnect();
    };
  }, [id, video]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  if (!video || !vendor) return <div>Video not found</div>;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !socketRef.current || !user) return;

    socketRef.current.emit('send-comment', {
      videoId: id,
      userId: user.id,
      userName: user.name,
      text: newComment
    });
    setNewComment('');
  };

  const handlePurchase = (productId: string) => {
    // Simulate purchase
    setShowPurchaseSuccess(true);
    setTimeout(() => setShowPurchaseSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link href="/buyer/feed" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
        <ArrowLeft size={18} /> Back to Feed
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video Player Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-zinc-200">
            <video 
              src={video.videoUrl} 
              controls 
              autoPlay 
              className="w-full h-full object-contain"
              poster={video.thumbnail}
            />
            {video.isLive && (
              <div className="absolute top-6 left-6 flex items-center gap-3">
                <span className="live-badge">Live</span>
                <span className="bg-black/40 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                  <Eye size={14} /> {video.viewCount}
                </span>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{video.title}</h1>
                <div className="flex items-center gap-4 text-sm text-zinc-500 font-medium">
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{video.viewCount} views</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-2 font-bold ${
                    isLiked 
                      ? 'bg-red-50 border-red-100 text-red-600 shadow-sm' 
                      : 'bg-zinc-50 border-zinc-100 text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                  {video.likes + (isLiked ? 1 : 0)}
                </button>
                <button className="p-3 bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-zinc-900 rounded-2xl transition-all">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                  {vendor.name[0]}
                </div>
                <div>
                  <p className="font-bold text-zinc-900">{vendor.name}</p>
                  <p className="text-xs text-zinc-500 font-medium">Verified Vendor</p>
                </div>
              </div>
              <button className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-md active:scale-95">
                Follow
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
                const product = MOCK_PRODUCTS.find(p => p.id === pid);
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
                    {c.userName[0]}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-zinc-900">{c.userName}</p>
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
