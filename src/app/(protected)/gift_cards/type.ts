import { PaginationRoot } from '@/types/PaginationRoot';

export interface OffersPaginatedResponse extends PaginationRoot {
  data: Offer[];
}

export interface Offer {
  id: number;
  title: string;
  percent: number | undefined;
  minimum_transaction_amount_in_cents: number;
  maximum_transaction_amount_in_cents: number;
  maximum_offer_amount_in_cents?: number;
  start_date: string;
  end_date: string;
  offer_amount_in_cents: number;
  brand_id?: string[];
  product_id: string[];
  mode: string;
  brands?: string[];
  products?: string[];
  code?: string;
}
