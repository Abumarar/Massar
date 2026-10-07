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

    const initSocket = async () => {
      const token = await SecureStore.getItemAsync('massar_jwt');
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://d3225dxeajx9t8.cloudfront.net';

      const newSocket = io(baseUrl, {
        auth: { token },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket server:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from socket server');
        setIsConnected(false);
      });

      setSocket(newSocket);
    };

    initSocket();

    return () => {
      if (socket) {
        socket.disconnect();
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
