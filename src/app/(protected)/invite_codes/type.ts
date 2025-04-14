import { PaginationRoot } from '@/types/PaginationRoot';

export interface InviteCodesPaginatedResponse extends PaginationRoot {
  data: InviteCode[];
}

export interface InviteCode {
  code: string;
  expires_at: string;
  maximum_use_limit: number;
  generated_by_user_uuid: number;
  custom_code?: string;
  number_of_times_used?: number;
  generated_user_first_name?: string;
  generated_user_last_name?: string;
  status?: string;
}
