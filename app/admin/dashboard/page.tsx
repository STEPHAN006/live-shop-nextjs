'use client';

import { motion } from 'motion/react';
import { 
  Users, 
  ShoppingBag, 
  Video, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { Modal } from '@/components/ui/modal';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [activeStreams, setActiveStreams] = useState<number>(0);
  const [openDisputes, setOpenDisputes] = useState<number>(0);
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);

  const [infoOpen, setInfoOpen] = useState(false);
  const [infoTitle, setInfoTitle] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const supabase = getSupabaseBrowserClient();

      const [profilesRes, purchasesRes, videosRes, disputesRes, pendingRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('purchases').select('amount'),
        supabase.from('videos').select('id', { count: 'exact', head: true }).eq('is_live', true),
        supabase.from('disputes').select('id', { count: 'exact', head: true }).eq('status', 'OPEN'),
        supabase
          .from('profiles')
          .select('id, name, email, role, is_verified')
          .eq('role', 'VENDOR')
          .eq('is_verified', false)
          .order('created_at', { ascending: false }),
      ]);

      setTotalUsers(profilesRes.count ?? 0);
      setActiveStreams(videosRes.count ?? 0);
      setOpenDisputes(disputesRes.count ?? 0);
      setPendingVerifications(pendingRes.data ?? []);

      const amounts = purchasesRes.data ?? [];
      const sum = amounts.reduce((acc, p: any) => acc + Number(p.amount ?? 0), 0);
      setTotalSales(sum);

      setIsLoading(false);
    };

    load();
  }, []);

  const stats = useMemo(() => {
    return [
      {
        label: 'Total Users',
        value: totalUsers.toLocaleString(),
        icon: <Users />,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        trend: 'Live',
        up: true,
      },
      {
        label: 'Total Sales',
        value: `$${totalSales.toFixed(2)}`,
        icon: <ShoppingBag />,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        trend: 'Live',
        up: true,
      },
      {
        label: 'Active Streams',
        value: String(activeStreams),
        icon: <Video />,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        trend: 'Live',
        up: true,
      },
      {
        label: 'Open Disputes',
        value: String(openDisputes),
        icon: <AlertTriangle />,
        color: 'text-red-600',
        bg: 'bg-red-50',
        trend: 'Live',
        up: false,
      },
    ];
  }, [activeStreams, openDisputes, totalSales, totalUsers]);

  const approveVendor = async (vendorId: string) => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('profiles').update({ is_verified: true }).eq('id', vendorId);
    if (error) {
      setInfoTitle('Error');
      setInfoMessage(error.message);
      setInfoOpen(true);
      return;
    }
    setPendingVerifications((prev) => prev.filter((v) => v.id !== vendorId));
  };

  const reviewDocs = (vendorId: string) => {
    router.push(`/admin/vendors/${vendorId}`);
  };

  return (
    <div className="space-y-8">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm space-y-4"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-zinc-900">{stat.value}</h3>
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold ${stat.up ? 'text-emerald-600' : 'text-red-600'}`}>
              {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {stat.trend}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Verifications */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="font-bold text-zinc-900 text-lg">Pending Verifications</h2>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">{pendingVerifications.length} Pending</span>
            </div>
            <div className="divide-y divide-zinc-100">
              {isLoading ? null : pendingVerifications.length === 0 ? (
                <div className="p-12 text-center space-y-2 opacity-40">
                  <CheckCircle2 size={40} className="mx-auto" />
                  <p className="font-bold uppercase tracking-widest text-xs">All caught up!</p>
                </div>
              ) : (
                pendingVerifications.map((vendor) => (
                  <div key={vendor.id} className="p-6 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center font-bold text-zinc-900 border border-zinc-200">
                        {vendor.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900">{vendor.name}</p>
                        <p className="text-xs text-zinc-500">{vendor.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => reviewDocs(vendor.id)}
                        className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-md"
                      >
                        Review Documents
                      </button>
                      <button
                        type="button"
                        onClick={() => approveVendor(vendor.id)}
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all"
                      >
                        <CheckCircle2 size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Platform Activity */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100">
              <h2 className="font-bold text-zinc-900 text-lg">Recent Alerts</h2>
            </div>
            <div className="p-6 space-y-6">
              <AlertItem 
                icon={<AlertTriangle className="text-red-600" />}
                bg="bg-red-50"
                title="New Dispute Raised"
                time="2 mins ago"
                description="Buyer John Doe raised a dispute for purchase #PUR-123."
              />
              <AlertItem 
                icon={<TrendingUp className="text-emerald-600" />}
                bg="bg-emerald-50"
                title="High Traffic Alert"
                time="15 mins ago"
                description="Tech Haven's live stream is trending with 5k+ viewers."
              />
              <AlertItem 
                icon={<Clock className="text-blue-600" />}
                bg="bg-blue-50"
                title="System Maintenance"
                time="1 hour ago"
                description="Scheduled maintenance completed successfully."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertItem({ icon, bg, title, time, description }: { icon: ReactNode, bg: string, title: string, time: string, description: string }) {
  return (
    <div className="flex gap-4">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-zinc-900">{title}</p>
          <span className="text-[10px] font-bold text-zinc-400 uppercase">{time}</span>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
