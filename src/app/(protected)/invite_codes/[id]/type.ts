import { PaginationRoot } from '@/types/PaginationRoot';

export interface InviteCodeUserDetailsPaginatedResponse extends PaginationRoot {
  data: InviteCodeUserDetails[];
}

export interface InviteCodeUserDetails {
  claimed_at: string;
  code: string;
  invite_id: number;
  user_uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}
