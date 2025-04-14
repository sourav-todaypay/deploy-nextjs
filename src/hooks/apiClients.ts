'use client';

import { useAuth } from '@/providers/AuthProvider';
import { AuthStatus } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import fetchAPI from '../utils/fetchClient';
import Store from '../utils/store';
import { ApiParams } from '@/types/apiParams';
import { convertParamsToString } from '@/utils/convertParamsToString';

export const useApi = () => {
  const { setAuthStatus } = useAuth();
  const router = useRouter();
  const store = new Store();

  const handleUnauthorized = () => {
    setAuthStatus(AuthStatus.AuthRequired);
    store.clear();
    router.replace('/signin');
    return;
  };

  const apiRequest = async (
    path: string,
    method: string = 'GET',
    payload: ApiParams | ApiParams[] | null = null,
    isAuthenticated: boolean = false,
    customHeaders?: HeadersInit,
  ) => {
    try {
      return await fetchAPI(
        path,
        method,
        payload,
        isAuthenticated,
        customHeaders,
      );
    } catch (error) {
      if ((error as Error).message === 'Unauthorized') {
        handleUnauthorized();
      }
      throw error;
    }
  };

  return {
    get: (path: string, params?: ApiParams) => {
      const urlParams = params
        ? `?${new URLSearchParams(convertParamsToString(params)).toString()}`
        : '';
      return apiRequest(`${path}${urlParams}`, 'GET');
    },
    authenticatedGet: (path: string, params?: ApiParams) => {
      const urlParams = params
        ? `?${new URLSearchParams(convertParamsToString(params)).toString()}`
        : '';
      return apiRequest(`${path}${urlParams}`, 'GET', null, true);
    },
    post: (
      path: string,
      payload?: ApiParams | FormData,
      headers?: HeadersInit,
    ) => {
      return fetchAPI(path, 'POST', payload, false, headers);
    },
    authenticatedPost: (path: string, payload?: ApiParams) => {
      return apiRequest(path, 'POST', payload, true);
    },
    put: (path: string, payload?: ApiParams) => {
      return apiRequest(path, 'PUT', payload);
    },
    authenticatedPut: (path: string, payload?: ApiParams) => {
      return apiRequest(path, 'PUT', payload, true);
    },
    delete: (path: string, payload?: ApiParams) => {
      return apiRequest(path, 'DELETE', payload);
    },
    authenticatedDelete: (path: string, payload?: ApiParams) => {
      return apiRequest(path, 'DELETE', payload, true);
    },
  };
};
