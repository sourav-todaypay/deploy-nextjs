import { useApi } from './apiClients';

export const useApiInstance = () => {
  return useApi();
};

export type ApiInstance = ReturnType<typeof useApiInstance>;
