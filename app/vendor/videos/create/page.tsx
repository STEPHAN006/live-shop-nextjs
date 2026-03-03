'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Video, Upload, Loader2, Save, Info, ShoppingBag, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { getSupabaseBrowserClient } from '@/lib/supabase';

type DbProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export default function CreateVideoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [error, setError] = useState('');
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) return;

    const loadProducts = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error: loadError } = await supabase
        .from('products')
        .select('id, name, price, image')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (loadError) {
        setProducts([]);
        return;
      }

      setProducts((data ?? []) as DbProduct[]);
    };

    loadProducts();
  }, [user, isAuthLoading]);

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isAuthLoading || !user) throw new Error('Not authenticated');

      const supabase = getSupabaseBrowserClient();
      const { data: inserted, error: insertError } = await supabase
        .from('videos')
        .insert({
          vendor_id: user.id,
          title,
          description,
          thumbnail,
          video_url: videoUrl,
          is_live: false,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;
      if (!inserted?.id) throw new Error('Failed to create video');

      if (selectedProducts.length > 0) {
        const rows = selectedProducts.map((productId) => ({
          video_id: inserted.id,
          product_id: productId,
        }));
        const { error: linkError } = await supabase.from('video_products').insert(rows);
        if (linkError) throw linkError;
      }

      router.push('/vendor/videos');
    } catch (err: any) {
      setError(err.message || 'Failed to publish video');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/vendor/videos" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
        <ArrowLeft size={18} /> Back to Content
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Upload New Video</h1>
        <p className="text-zinc-500">Share pre-recorded content with your community.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 ml-1">Video Title</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. My Morning Skincare Routine"
                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 ml-1">Description</label>
              <textarea 
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell your viewers what this video is about..."
                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 ml-1">Video URL</label>
              <input
                type="url"
                required
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-zinc-700 ml-1">Attach Products</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div 
                    key={product.id}
                    onClick={() => toggleProduct(product.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 items-center ${
                      selectedProducts.includes(product.id)
                        ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                        : 'bg-zinc-50 border-zinc-100 hover:border-zinc-300'
                    }`}
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-zinc-200 shrink-0">
                      <Image src={product.image} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-bold text-zinc-900 truncate">{product.name}</p>
                      <p className="text-[10px] font-bold text-emerald-600">${product.price}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedProducts.includes(product.id)
                        ? 'bg-emerald-600 border-emerald-600'
                        : 'border-zinc-300'
                    }`}>
                      {selectedProducts.includes(product.id) && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
            <h3 className="font-bold text-zinc-900">Video File</h3>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Thumbnail URL</label>
              <input
                type="url"
                required
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://..."
                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="border-2 border-dashed border-zinc-200 rounded-2xl p-10 text-center space-y-2 hover:border-emerald-500 transition-colors cursor-pointer bg-zinc-50 group">
              <Upload className="mx-auto text-zinc-400 group-hover:text-emerald-600 transition-colors" size={40} />
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Upload Video</p>
              <p className="text-[10px] text-zinc-400">MP4, MOV (max. 500MB)</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-zinc-900 text-sm">Thumbnail</h3>
              <div className="aspect-video bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-center text-zinc-400 hover:bg-zinc-100 transition-all cursor-pointer">
                <Plus size={24} />
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3 text-blue-700">
              <Info className="shrink-0" size={18} />
              <p className="text-[10px] leading-relaxed font-medium">
                Videos with attached products have a 3x higher conversion rate.
              </p>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg active:scale-95 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Publish Video</>}
          </button>
        </div>
      </form>
    </div>
  );
}
