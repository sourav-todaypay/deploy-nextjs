export interface PaginationQueryParams {
  page: number;
  limit: number;
  from?: string;
  to?: string;
  sort?: 'asc' | 'desc';
  export?: 'csv' | 'pdf' | 'xlsx';
  filter?: string;
  query?: string;
  status?: string;
  user_uuid?: string;
  code?: string;
  category?: string;
  is_active?: boolean;
  min_amount_in_cents?: number;
  brand_id?: string;
}
