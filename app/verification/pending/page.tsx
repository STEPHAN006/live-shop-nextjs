'use client';

import { motion } from 'motion/react';
import { Clock, RefreshCw, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function VerificationPendingPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-zinc-100 text-center space-y-8"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-100 text-zinc-900 mb-2">
          <Clock size={40} className="animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Verification Pending</h1>
          <p className="text-zinc-500">Our team is currently reviewing your vendor application. This usually takes 24-48 hours.</p>
        </div>

        <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 text-left space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500">Status</span>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase">In Review</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500">Submitted on</span>
            <span className="text-sm text-zinc-900">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg active:scale-95 disabled:opacity-70"
          >
            <RefreshCw className={isRefreshing ? 'animate-spin' : ''} size={20} />
            Refresh Status
          </button>
          
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft size={16} /> Return to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
