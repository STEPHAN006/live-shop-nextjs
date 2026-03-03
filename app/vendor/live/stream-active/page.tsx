'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  Users, 
  Heart, 
  MessageCircle, 
  ShoppingBag, 
  X, 
  Plus,
  Send,
  Eye,
  Settings,
  Mic,
  Video as VideoIcon,
  MicOff,
  VideoOff
} from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { io, Socket } from 'socket.io-client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function VendorLiveStreamPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<any[]>([]);
  const [liveProductIds, setLiveProductIds] = useState<string[]>([]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const [viewCount, setViewCount] = useState(124);
  const [likeCount, setLikeCount] = useState(45);
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io();
    socketRef.current = newSocket;

    const videoId = 'live-session-' + Date.now();
    newSocket.emit('join-video', videoId);

    newSocket.on('new-comment', (comment) => {
      setComments(prev => [...prev, comment]);
    });

    // Simulate view count growth
    const interval = setInterval(() => {
      setViewCount(prev => prev + Math.floor(Math.random() * 5));
    }, 5000);

    return () => {
      newSocket.disconnect();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const toggleProduct = (id: string) => {
    const newIds = liveProductIds.includes(id) 
      ? liveProductIds.filter(p => p !== id) 
      : [...liveProductIds, id];
    
    setLiveProductIds(newIds);
    socketRef.current?.emit('update-live-products', { videoId: 'live-session', productIds: newIds });
  };

  const endStream = () => {
    if (confirm('Are you sure you want to end the live stream?')) {
      router.push('/vendor/dashboard');
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col lg:flex-row gap-6">
      {/* Main Stream View */}
      <div className="flex-grow flex flex-col gap-6 min-w-0">
        <div className="relative flex-grow bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
          {/* Mock Camera Feed */}
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
            {!isCamOn ? (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center mx-auto text-zinc-500">
                  <VideoOff size={40} />
                </div>
                <p className="text-zinc-400 font-bold">Camera is Off</p>
              </div>
            ) : (
              <div className="w-full h-full bg-linear-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                <div className="text-center space-y-4 animate-pulse">
                  <Radio size={64} className="text-red-600 mx-auto" />
                  <p className="text-white font-bold text-xl tracking-widest uppercase">Broadcasting Live</p>
                </div>
              </div>
            )}
          </div>

          {/* Overlays */}
          <div className="absolute top-6 left-6 flex items-center gap-3">
            <span className="live-badge !px-3 !py-1 !text-xs">Live</span>
            <div className="bg-black/40 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Eye size={14} /> {viewCount}</span>
              <span className="flex items-center gap-1.5"><Heart size={14} /> {likeCount}</span>
            </div>
          </div>

          <div className="absolute top-6 right-6 flex items-center gap-2">
            <button className="p-2.5 bg-black/40 backdrop-blur-md text-white rounded-xl border border-white/10 hover:bg-black/60 transition-all">
              <Settings size={20} />
            </button>
            <button 
              onClick={endStream}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95"
            >
              End Stream
            </button>
          </div>

          {/* Controls Overlay */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10">
            <button 
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-4 rounded-xl transition-all ${isMicOn ? 'bg-white/10 text-white' : 'bg-red-600 text-white'}`}
            >
              {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
            </button>
            <button 
              onClick={() => setIsCamOn(!isCamOn)}
              className={`p-4 rounded-xl transition-all ${isCamOn ? 'bg-white/10 text-white' : 'bg-red-600 text-white'}`}
            >
              {isCamOn ? <VideoIcon size={24} /> : <VideoOff size={24} />}
            </button>
          </div>
        </div>

        {/* Live Product Management */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-zinc-900 flex items-center gap-2">
              <ShoppingBag size={20} className="text-emerald-600" /> Live Product Overlay
            </h2>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{liveProductIds.length} Active</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {MOCK_PRODUCTS.map(product => (
              <button 
                key={product.id}
                onClick={() => toggleProduct(product.id)}
                className={`relative shrink-0 w-48 p-3 rounded-2xl border transition-all text-left flex gap-3 items-center ${
                  liveProductIds.includes(product.id)
                    ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/20'
                    : 'bg-zinc-50 border-zinc-100 hover:border-zinc-300'
                }`}
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-zinc-200 shrink-0">
                  <Image src={product.image} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="min-w-0 flex-grow">
                  <p className="text-xs font-bold text-zinc-900 truncate">{product.name}</p>
                  <p className="text-[10px] font-bold text-emerald-600">${product.price}</p>
                </div>
                {liveProductIds.includes(product.id) && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <Plus size={14} className="rotate-45" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar: Chat */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <h2 className="font-bold text-zinc-900 flex items-center gap-2">
            <MessageCircle size={18} className="text-blue-600" /> Live Chat
          </h2>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Real-time</span>
        </div>

        <div className="flex-grow p-6 overflow-y-auto space-y-4 custom-scrollbar bg-zinc-50/30">
          {comments.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-40">
              <MessageCircle size={32} />
              <p className="text-xs font-bold uppercase tracking-widest">Waiting for viewers...</p>
            </div>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                {c.userName[0]}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-zinc-900">{c.userName}</p>
                <div className="px-3 py-2 bg-white border border-zinc-100 rounded-2xl rounded-tl-none shadow-sm inline-block">
                  <p className="text-sm text-zinc-600">{c.text}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={commentsEndRef} />
        </div>

        <div className="p-4 border-t border-zinc-100 bg-white">
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-center">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Broadcasting to {viewCount} viewers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
