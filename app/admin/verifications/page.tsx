'use client';

import { motion } from 'motion/react';
import { Search, Filter, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Eye, FileText, Store } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export default function AdminVerificationsPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVendors, setPendingVendors] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, is_verified')
        .eq('role', 'VENDOR')
        .eq('is_verified', false)
        .order('created_at', { ascending: false });

      if (error) {
        setPendingVendors([]);
        setIsLoading(false);
        return;
      }

      setPendingVendors(data ?? []);
      setIsLoading(false);
    };

    load();
  }, []);

  const filteredVendors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pendingVendors;
    return pendingVendors.filter((v) =>
      String(v.name ?? '').toLowerCase().includes(q) || String(v.email ?? '').toLowerCase().includes(q)
    );
  }, [pendingVendors, query]);

  const setVerified = async (vendorId: string, isVerified: boolean) => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('profiles').update({ is_verified: isVerified }).eq('id', vendorId);
    if (error) {
      alert(error.message);
      return;
    }
    setPendingVendors((prev) => prev.filter((v) => v.id !== vendorId));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Vendor Verifications</h1>
          <p className="text-zinc-500">Review and approve new vendor applications</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search vendors..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all w-full md:w-64"
            />
          </div>
          <button className="p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-500 hover:text-zinc-900 transition-all shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isLoading ? null : filteredVendors.length === 0 ? (
          <div className="lg:col-span-2 bg-white p-20 rounded-3xl border border-zinc-200 text-center space-y-4 opacity-40">
            <ShieldCheck size={64} className="mx-auto" />
            <p className="text-xl font-bold uppercase tracking-widest">No pending applications</p>
          </div>
        ) : (
          filteredVendors.map((vendor) => (
            <motion.div 
              key={vendor.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6 flex flex-col"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl font-bold">
                    {vendor.name[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">{vendor.name}</h3>
                    <p className="text-sm text-zinc-500">{vendor.email}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full uppercase tracking-wider border border-amber-100 flex items-center gap-1">
                  <ShieldAlert size={12} /> Pending Review
                </span>
              </div>

              <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={14} /> Submitted Documents
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-xl border border-zinc-200 flex items-center gap-3 hover:border-emerald-500 transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                    <span className="text-xs font-bold text-zinc-900 group-hover:text-emerald-600">Business_License.pdf</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-zinc-200 flex items-center gap-3 hover:border-emerald-500 transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                    <span className="text-xs font-bold text-zinc-900 group-hover:text-emerald-600">ID_Verification.jpg</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4 mt-auto">
                <button 
                  type="button"
                  onClick={() => alert('Not implemented')}
                  className="flex-grow py-3 bg-white border border-zinc-200 text-zinc-900 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all shadow-sm active:scale-95"
                >
                  <Eye size={18} /> View Store
                </button>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setVerified(vendor.id, false)}
                    className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100 hover:bg-red-100 transition-all shadow-sm active:scale-95"
                  >
                    <XCircle size={20} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setVerified(vendor.id, true)}
                    className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
                  >
                    <CheckCircle2 size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
