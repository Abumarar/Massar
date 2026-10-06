import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useLogin, useRegister, getMe, setAuthTokenGetter, User, LoginBody, RegisterBody } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginBody) => Promise<void>;
  register: (data: RegisterBody) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Setup the getter for the API client
    setAuthTokenGetter(async () => {
      try {
        return await SecureStore.getItemAsync('massar_jwt');
      } catch {
        return null;
      }
    });

    const loadUser = async () => {
      try {
        const token = await SecureStore.getItemAsync('massar_jwt');
        if (token) {
          // Fetch user profile using the token
          const userData = await getMe();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        await SecureStore.deleteItemAsync('massar_jwt');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (data: LoginBody) => {
    const res = await loginMutation.mutateAsync({ data });
    await SecureStore.setItemAsync('massar_jwt', res.token);
    setUser(res.user);
    // Invalidate queries so components refetch with new token
    queryClient.invalidateQueries();
  };

  const register = async (data: RegisterBody) => {
    const res = await registerMutation.mutateAsync({ data });
    await SecureStore.setItemAsync('massar_jwt', res.token);
    setUser(res.user);
    queryClient.invalidateQueries();
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('massar_jwt');
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
