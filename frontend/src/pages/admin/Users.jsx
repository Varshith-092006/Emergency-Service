import React, { useState } from 'react';
import { useQuery } from 'react-query';
import api from '../../services/api';
import { Loader2, User, Shield, Check, X } from 'lucide-react';

const AdminUsers = () => {
  const [search, setSearch] = useState('');
  const { data, isLoading, refetch } = useQuery(['admin-users', search], async () => {
    const res = await api.get('/api/users', { params: { search } });
    return res.data.data.users;
  });

  return (
    <div className="p-8 sm:p-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="flex flex-col space-y-2">
          <span className="text-[var(--secondary-color)] text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Directory</span>
          <h1 className="text-5xl font-black text-[var(--primary-color)] tracking-tighter italic" style={{ fontFamily: 'var(--font-serif)' }}>
            Manage <span className="not-italic text-[var(--text-color)]">Users</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-[var(--border-color)] shadow-sm max-w-md w-full">
          <input
            type="text"
            placeholder="Search network members..."
            className="flex-1 bg-transparent px-6 py-3 text-sm font-medium focus:outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button 
            className="btn btn-primary px-8 py-3 text-xs" 
            onClick={() => refetch()}
          >
            Search
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin w-10 h-10 text-[var(--primary-color)]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {data?.map(user => (
            <div key={user._id} className="bg-white rounded-[2.5rem] border border-[var(--border-color)] p-10 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-color)]/5 rounded-bl-[100px] -mr-10 -mt-10 group-hover:bg-[var(--secondary-color)]/10 transition-colors"></div>
              
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--primary-color)]/5 flex items-center justify-center border border-[var(--primary-color)]/10">
                    <User className="w-8 h-8 text-[var(--primary-color)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-black text-[var(--primary-color)] italic" style={{ fontFamily: 'var(--font-serif)' }}>{user.name}</h3>
                      {user.role === 'admin' && (
                        <span className="px-3 py-1 bg-[var(--secondary-color)]/10 text-[var(--secondary-color)] text-[8px] font-black uppercase tracking-widest rounded-full border border-[var(--secondary-color)]/20">Admin</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-[var(--text-muted)]">{user.email}</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_10px_rgba(34,197,94,0.3)]`}></div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 relative z-10 text-[xs] font-black uppercase tracking-widest opacity-60">
                <div className="flex flex-col gap-1">
                  <span>Phone</span>
                  <span className="text-[var(--text-color)] opacity-100">{user.phone}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span>Joined</span>
                  <span className="text-[var(--text-color)] opacity-100">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-10 flex gap-4 pt-8 border-t border-[var(--border-color)] relative z-10">
                <button className="flex-1 btn btn-outline border-[var(--primary-color)]/10 text-sm py-4 bg-[var(--background-color)] hover:bg-[var(--primary-color)] hover:text-white">
                  <Shield className="w-4 h-4 mr-2" /> Revoke Admin
                </button>
                <button className={`flex-1 btn text-sm py-4 ${user.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                  {user.isActive ? 'Suspend' : 'Reinstate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers; 