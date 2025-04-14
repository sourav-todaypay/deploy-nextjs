import { PaginationRoot } from '@/types/PaginationRoot';

export interface llmProviderListPaginatedResponse extends PaginationRoot {
  data: llmProviderListData[];
}

export interface llmProviderListData {
  created_at: string;
  id: number;
  name: string;
  key: string;
  weight: number;
  prompt_id: number;
}
