/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Store from '@/utils/store';
import { ACCESS_TOKEN_KEY } from '@/constants/authConstants';
import { User } from '@/types/user';
import { AppRoute } from '@/constants/routes';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import toast from 'react-hot-toast';
import { Product } from '@/app/(protected)/gift_cards/brands/[id]/type';

interface AuthProviderProps {
  children: ReactNode;
}

interface RefreshSessionResponse {
  access_token: string;
  access_token_expiry_in_seconds: number;
}

export interface Products {
  productName: string;
  value: string;
}

export enum AuthStatus {
  Unknown,
  AuthRequired,
  ValidateAccess,
  AuthSuccessful,
}

export const AuthContext = createContext<{
  user: User | null;
  authStatus: AuthStatus;
  setAuthStatus: (status: AuthStatus) => void;
  getUser: () => void;
  logout: () => void;
  products: Products[];
}>({
  user: null,
  authStatus: AuthStatus.Unknown,
  setAuthStatus: () => {},
  getUser: () => {},
  logout: () => {},
  products: [],
});

function useAuthProvider() {
  const api = useApiInstance();
  const store = new Store();
  const sessionTimer = useRef<NodeJS.Timeout | null>(null);
  const userRef = useRef<User | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.Unknown);
  const [products, setProducts] = useState<Products[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const accessToken = store.get(ACCESS_TOKEN_KEY);
    if (accessToken) {
      refreshSession();
    } else {
      setAuthStatus(AuthStatus.AuthRequired);
    }
  }, []);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    switch (authStatus) {
      case AuthStatus.AuthRequired:
        if (sessionTimer.current) {
          clearTimeout(sessionTimer.current);
        }
        setUser(null);
        store.remove(ACCESS_TOKEN_KEY);
        break;
      case AuthStatus.ValidateAccess:
        getUser();
        break;
      case AuthStatus.AuthSuccessful:
        getProducts();
        scheduleRefresh(60);
        break;
    }
  }, [authStatus]);

  const cleanupState = (forced?: boolean) => {
    if (pathname !== AppRoute.Auth || forced) {
      store.remove(ACCESS_TOKEN_KEY);
      setAuthStatus(AuthStatus.AuthRequired);
      router.replace(AppRoute.Auth);
    }
  };

  const getUser = async () => {
    try {
      const data = await handleResponse(api.authenticatedGet('/users/profile'));
      if (!data.role) {
        cleanupState(true);
        return;
      }
      setUser(data);
      setAuthStatus(AuthStatus.AuthSuccessful);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch user details.');
      } else {
        toast.error('Something went wrong');
      }
      setUser(null);
      setAuthStatus(AuthStatus.AuthRequired);
    }
  };

  const getProducts = async () => {
    try {
      const res = await handleResponse(
        api.authenticatedGet(`/internal/products?limit=-1`),
      );
      const mappedProducts = res.data.map((product: Product) => ({
        productName: product.name,
        value: product.id,
      }));
      setProducts(mappedProducts);
      return mappedProducts;
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch products.');
      } else {
        toast.error('Failed to fetch products');
      }
      return [];
    }
  };

  const logout = () => {
    api.authenticatedGet('/users/logout').finally(() => {});
    setAuthStatus(AuthStatus.AuthRequired);
    store.clear();
  };

  const scheduleRefresh = (timeout: number) => {
    if (sessionTimer.current) {
      clearTimeout(sessionTimer.current);
    }
    sessionTimer.current = setTimeout(refreshSession, Math.min(timeout * 1000));
  };

  const refreshSession = async () => {
    try {
      const data: RefreshSessionResponse = await handleResponse(
        api.authenticatedGet('/users/refresh'),
      );
      if (data.access_token) {
        scheduleRefresh(data.access_token_expiry_in_seconds - 10);
        if (!userRef.current) {
          setAuthStatus(AuthStatus.ValidateAccess);
        }
      } else {
        cleanupState();
        setAuthStatus(AuthStatus.AuthRequired);
      }
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Session refresh failed');
      } else {
        toast.error('Something went wrong');
      }
      setAuthStatus(AuthStatus.AuthRequired);
      cleanupState();
    }
  };

  return {
    user,
    authStatus,
    setAuthStatus,
    getUser,
    logout,
    products,
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const authProvider = useAuthProvider();
  return (
    <AuthContext.Provider value={authProvider}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
