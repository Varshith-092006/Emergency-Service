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
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search users..."
          className="form-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn btn-primary" onClick={() => refetch()}>Search</button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-32"><Loader2 className="animate-spin w-8 h-8 text-primary-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.map(user => (
            <div key={user._id} className="card p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary-600" />
                <span className="font-semibold">{user.name}</span>
                {user.role === 'admin' && <Shield className="w-4 h-4 text-secondary-600" />}
              </div>
              <div className="text-xs text-gray-500">{user.email} | {user.phone}</div>
              <div className="flex gap-2 mt-2">
                <span className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}>{user.isActive ? 'Active' : 'Inactive'}</span>
                <button className="btn btn-sm btn-success flex items-center gap-1"><Check className="w-4 h-4" /> Activate</button>
                <button className="btn btn-sm btn-error flex items-center gap-1"><X className="w-4 h-4" /> Deactivate</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers; 