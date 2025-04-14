import { PaginationRoot } from '@/types/PaginationRoot';

export interface getAllPromptsRequestResponse extends PaginationRoot {
  data: GetAllPromptsResponse[];
}

export interface GetAllPromptsResponse {
  created_at: string;
  name: string;
  content: string;
  id: number;
}
