'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'motion/react';
import { ShoppingBag, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-zinc-100 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 text-white mb-2 shadow-lg">
            <ShoppingBag size={32} />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Welcome Back</h1>
          <p className="text-zinc-500">Log in to your LiveShop account</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={20} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-semibold text-zinc-700">Password</label>
              <Link href="#" className="text-xs font-medium text-zinc-500 hover:text-zinc-900">Forgot password?</Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={20} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Log In'}
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-sm text-zinc-500">
            Don&apos;t have an account? <Link href="/register/role" className="font-bold text-zinc-900 hover:underline">Create one</Link>
          </p>
        </div>

        <div className="pt-6 border-t border-zinc-100">
          <p className="text-xs text-center text-zinc-400 font-mono">
            Demo Accounts:<br/>
            admin@liveshop.com<br/>
            vendor1@liveshop.com<br/>
            buyer1@liveshop.com
          </p>
        </div>
      </motion.div>
    </div>
  );
}
