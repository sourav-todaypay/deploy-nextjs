import { PaginationRoot } from '@/types/PaginationRoot';

export interface BrandCollectionResponse {
  brand_collection: GCBrandsPaginationResponse;
}

export interface GCBrandsPaginationResponse extends PaginationRoot {
  data: Brands[];
}

export interface Brands {
  id: number;
  provider_brand_key: string;
  name: number;
  description: string;
  disclaimer: string;
  short_description: string;
  terms: string;
  images: Image[];
  display_name: string;
  offer_label: string;
  status: boolean;
  is_enabled: boolean;
}

export interface Image {
  url: string;
  type: string;
  dimensions: string;
  brand_id: number;
}

export interface Product {
  id: number;
  uuid: string;
  name: string;
  is_default: boolean;
}
