'use client';

import Link from 'next/link';
import { Bell, ArrowLeft } from 'lucide-react';

export default function BuyerNotificationsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Notifications</h1>
          <p className="text-zinc-500">Your latest updates</p>
        </div>
        <Link
          href="/buyer/feed"
          className="px-4 py-2 bg-white border border-zinc-200 rounded-xl font-bold text-zinc-900 hover:bg-zinc-50 transition-all inline-flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Back
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-12 text-center space-y-4 opacity-60">
        <Bell size={44} className="mx-auto text-zinc-400" />
        <p className="text-lg font-bold text-zinc-900">No notifications yet</p>
        <p className="text-sm text-zinc-500">When vendors you follow go live or you receive updates, they’ll show up here.</p>
      </div>
    </div>
  );
}
