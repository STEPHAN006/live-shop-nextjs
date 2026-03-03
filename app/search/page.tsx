'use client';

import { useState } from 'react';
import { Search, Filter, Video, ShoppingBag, Users, ArrowLeft, ChevronRight } from 'lucide-react';
import { MOCK_VIDEOS, MOCK_PRODUCTS, MOCK_USERS } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'VIDEOS' | 'PRODUCTS' | 'VENDORS'>('ALL');

  const filteredVideos = MOCK_VIDEOS.filter(v => v.title.toLowerCase().includes(query.toLowerCase()));
  const filteredProducts = MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  const filteredVendors = MOCK_USERS.filter(u => u.role === 'VENDOR' && u.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-white border border-zinc-200 rounded-xl text-zinc-500 hover:text-zinc-900 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input 
              type="text" 
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for videos, products, or vendors..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all text-lg shadow-sm"
            />
          </div>
          <button className="p-4 bg-white border border-zinc-200 rounded-2xl text-zinc-500 hover:text-zinc-900 transition-all shadow-sm">
            <Filter size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['ALL', 'VIDEOS', 'PRODUCTS', 'VENDORS'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-zinc-900 text-white shadow-lg' 
                  : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {!query && (
          <div className="text-center py-20 space-y-4 opacity-40">
            <Search size={64} className="mx-auto" />
            <p className="text-xl font-bold">Start typing to search LiveShop</p>
          </div>
        )}

        {query && (
          <div className="space-y-12">
            {/* Videos Results */}
            {(activeTab === 'ALL' || activeTab === 'VIDEOS') && filteredVideos.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <Video size={20} className="text-red-600" /> Videos ({filteredVideos.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredVideos.map(video => (
                    <Link key={video.id} href={`/buyer/videos/${video.id}`} className="group bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl transition-all">
                      <div className="relative aspect-video">
                        <Image src={video.thumbnail} alt={video.title} fill className="object-cover" referrerPolicy="no-referrer" />
                        {video.isLive && <span className="absolute top-4 left-4 live-badge">Live</span>}
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-zinc-900 group-hover:text-red-600 transition-colors">{video.title}</h3>
                        <p className="text-xs text-zinc-500 mt-1">{video.viewCount} views</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Products Results */}
            {(activeTab === 'ALL' || activeTab === 'PRODUCTS') && filteredProducts.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <ShoppingBag size={20} className="text-emerald-600" /> Products ({filteredProducts.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
                      <div className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-100">
                        <Image src={product.image} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900 text-sm truncate">{product.name}</h3>
                        <p className="text-emerald-600 font-bold">$ {product.price}</p>
                      </div>
                      <button className="w-full py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all">View Product</button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Vendors Results */}
            {(activeTab === 'ALL' || activeTab === 'VENDORS') && filteredVendors.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <Users size={20} className="text-blue-600" /> Vendors ({filteredVendors.length})
                </h2>
                <div className="space-y-4">
                  {filteredVendors.map(vendor => (
                    <div key={vendor.id} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center font-bold text-xl border border-zinc-200">
                          {vendor.name[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-900">{vendor.name}</h3>
                          <p className="text-xs text-zinc-500">Verified Seller</p>
                        </div>
                      </div>
                      <button className="p-3 bg-zinc-50 text-zinc-400 hover:text-zinc-900 rounded-xl border border-zinc-100 transition-all">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {query && filteredVideos.length === 0 && filteredProducts.length === 0 && filteredVendors.length === 0 && (
              <div className="text-center py-20 space-y-4 opacity-40">
                <Search size={64} className="mx-auto" />
                <p className="text-xl font-bold">No results found for &quot;{query}&quot;</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
