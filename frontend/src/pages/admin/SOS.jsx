import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import api from '../../services/api';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext.jsx';

const AdminSOS = () => {
  const { data, isLoading, refetch } = useQuery('admin-sos', async () => {
    const res = await api.get('api/sos/admin/active');
    return res.data.data.activeSos;
  });
  const { socket } = useSocket();

  React.useEffect(() => {
    if (!socket) return;
    socket.on('emergency-alert', refetch);
    return () => socket.off('emergency-alert', refetch);
  }, [socket, refetch]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Live SOS Alerts</h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-32"><Loader2 className="animate-spin w-8 h-8 text-primary-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.map(sos => (
            <div key={sos._id} className="card p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-error-600 animate-pulse-glow" />
                <span className="font-semibold">{sos.emergencyType}</span>
                <span className="text-xs text-gray-500">{sos.status}</span>
              </div>
              <div className="text-xs text-gray-500">{sos.location?.address || 'No address'}</div>
              <div className="text-xs text-gray-400">Reported: {new Date(sos.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSOS; 