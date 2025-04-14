import { PaginationRoot } from '@/types/PaginationRoot';

export interface getD2cOrdersListPaginatedResponse extends PaginationRoot {
  data: ListOrders[];
}

export interface ListOrders {
  uuid: string;
  email: string;
  phone_number: string;
  created_at: string;
  checkout_id: string;
}
