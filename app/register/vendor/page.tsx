'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Store, Mail, Lock, ArrowLeft, Loader2, Upload, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export default function RegisterVendorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: shopName,
            role: 'VENDOR',
          },
        },
      });

      if (signUpError) throw signUpError;

      router.push('/verification/pending');
    } catch (err: any) {
      setError(err.message || 'Failed to create vendor account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-white p-10 rounded-3xl shadow-xl border border-zinc-100 space-y-8"
      >
        <Link href="/register/role" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={16} /> Back to roles
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Vendor Account</h1>
          <p className="text-zinc-500">Start your live shop today</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 ml-1">Shop Name</label>
              <div className="relative group">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={20} />
                <input 
                  type="text" 
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="My Awesome Shop"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vendor@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={20} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 ml-1">Verification Documents (ID/Business License)</label>
            <div className="border-2 border-dashed border-zinc-200 rounded-2xl p-8 text-center space-y-2 hover:border-zinc-400 transition-colors cursor-pointer bg-zinc-50">
              <Upload className="mx-auto text-zinc-400" size={32} />
              <p className="text-sm text-zinc-500 font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-zinc-400">PDF, JPG or PNG (max. 10MB)</p>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg active:scale-95 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Vendor Account'}
          </button>
        </form>

        <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
          <FileText className="text-zinc-400 shrink-0" size={20} />
          <p className="text-xs text-zinc-500 leading-relaxed">
            Your account will be reviewed by our administration team. Verification typically takes 24-48 hours. You will be notified via email once approved.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
