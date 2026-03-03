'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Store, Mail, Lock, ArrowLeft, Loader2, Upload, FileText, MailCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { uploadToPublicBucket } from '@/lib/storage';
import { Modal } from '@/components/ui/modal';

export default function RegisterVendorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [docs, setDocs] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();

  const [infoOpen, setInfoOpen] = useState(false);
  const [infoTitle, setInfoTitle] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

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

      setEmailSentTo(email);
    } catch (err: any) {
      const msg = err.message || 'Failed to create vendor account';
      setError(msg);
      setInfoTitle('Error');
      setInfoMessage(msg);
      setInfoOpen(true);
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
      const msg = err.message || 'Failed to resend email';
      setError(msg);
      setInfoTitle('Error');
      setInfoMessage(msg);
      setInfoOpen(true);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50">
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

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-white p-10 rounded-3xl shadow-xl border border-zinc-100 space-y-8"
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

            {docs.length > 0 && (
              <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm text-zinc-600">
                Your documents are selected ({docs.length}). After confirming your email, log in and upload them from your vendor profile.
              </div>
            )}

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
            <label className="border-2 border-dashed border-zinc-200 rounded-2xl p-8 text-center space-y-2 hover:border-zinc-400 transition-colors cursor-pointer bg-zinc-50 block">
              <input
                type="file"
                multiple
                accept="application/pdf,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  setDocs(files);
                }}
              />
              <Upload className="mx-auto text-zinc-400" size={32} />
              <p className="text-sm text-zinc-500 font-medium">Click to upload</p>
              <p className="text-xs text-zinc-400">PDF, JPG or PNG (max. 10MB)</p>
              {docs.length > 0 ? (
                <p className="text-xs text-zinc-500 font-medium">{docs.length} file(s) selected</p>
              ) : null}
            </label>
          </div>

          <button 
            type="submit"
            disabled={isLoading || isUploadingDocs}
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
          </>
        )}
      </motion.div>
    </div>
  );
}
