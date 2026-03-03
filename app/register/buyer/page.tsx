'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Lock, ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export default function RegisterBuyerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
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
            name,
            role: 'BUYER',
          },
        },
      });

      if (signUpError) throw signUpError;

      setEmailSentTo(email);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!emailSentTo) return;
    setError('');
    setIsResending(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: emailSentTo,
      });
      if (resendError) throw resendError;
    } catch (err: any) {
      setError(err.message || 'Failed to resend email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-zinc-100 space-y-8"
      >
        <Link href="/register/role" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={16} /> Back to roles
        </Link>

        {emailSentTo ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white mb-2 shadow-lg">
                <MailCheck size={32} />
              </div>
              <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Check your email</h1>
              <p className="text-zinc-500">
                We sent a confirmation link to <span className="font-semibold text-zinc-900">{emailSentTo}</span>.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="w-full py-4 bg-white text-zinc-900 border border-zinc-200 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all shadow-sm active:scale-95 disabled:opacity-70"
              >
                {isResending ? <Loader2 className="animate-spin" size={20} /> : 'Resend confirmation email'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/login')}
                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
              >
                Go to login
              </button>
            </div>

            <p className="text-xs text-center text-zinc-400 leading-relaxed">
              Didn’t receive it? Check your spam folder.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Buyer Account</h1>
              <p className="text-zinc-500">Join the LiveShop community</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={20} />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
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
                placeholder="name@example.com"
                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
              />
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

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg active:scale-95 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
              </button>
            </form>

            <p className="text-xs text-center text-zinc-400 leading-relaxed">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
