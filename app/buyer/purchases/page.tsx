'use client';

import { MOCK_PURCHASES, MOCK_PRODUCTS, MOCK_USERS } from '@/lib/data';
import { motion } from 'motion/react';
import { ShoppingBag, Package, Truck, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function BuyerPurchasesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">My Purchases</h1>
        <p className="text-zinc-500">Track and manage your orders</p>
      </div>

      <div className="space-y-6">
        {MOCK_PURCHASES.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl border border-zinc-200 text-center space-y-4 opacity-40">
            <ShoppingBag size={64} className="mx-auto" />
            <p className="text-xl font-bold uppercase tracking-widest">No purchases yet</p>
          </div>
        ) : (
          MOCK_PURCHASES.map((purchase) => {
            const product = MOCK_PRODUCTS.find(p => p.id === purchase.productId);
            const vendor = MOCK_USERS.find(u => u.id === purchase.vendorId);
            
            return (
              <motion.div 
                key={purchase.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start md:items-center"
              >
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-zinc-100 shrink-0">
                  <Image src={product?.image || ''} alt={product?.name || ''} fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
                
                <div className="flex-grow space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Order #{purchase.id}</span>
                    <span className="text-zinc-300">•</span>
                    <span className="text-xs font-medium text-zinc-500">{new Date(purchase.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900">{product?.name}</h3>
                  <p className="text-sm text-zinc-500 font-medium">Sold by <span className="text-zinc-900 font-bold">{vendor?.name}</span></p>
                </div>

                <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                  <div className="text-right">
                    <p className="text-xl font-bold text-zinc-900">${purchase.amount.toFixed(2)}</p>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${
                      purchase.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' : 
                      purchase.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {purchase.status === 'DELIVERED' ? <CheckCircle2 size={12} /> : 
                       purchase.status === 'SHIPPED' ? <Truck size={12} /> : <Package size={12} />}
                      {purchase.status}
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-grow md:flex-grow-0 px-4 py-2 bg-zinc-50 text-zinc-600 border border-zinc-100 rounded-xl text-xs font-bold hover:bg-zinc-100 transition-all">
                      Raise Dispute
                    </button>
                    <button className="flex-grow md:flex-grow-0 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
                      View Details <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
