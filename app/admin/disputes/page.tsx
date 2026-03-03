'use client';

import { motion } from 'motion/react';
import { Search, Filter, AlertCircle, MessageCircle, MoreVertical, ShieldAlert, CheckCircle2, XCircle, Eye, User, Store } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { Modal } from '@/components/ui/modal';

export default function AdminDisputesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [profilesById, setProfilesById] = useState<Record<string, any>>({});

  const [infoOpen, setInfoOpen] = useState(false);
  const [infoTitle, setInfoTitle] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDisputeId, setConfirmDisputeId] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailDispute, setDetailDispute] = useState<any | null>(null);
  const [detailPurchase, setDetailPurchase] = useState<any | null>(null);
  const [detailProduct, setDetailProduct] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('disputes')
        .select('id, purchase_id, buyer_id, vendor_id, reason, status, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        setDisputes([]);
        setProfilesById({});
        setIsLoading(false);
        return;
      }

      const ids = Array.from(
        new Set((data ?? []).flatMap((d) => [d.buyer_id, d.vendor_id]).filter(Boolean))
      );
      if (ids.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, name').in('id', ids);
        const map: Record<string, any> = {};
        for (const p of profiles ?? []) map[p.id] = p;
        setProfilesById(map);
      } else {
        setProfilesById({});
      }

      setDisputes(data ?? []);
      setIsLoading(false);
    };

    load();
  }, []);

  const filteredDisputes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return disputes;
    return disputes.filter((d) => {
      const buyerName = String(profilesById[d.buyer_id]?.name ?? '').toLowerCase();
      const vendorName = String(profilesById[d.vendor_id]?.name ?? '').toLowerCase();
      return (
        String(d.id ?? '').toLowerCase().includes(q) ||
        String(d.reason ?? '').toLowerCase().includes(q) ||
        buyerName.includes(q) ||
        vendorName.includes(q)
      );
    });
  }, [disputes, profilesById, searchQuery]);

  const openInfo = (title: string, message: string) => {
    setInfoTitle(title);
    setInfoMessage(message);
    setInfoOpen(true);
  };

  const openDetail = async (disputeId: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailDispute(null);
    setDetailPurchase(null);
    setDetailProduct(null);

    const supabase = getSupabaseBrowserClient();
    const { data: dispute, error: disputeError } = await supabase
      .from('disputes')
      .select('id, purchase_id, buyer_id, vendor_id, reason, status, created_at')
      .eq('id', disputeId)
      .maybeSingle();

    if (disputeError || !dispute) {
      setDetailLoading(false);
      openInfo('Error', disputeError?.message ?? 'Dispute not found');
      setDetailOpen(false);
      return;
    }

    setDetailDispute(dispute);

    if (dispute.purchase_id) {
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .select('id, buyer_id, product_id, amount, status, created_at')
        .eq('id', dispute.purchase_id)
        .maybeSingle();

      if (purchaseError) {
        setDetailLoading(false);
        openInfo('Error', purchaseError.message);
        return;
      }

      setDetailPurchase(purchase ?? null);

      if (purchase?.product_id) {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id, name, price, vendor_id')
          .eq('id', purchase.product_id)
          .maybeSingle();

        if (productError) {
          setDetailLoading(false);
          openInfo('Error', productError.message);
          return;
        }

        setDetailProduct(product ?? null);
      }
    }

    setDetailLoading(false);
  };

  const reviewEvidence = (disputeId: string) => {
    openDetail(disputeId);
  };

  const resolveDispute = async (disputeId: string) => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('disputes').update({ status: 'RESOLVED' }).eq('id', disputeId);
    if (error) {
      openInfo('Error', error.message);
      return;
    }
    setDisputes((prev) => prev.map((d) => (d.id === disputeId ? { ...d, status: 'RESOLVED' } : d)));
    setDetailDispute((prev: any) => (prev?.id === disputeId ? { ...prev, status: 'RESOLVED' } : prev));
  };

  const reopenDispute = async (disputeId: string) => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('disputes').update({ status: 'OPEN' }).eq('id', disputeId);
    if (error) {
      openInfo('Error', error.message);
      return;
    }
    setDisputes((prev) => prev.map((d) => (d.id === disputeId ? { ...d, status: 'OPEN' } : d)));
    setDetailDispute((prev: any) => (prev?.id === disputeId ? { ...prev, status: 'OPEN' } : prev));
  };

  const requestResolve = (disputeId: string) => {
    setConfirmDisputeId(disputeId);
    setConfirmOpen(true);
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

      <Modal
        open={confirmOpen}
        title="Resolve dispute"
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-900 rounded-xl text-xs font-bold hover:bg-zinc-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!confirmDisputeId) return;
                setConfirmOpen(false);
                await resolveDispute(confirmDisputeId);
                setConfirmDisputeId(null);
              }}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all"
            >
              Mark as resolved
            </button>
          </>
        }
      >
        <p className="text-sm text-zinc-600 leading-relaxed">This will set the dispute status to RESOLVED.</p>
      </Modal>

      <Modal
        open={detailOpen}
        title="Dispute details"
        onClose={() => setDetailOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setDetailOpen(false)}
              className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-900 rounded-xl text-xs font-bold hover:bg-zinc-50 transition-all"
            >
              Close
            </button>
            {detailDispute?.status === 'OPEN' ? (
              <button
                type="button"
                onClick={() => requestResolve(detailDispute.id)}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all"
              >
                Resolve
              </button>
            ) : detailDispute?.status === 'RESOLVED' ? (
              <button
                type="button"
                onClick={() => reopenDispute(detailDispute.id)}
                className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all"
              >
                Reopen
              </button>
            ) : null}
          </>
        }
      >
        {detailLoading ? (
          <p className="text-sm text-zinc-600 leading-relaxed">Loading...</p>
        ) : !detailDispute ? (
          <p className="text-sm text-zinc-600 leading-relaxed">No data.</p>
        ) : (
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Dispute</p>
              <p className="text-sm font-bold text-zinc-900">#{detailDispute.id}</p>
              <p className="text-sm text-zinc-600 leading-relaxed">{detailDispute.reason}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Buyer</p>
                <p className="text-sm font-bold text-zinc-900 mt-2">{profilesById[detailDispute.buyer_id]?.name ?? detailDispute.buyer_id}</p>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Vendor</p>
                <p className="text-sm font-bold text-zinc-900 mt-2">{profilesById[detailDispute.vendor_id]?.name ?? detailDispute.vendor_id}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-zinc-200">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Purchase</p>
              {detailPurchase ? (
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-bold text-zinc-900">#{detailPurchase.id}</p>
                  <p className="text-sm text-zinc-600">Amount: ${Number(detailPurchase.amount ?? 0).toFixed(2)}</p>
                  <p className="text-sm text-zinc-600">Status: {detailPurchase.status}</p>
                </div>
              ) : (
                <p className="text-sm text-zinc-600 mt-2">No purchase found.</p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white border border-zinc-200">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Product</p>
              {detailProduct ? (
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-bold text-zinc-900">{detailProduct.name}</p>
                  <p className="text-sm text-zinc-600">Price: ${Number(detailProduct.price ?? 0).toFixed(2)}</p>
                </div>
              ) : (
                <p className="text-sm text-zinc-600 mt-2">No product found.</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Dispute Resolution</h1>
          <p className="text-zinc-500">Moderate and resolve conflicts between buyers and vendors</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search disputes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all w-full md:w-64"
            />
          </div>
          <button className="p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-500 hover:text-zinc-900 transition-all shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30">
              <h2 className="font-bold text-zinc-900 flex items-center gap-2">
                <ShieldAlert size={18} className="text-red-500" /> Active Disputes
              </h2>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{filteredDisputes.length} Total</span>
            </div>
            <div className="divide-y divide-zinc-100">
              {isLoading ? null : filteredDisputes.map((dispute) => {
                const buyer = profilesById[dispute.buyer_id];
                const vendor = profilesById[dispute.vendor_id];
                
                return (
                  <div key={dispute.id} className="p-8 hover:bg-zinc-50 transition-colors group">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                      <div className="flex-grow space-y-4 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Dispute #{dispute.id}</span>
                          <span className="text-zinc-300">•</span>
                          <span className="text-xs font-medium text-zinc-500">{new Date(dispute.created_at).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 truncate">{dispute.reason}</h3>
                        
                        <div className="flex items-center gap-8">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                              <User size={12} />
                            </div>
                            <span className="text-xs font-bold text-zinc-700">{buyer?.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">
                              <Store size={12} />
                            </div>
                            <span className="text-xs font-bold text-zinc-700">{vendor?.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            dispute.status === 'OPEN' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {dispute.status}
                          </span>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                          <button
                            type="button"
                            onClick={() => reviewEvidence(dispute.id)}
                            className="flex-grow md:flex-grow-0 px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-md"
                          >
                            Review Evidence
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (dispute.status === 'OPEN') {
                                requestResolve(dispute.id);
                                return;
                              }
                              openInfo('Not implemented', 'More actions are not implemented yet.');
                            }}
                            className="p-2.5 bg-zinc-50 text-zinc-400 hover:text-zinc-900 rounded-xl border border-zinc-100 transition-all"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 p-8 rounded-3xl text-white space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertCircle size={20} className="text-red-400" /> Resolution Policy
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-zinc-400 leading-relaxed">
                As an admin, you must review evidence from both parties before making a final decision.
              </p>
              <ul className="space-y-2 text-xs font-medium text-zinc-500">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Verify shipment tracking</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Check chat logs</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Review product photos</li>
              </ul>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-zinc-900">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-900">Dispute #D-1022 Resolved</p>
                  <p className="text-[10px] text-zinc-500">Refund issued to Buyer u-1</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MessageCircle size={16} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-900">New Evidence Submitted</p>
                  <p className="text-[10px] text-zinc-500">Vendor u-2 uploaded photos for #D-1024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
