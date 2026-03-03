'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Edit2, Trash2, MoreVertical, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { Modal } from '@/components/ui/modal';

type DbProduct = {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  price: number;
  image: string;
};

export default function VendorProductsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');

  const [infoOpen, setInfoOpen] = useState(false);
  const [infoTitle, setInfoTitle] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmProductId, setConfirmProductId] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) return;

    const load = async () => {
      setIsLoading(true);
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('products')
        .select('id, vendor_id, name, description, price, image')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      setProducts((data ?? []) as DbProduct[]);
      setIsLoading(false);
    };

    load();
  }, [user, isAuthLoading]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  const openInfo = (title: string, message: string) => {
    setInfoTitle(title);
    setInfoMessage(message);
    setInfoOpen(true);
  };

  const requestDelete = (id: string) => {
    setConfirmProductId(id);
    setConfirmOpen(true);
  };

  const handleDelete = async (id: string) => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      openInfo('Error', error.message);
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const requestEdit = (p: DbProduct) => {
    setEditProductId(p.id);
    setEditName(p.name ?? '');
    setEditDescription(p.description ?? '');
    setEditPrice(String(p.price ?? ''));
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editProductId) return;
    setEditSaving(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('products')
        .update({
          name: editName,
          description: editDescription,
          price: Number(editPrice),
        })
        .eq('id', editProductId);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editProductId
            ? { ...p, name: editName, description: editDescription, price: Number(editPrice) }
            : p
        )
      );
      setEditOpen(false);
      setEditProductId(null);
    } catch (err: any) {
      openInfo('Error', err.message || 'Failed to update product');
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
        title="Delete product"
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
                if (!confirmProductId) return;
                setConfirmOpen(false);
                await handleDelete(confirmProductId);
                setConfirmProductId(null);
              }}
              className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-zinc-600 leading-relaxed">This will permanently delete the product.</p>
      </Modal>

      <Modal
        open={editOpen}
        title="Edit product"
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
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Name</p>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
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
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Price</p>
            <input
              type="number"
              step="0.01"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
            />
          </div>
        </div>
      </Modal>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Product Catalog</h1>
          <p className="text-zinc-500">Manage your shop&apos;s items and inventory</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all w-full md:w-64"
            />
          </div>
          <Link 
            href="/vendor/products/create"
            className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-lg active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} /> Add New
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? null : filteredProducts.map((product) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col"
          >
            <div className="relative aspect-square overflow-hidden bg-zinc-50">
              <Image 
                src={product.image} 
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  type="button"
                  onClick={() => requestEdit(product)}
                  className="p-2 bg-white/90 backdrop-blur-md text-zinc-900 rounded-xl shadow-lg hover:bg-white transition-all"
                >
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-grow flex flex-col">
              <div className="space-y-1 flex-grow">
                <h3 className="font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors truncate">{product.name}</h3>
                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{product.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xl font-bold text-zinc-900">${product.price}</p>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => requestEdit(product)}
                    className="p-2.5 bg-zinc-50 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-zinc-100"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => requestDelete(product.id)}
                    className="p-2.5 bg-zinc-50 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-zinc-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Empty State / Add New Card */}
        <Link 
          href="/vendor/products/create"
          className="group border-2 border-dashed border-zinc-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all min-h-[300px]"
        >
          <div className="w-16 h-16 rounded-2xl bg-zinc-50 text-zinc-400 flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all">
            <Plus size={32} />
          </div>
          <div>
            <p className="font-bold text-zinc-900">Add Another Product</p>
            <p className="text-xs text-zinc-500">Expand your catalog</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
