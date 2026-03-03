'use client';

import { useParams } from 'next/navigation';
import { MOCK_VIDEOS } from '@/lib/data';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  BarChart3, 
  Eye, 
  Heart, 
  MessageCircle, 
  ShoppingBag, 
  TrendingUp, 
  Users,
  Clock,
  Share2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function VideoStatsPage() {
  const { id } = useParams();
  const video = MOCK_VIDEOS.find(v => v.id === id);

  if (!video) return <div>Video not found</div>;

  const stats = [
    { label: 'Total Views', value: video.viewCount, sub: '+12% from last week', icon: <Eye /> },
    { label: 'Total Likes', value: video.likes, sub: '+5% from last week', icon: <Heart /> },
    { label: 'Comments', value: '42', sub: 'Active engagement', icon: <MessageCircle /> },
    { label: 'Product Clicks', value: '156', sub: '8.4% conversion', icon: <ShoppingBag /> },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/vendor/videos" className="p-2 bg-white border border-zinc-200 rounded-xl text-zinc-500 hover:text-zinc-900 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Video Analytics</h1>
            <p className="text-zinc-500">Performance data for &quot;{video.title}&quot;</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-6 py-2.5 bg-white border border-zinc-200 rounded-xl font-bold text-zinc-900 hover:bg-zinc-50 transition-all flex items-center gap-2">
            <Share2 size={18} /> Share Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-50 text-zinc-400 flex items-center justify-center">
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-bold text-zinc-900">{stat.value}</h3>
              <p className="text-[10px] font-medium text-emerald-600 mt-1">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-600" /> Audience Retention
              </h2>
              <select className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-600 outline-none">
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
              </select>
            </div>
            
            <div className="aspect-video bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 flex items-end px-8 pb-8 gap-2">
                {[40, 60, 45, 80, 55, 90, 70, 85, 60, 75, 50, 65].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05, duration: 1 }}
                    className="flex-grow bg-zinc-200 rounded-t-lg hover:bg-emerald-500 transition-colors cursor-pointer group relative"
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {h}% retention
                    </div>
                  </motion.div>
                ))}
              </div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest z-10">Engagement Chart Placeholder</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-zinc-900">Traffic Sources</h2>
            <div className="space-y-4">
              <SourceRow label="Direct Feed" percentage={65} color="bg-emerald-500" />
              <SourceRow label="Search Results" percentage={20} color="bg-blue-500" />
              <SourceRow label="Following Tab" percentage={10} color="bg-purple-500" />
              <SourceRow label="External Links" percentage={5} color="bg-zinc-400" />
            </div>
          </div>

          <div className="bg-zinc-900 p-8 rounded-3xl text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Users size={20} className="text-emerald-400" />
              </div>
              <h3 className="font-bold">Viewer Insights</h3>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Most of your viewers are active between 6 PM and 9 PM. Consider scheduling your next live stream during this window.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SourceRow({ label, percentage, color }: { label: string, percentage: number, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-zinc-500 uppercase tracking-wider">{label}</span>
        <span className="text-zinc-900">{percentage}%</span>
      </div>
      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1 }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}
