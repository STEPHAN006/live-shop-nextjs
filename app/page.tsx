'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ShoppingBag, Play, ShieldCheck, ArrowRight, Sparkles, Video, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'ADMIN') router.push('/admin/dashboard');
      else if (user.role === 'VENDOR') router.push('/vendor/dashboard');
      else router.push('/buyer/feed');
    }
  }, [user, isLoading, router]);

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="absolute inset-0 bg-linear-to-br from-zinc-50 via-white to-zinc-100" />
      <div className="relative">
        {/* Top bar */}
        <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-900">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-zinc-900 text-white shadow-lg">
              <ShoppingBag size={20} />
            </span>
            Live<span className="text-red-600">Shop</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-sm font-bold text-zinc-600 hover:text-zinc-900 hover:bg-white/60 transition-all"
            >
              Log in
            </Link>
            <Link
              href="/register/role"
              className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
            >
              Create account
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-12 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-zinc-200 text-xs font-bold text-zinc-700 shadow-sm">
                <Sparkles size={14} className="text-red-600" />
                Live video commerce, simplified
              </div>

              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-zinc-900">
                The marketplace where
                <span className="text-red-600"> live video</span>
                <br />
                meets e-commerce.
              </h1>
              <p className="text-lg text-zinc-600 leading-relaxed max-w-xl">
                Watch creators, chat in real time, and buy products instantly from interactive videos.
                Built with Next.js, Supabase, Socket.io and WebRTC.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-7 py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
                >
                  Get started <ArrowRight size={18} />
                </Link>
                <Link
                  href="/buyer/feed"
                  className="w-full sm:w-auto px-7 py-4 bg-white text-zinc-900 border border-zinc-200 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all shadow-sm active:scale-95"
                >
                  Browse feed
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 text-center">
                <StatPill label="Realtime" value="Chat" />
                <StatPill label="Secure" value="Supabase" />
                <StatPill label="Live" value="WebRTC" />
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 bg-red-600/10 blur-3xl rounded-full" />
              <div className="relative bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                  <p className="font-bold text-zinc-900">Preview</p>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Feed</span>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                  <PreviewCard icon={<Video size={18} />} title="Vertical videos" desc="TikTok-style feed" />
                  <PreviewCard icon={<ShoppingCart size={18} />} title="Instant buy" desc="From video products" />
                  <PreviewCard icon={<Play size={18} />} title="Live streams" desc="Broadcast & watch" />
                  <PreviewCard icon={<ShieldCheck size={18} />} title="RLS policies" desc="Secure by default" />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Play className="text-red-600" />}
              title="Live Feeds"
              description="Realtime video broadcasting with interactive shopping."
            />
            <FeatureCard
              icon={<ShoppingBag className="text-emerald-600" />}
              title="Direct Buy"
              description="Purchase products directly from the video experience."
            />
            <FeatureCard
              icon={<ShieldCheck className="text-blue-600" />}
              title="Secure by Design"
              description="RLS policies and auth flows with Supabase."
            />
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="bg-zinc-900 text-white rounded-3xl p-10 border border-zinc-800 shadow-2xl overflow-hidden relative">
            <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/5 rounded-full blur-2xl" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Ready to launch your live shop?</h2>
                <p className="text-zinc-300">Create an account and start streaming in minutes.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Link
                  href="/register/role"
                  className="w-full sm:w-auto px-7 py-4 bg-white text-zinc-900 rounded-2xl font-bold text-center hover:bg-zinc-100 transition-all active:scale-95"
                >
                  Create account
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-7 py-4 bg-red-600 text-white rounded-2xl font-bold text-center hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95"
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="max-w-6xl mx-auto px-6 pb-10 text-zinc-400 text-sm">
          © 2026 LiveShop Project. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm text-left space-y-2">
      <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center mb-2">
        {icon}
      </div>
      <h3 className="font-bold text-zinc-900">{title}</h3>
      <p className="text-sm text-zinc-500 leading-snug">{description}</p>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-white/70 rounded-2xl border border-zinc-200 shadow-sm">
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-zinc-900">{value}</p>
    </div>
  );
}

function PreviewCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
      <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 mb-3">
        {icon}
      </div>
      <p className="font-bold text-zinc-900">{title}</p>
      <p className="text-sm text-zinc-500">{desc}</p>
    </div>
  );
}
