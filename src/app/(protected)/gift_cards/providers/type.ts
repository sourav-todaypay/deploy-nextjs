import { PaginationRoot } from '@/types/PaginationRoot';

export interface GcProvidersPaginatedResponse extends PaginationRoot {
  data: GetProvider[];
}

export interface GetProvider {
  id: number;
  name: string;
  key: string;
  description: string;
  config: Config;
  weight: number;
  is_activated: boolean;
}

export interface Config {
  [key: string]: string | number | boolean | null | undefined;
}
