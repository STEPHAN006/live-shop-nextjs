'use client';

import { motion } from 'motion/react';
import { Search, Filter, MoreVertical, Shield, User, Mail, ShieldCheck, ShieldAlert, Trash2, Edit2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, avatar, is_verified, wallet_balance')
        .order('created_at', { ascending: false });

      if (error) {
        setUsers([]);
        setIsLoading(false);
        return;
      }

      setUsers(data ?? []);
      setIsLoading(false);
    };

    load();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      String(u.name ?? '').toLowerCase().includes(q) || String(u.email ?? '').toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user profile?')) return;
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      alert(error.message);
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">User Management</h1>
          <p className="text-zinc-500">Oversee all platform participants and their roles</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
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

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50">
                <th className="px-8 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">User</th>
                <th className="px-8 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Wallet</th>
                <th className="px-8 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? null : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{user.name}</p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'ADMIN' ? 'bg-purple-50 text-purple-600' :
                      user.role === 'VENDOR' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1.5">
                      {user.is_verified ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                          <ShieldCheck size={12} /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                          <ShieldAlert size={12} /> Pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-zinc-900">${Number(user.wallet_balance ?? 0).toFixed(2)}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button"
                        onClick={() => alert('Not implemented')}
                        className="p-2 bg-zinc-50 text-zinc-400 hover:text-zinc-900 rounded-lg border border-zinc-100 transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDelete(user.id)}
                        className="p-2 bg-zinc-50 text-zinc-400 hover:text-red-600 rounded-lg border border-zinc-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => alert('Not implemented')}
                        className="p-2 bg-zinc-50 text-zinc-400 hover:text-zinc-900 rounded-lg border border-zinc-100 transition-all"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
