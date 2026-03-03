'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ShoppingBag, Play, ShieldCheck, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-linear-to-br from-zinc-50 to-zinc-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center space-y-8"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-zinc-900 text-white mb-4 shadow-xl">
          <ShoppingBag size={40} />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900">
          Live<span className="text-red-600">Shop</span>
        </h1>
        
        <p className="text-xl text-zinc-600 max-w-lg mx-auto leading-relaxed">
          The marketplace where live video meets e-commerce. Watch, interact, and shop your favorite brands in real-time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
          <FeatureCard 
            icon={<Play className="text-red-600" />}
            title="Live Feeds"
            description="Real-time video broadcasting with instant shopping."
          />
          <FeatureCard 
            icon={<ShoppingBag className="text-emerald-600" />}
            title="Direct Buy"
            description="Purchase products directly from the video overlay."
          />
          <FeatureCard 
            icon={<ShieldCheck className="text-blue-600" />}
            title="Verified"
            description="Safe transactions with verified vendors and disputes."
          />
        </div>

        <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-zinc-900 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            Get Started <ArrowRight size={20} />
          </Link>
          <Link 
            href="/register/role"
            className="w-full sm:w-auto px-8 py-4 bg-white text-zinc-900 border border-zinc-200 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all shadow-sm active:scale-95"
          >
            Create Account
          </Link>
        </div>
      </motion.div>
      
      <footer className="mt-20 text-zinc-400 text-sm">
        © 2026 LiveShop Project. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm text-left space-y-2">
      <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center mb-2">
        {icon}
      </div>
      <h3 className="font-bold text-zinc-900">{title}</h3>
      <p className="text-sm text-zinc-500 leading-snug">{description}</p>
    </div>
  );
}
