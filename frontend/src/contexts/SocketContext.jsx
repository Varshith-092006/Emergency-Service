import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('emergency-alert', (data) => {
        if (data.type === 'sos') {
          toast.error('Emergency Alert: SOS signal received!', {
            duration: 10000,
            icon: '🚨'
          });
        }
      });

      newSocket.on('service-changed', (data) => {
        toast.success('Service information updated', {
          duration: 3000
        });
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        toast.error('Connection error. Trying to reconnect...');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const joinLocation = (lat, lng) => {
    if (socket && isConnected) {
      socket.emit('join-location', { lat, lng });
    }
  };

  const sendSOSAlert = (location, emergencyType) => {
    if (socket && isConnected) {
      socket.emit('sos-alert', {
        location,
        emergencyType,
        userId: user?.id
      });
    }
  };

  const value = {
    socket,
    isConnected,
    joinLocation,
    sendSOSAlert
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext; 