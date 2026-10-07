import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from './AuthContext';

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    let activeSocket: Socket | null = null;
    let isCancelled = false;

    const initSocket = async () => {
      try {
        const token = await SecureStore.getItemAsync('massar_jwt');
        if (isCancelled) return;
        const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://d3225dxeajx9t8.cloudfront.net';

        activeSocket = io(baseUrl, {
          auth: { token },
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnectionAttempts: 5,
        });

        activeSocket.on('connect', () => {
          if (!isCancelled) setIsConnected(true);
        });

        activeSocket.on('disconnect', () => {
          if (!isCancelled) setIsConnected(false);
        });

        activeSocket.on('connect_error', () => {
          if (!isCancelled) setIsConnected(false);
        });

        if (!isCancelled) {
          setSocket(activeSocket);
        }
      } catch (err) {
        console.warn('Socket initialization failed (non-critical):', err);
      }
    };

    void initSocket();

    return () => {
      isCancelled = true;
      if (activeSocket) {
        activeSocket.disconnect();
      }
    };
  }, [user, isLoading]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
