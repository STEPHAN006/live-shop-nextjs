'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Radio, ShoppingBag, ArrowRight, Video, Info } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/data';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CreateLiveStreamPage() {
  const [title, setTitle] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStarting(true);
    // Simulate setup
    await new Promise(r => setTimeout(r, 1500));
    router.push('/vendor/live/stream-active');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Setup Live Stream</h1>
        <p className="text-zinc-500">Configure your broadcast and select products to showcase.</p>
      </div>

      <form onSubmit={handleStart} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 ml-1">Stream Title</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Summer Collection Launch Event!"
                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 ml-1">Stream Description</label>
              <textarea 
                rows={4}
                placeholder="Tell your viewers what this stream is about..."
                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none"
              />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3 text-blue-700">
              <Info className="shrink-0" size={20} />
              <p className="text-xs leading-relaxed font-medium">
                Make sure your camera and microphone are ready. You can add or remove products from the live overlay at any time during the broadcast.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-zinc-900">Select Products to Showcase</h2>
              <span className="text-xs font-bold text-zinc-400 uppercase">{selectedProducts.length} selected</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MOCK_PRODUCTS.map((product) => (
                <div 
                  key={product.id}
                  onClick={() => toggleProduct(product.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 items-center ${
                    selectedProducts.includes(product.id)
                      ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                      : 'bg-zinc-50 border-zinc-100 hover:border-zinc-300'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-zinc-200 shrink-0">
                    <Image src={product.image} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">{product.name}</p>
                    <p className="text-xs text-zinc-500 font-medium">${product.price}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedProducts.includes(product.id)
                      ? 'bg-emerald-600 border-emerald-600'
                      : 'border-zinc-300'
                  }`}>
                    {selectedProducts.includes(product.id) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-xl space-y-6 sticky top-28">
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Ready to go?</h3>
              <p className="text-zinc-400 text-sm">Once you start, your followers will be notified and your stream will appear in the Live Feed.</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Selected Products</span>
                <span className="font-bold">{selectedProducts.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Notifications</span>
                <span className="font-bold text-emerald-500">Enabled</span>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isStarting || !title}
              className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStarting ? (
                <>Setting up... <Loader2 className="animate-spin" size={20} /></>
              ) : (
                <>Start Live Stream <Radio size={20} /></>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Loader2({ className, size }: { className?: string, size?: number }) {
  return <div className={`border-2 border-white/30 border-t-white rounded-full animate-spin ${className}`} style={{ width: size, height: size }}></div>;
}
