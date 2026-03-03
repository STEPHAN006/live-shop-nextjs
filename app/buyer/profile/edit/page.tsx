'use client';

import { useAuth } from '@/hooks/use-auth';
import { motion } from 'motion/react';
import { ArrowLeft, Camera, User, Mail, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditBuyerProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  if (isLoading || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsSaving(false);
    router.push('/buyer/profile');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Link href="/buyer/profile" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
        <ArrowLeft size={18} /> Back to Profile
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Edit Profile</h1>
        <p className="text-zinc-500">Update your personal information and preferences.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-zinc-900 text-white flex items-center justify-center text-5xl font-bold border-4 border-white shadow-xl">
              {name[0] || user.name[0]}
            </div>
            <button type="button" className="absolute bottom-0 right-0 p-3 bg-white text-zinc-900 rounded-2xl shadow-lg border border-zinc-100 hover:bg-zinc-50 transition-all group-hover:scale-110">
              <Camera size={20} />
            </button>
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Change Avatar</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={20} />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={20} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <Link 
            href="/buyer/profile"
            className="flex-grow py-4 bg-zinc-50 text-zinc-500 rounded-2xl font-bold text-center hover:bg-zinc-100 transition-all"
          >
            Cancel
          </Link>
          <button 
            type="submit"
            disabled={isSaving}
            className="flex-grow py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg active:scale-95 disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
