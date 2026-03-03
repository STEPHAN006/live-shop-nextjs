'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Package, DollarSign, Image as ImageIcon, Upload, Loader2, Save, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

export default function CreateProductPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isAuthLoading || !user) throw new Error('Not authenticated');

      const supabase = getSupabaseBrowserClient();
      const { error: insertError } = await supabase.from('products').insert({
        vendor_id: user.id,
        name,
        description,
        price: Number(price),
        image,
      });

      if (insertError) throw insertError;

      router.push('/vendor/products');
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link href="/vendor/products" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
        <ArrowLeft size={18} /> Back to Catalog
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Add New Product</h1>
        <p className="text-zinc-500">Create a new listing for your store.</p>
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
              <label className="text-sm font-bold text-zinc-700 ml-1">Product Name</label>
              <div className="relative group">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Premium Wireless Headphones"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 ml-1">Description</label>
              <textarea 
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product features, specifications, etc..."
                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 ml-1">Price ($)</label>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 ml-1">Inventory Count</label>
                <input 
                  type="number" 
                  required
                  placeholder="100"
                  className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
            <h3 className="font-bold text-zinc-900">Product Image</h3>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Image URL</label>
              <input
                type="url"
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="border-2 border-dashed border-zinc-200 rounded-2xl p-8 text-center space-y-2 hover:border-emerald-500 transition-colors cursor-pointer bg-zinc-50 group">
              <Upload className="mx-auto text-zinc-400 group-hover:text-emerald-600 transition-colors" size={32} />
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Upload Photo</p>
              <p className="text-[10px] text-zinc-400">JPG, PNG (max. 5MB)</p>
            </div>
            
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 text-amber-700">
              <Info className="shrink-0" size={18} />
              <p className="text-[10px] leading-relaxed font-medium">
                High-quality images increase sales by up to 40%. Use a clean background.
              </p>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg active:scale-95 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Publish Product</>}
          </button>
        </div>
      </form>
    </div>
  );
}
