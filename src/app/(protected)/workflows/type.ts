import { PaginationRoot } from '@/types/PaginationRoot';

export interface WorkFlowPaginatedResponse extends PaginationRoot {
  data: WorkFlow[];
}

export interface WorkFlow {
  sub_type: string;
  on_status_code: number;
  is_default: boolean | 'true' | 'false' | undefined;
  name: string;
  data: string;
  transaction_kind: string;
}
