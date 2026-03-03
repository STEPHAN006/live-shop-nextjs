'use client';

import { motion } from 'motion/react';
import { User, Store, ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RoleSelectionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 text-white mb-2 shadow-lg">
            <ShoppingBag size={32} />
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">Join LiveShop</h1>
          <p className="text-zinc-500 text-lg">Choose how you want to use the platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RoleCard 
            icon={<User size={40} />}
            title="Buyer"
            description="Watch live streams, follow creators, and shop unique products from around the world."
            href="/register/buyer"
            color="bg-blue-50 text-blue-600"
          />
          <RoleCard 
            icon={<Store size={40} />}
            title="Vendor"
            description="Start your own live shop, manage products, and grow your business with live video."
            href="/register/vendor"
            color="bg-emerald-50 text-emerald-600"
          />
        </div>

        <div className="text-center pt-4">
          <p className="text-sm text-zinc-500">
            Already have an account? <Link href="/login" className="font-bold text-zinc-900 hover:underline">Log in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function RoleCard({ icon, title, description, href, color }: { icon: React.ReactNode, title: string, description: string, href: string, color: string }) {
  return (
    <Link href={href} className="group">
      <div className="h-full p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm hover:shadow-xl hover:border-zinc-200 transition-all space-y-6 flex flex-col">
        <div className={`w-20 h-20 rounded-2xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="space-y-2 flex-grow">
          <h3 className="text-2xl font-bold text-zinc-900">{title}</h3>
          <p className="text-zinc-500 leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center gap-2 text-zinc-900 font-bold group-hover:gap-4 transition-all">
          Continue as {title} <ArrowRight size={20} />
        </div>
      </div>
    </Link>
  );
}
