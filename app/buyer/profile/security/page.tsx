'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, Lock, Mail } from 'lucide-react';

export default function BuyerSecurityPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/buyer/profile"
        className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        <ArrowLeft size={18} /> Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Security</h1>
          <p className="text-zinc-500">Manage your password and account security.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center">
              <Lock className="text-zinc-700" size={22} />
            </div>
            <p className="font-bold text-zinc-900">Change password</p>
            <p className="text-sm text-zinc-500">We’ll send you an email with a secure reset link.</p>
            <Link
              href="/reset-password"
              className="inline-flex items-center justify-center w-full py-3 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all active:scale-95"
            >
              Send reset email
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center">
              <Mail className="text-zinc-700" size={22} />
            </div>
            <p className="font-bold text-zinc-900">Email security</p>
            <p className="text-sm text-zinc-500">Make sure your email is secure and accessible.</p>
            <div className="text-sm text-zinc-500">
              If you can’t access your email, you may lose account recovery.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
