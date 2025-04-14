import { PaginationRoot } from '@/types/PaginationRoot';

export interface ApiKeysPaginatedResponse extends PaginationRoot {
  data: ApiKey[];
}

export interface ApiKey {
  key_id: string;
  created_at: string;
}
