'use client';

import { motion } from 'motion/react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter,
  ChevronRight,
  MoreVertical,
  Clock
} from 'lucide-react';
import { MOCK_PURCHASES, MOCK_PRODUCTS, MOCK_USERS } from '@/lib/data';
import Image from 'next/image';

export default function VendorSalesPage() {
  // For demo, we'll use MOCK_PURCHASES as "current sales"
  const pendingOrders = MOCK_PURCHASES.filter(p => p.status === 'PENDING');
  const shippedOrders = MOCK_PURCHASES.filter(p => p.status === 'SHIPPED');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Order Management</h1>
          <p className="text-zinc-500">Track and fulfill your customer orders</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search orders..."
              className="pl-12 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all w-full md:w-64"
            />
          </div>
          <button className="p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-500 hover:text-zinc-900 transition-all shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30">
              <h2 className="font-bold text-zinc-900 flex items-center gap-2">
                <Clock size={18} className="text-amber-500" /> Active Orders
              </h2>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{MOCK_PURCHASES.length} Total</span>
            </div>
            <div className="divide-y divide-zinc-100">
              {MOCK_PURCHASES.map((order) => {
                const product = MOCK_PRODUCTS.find(p => p.id === order.productId);
                const buyer = MOCK_USERS.find(u => u.id === order.buyerId);
                
                return (
                  <div key={order.id} className="p-6 hover:bg-zinc-50 transition-colors group">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-zinc-100 shrink-0">
                        <Image src={product?.image || ''} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                      </div>
                      
                      <div className="flex-grow space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Order #{order.id}</span>
                          <span className="text-zinc-300">•</span>
                          <span className="text-xs font-medium text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 truncate">{product?.name}</h3>
                        <p className="text-sm text-zinc-500 font-medium">Customer: <span className="text-zinc-900 font-bold">{buyer?.name}</span></p>
                      </div>

                      <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                        <div className="text-right">
                          <p className="text-lg font-bold text-zinc-900">${order.amount.toFixed(2)}</p>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${
                            order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' : 
                            order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                          <button className="flex-grow md:flex-grow-0 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-md">
                            Update Status
                          </button>
                          <button className="p-2 bg-zinc-50 text-zinc-400 hover:text-zinc-900 rounded-xl border border-zinc-100 transition-all">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Stats */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-8">
            <h2 className="text-xl font-bold text-zinc-900">Order Summary</h2>
            
            <div className="space-y-4">
              <StatRow label="Pending Fulfillment" value={pendingOrders.length} color="text-amber-600" bg="bg-amber-50" icon={<Clock size={18} />} />
              <StatRow label="In Transit" value={shippedOrders.length} color="text-blue-600" bg="bg-blue-50" icon={<Truck size={18} />} />
              <StatRow label="Delivered" value={MOCK_PURCHASES.length - pendingOrders.length - shippedOrders.length} color="text-emerald-600" bg="bg-emerald-50" icon={<CheckCircle2 size={18} />} />
            </div>

            <div className="pt-6 border-t border-zinc-100">
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex gap-3 text-zinc-500">
                <AlertCircle className="shrink-0" size={20} />
                <p className="text-xs leading-relaxed font-medium">
                  Orders should be shipped within 48 hours to maintain your vendor rating.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, color, bg, icon }: { label: string, value: number, color: string, bg: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-zinc-50 bg-zinc-50/50">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-sm font-bold text-zinc-700">{label}</span>
      </div>
      <span className={`text-xl font-bold ${color}`}>{value}</span>
    </div>
  );
}
