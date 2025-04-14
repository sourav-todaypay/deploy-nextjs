import { PaginationRoot } from '@/types/PaginationRoot';

export interface MerchantsPaginatedResponse extends PaginationRoot {
  data: Merchant[];
}

export interface Merchant {
  uuid: string;
  user_uuid?: string;
  crm_id: string;
  corporate_name: string;
  doing_business_as: string;
  website: string;
  employer_identification_number: string;
  approved_at: string;
  current_state: string;
  wallet_id: string;
  Address: Address;
  application_current_status: string;
  bank_provider_reference_uuid: string;
  next_billing_date: string;
  logo: Logo;
  is_blocked: boolean;
  users: Users[];
  account_uuid?: string;
}

export interface Logo {
  file_type: string;
  file_key: string;
  file_name: string;
  category: string;
}

export interface Users {
  account_uuid: string;
  profile_image_url: string;
  ssn: string;
  bank_provider_reference_uuid: string;
  role_id: number;
}

export interface Address {
  line_1: string;
  line_2: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
}

export interface FeeRateDetails {
  id: number;
  name: string;
  description: number;
  flat_rate_in_cents: number;
  percentage_rate: number;
}

export interface Address {
  line_1: string;
  line_2: string;
  country: string;
  state: string;
  zipcode: string;
}

export interface Logo {
  file_type: string;
  file_key: string;
  file_name: string;
  category: string;
}

export interface MerchantAssignPlanRequest {
  merchant_uuid?: string;
  plan_uuid?: string;
  plans?: string;
  merchant_name?: string;
  activate_plan_immediately: boolean;
}

export interface GetUploadTokenQueryParams {
  category:
    | 'LOGO'
    | 'MERCHANT_RESTOCKING_EVIDENCE_FILE'
    | 'BULK_DISBURSEMENT'
    | 'MERCHANT_SPLASH_BANNER';
}

export interface GetUploadTokenSuccessRepsonse {
  upload_token: string;
  category: string;
}

export interface UploadCompanyLogoSuccessResponse {
  status: string;
  message: string;
}

export interface UploadCompanyLogoRequest {
  MerchantUUID: string;
  upload_token: string;
  data: FormData;
}

export interface CancelDisbursementResponse {
  message: string;
}

export interface CancelDisbursementRequest {
  refund_uuid: string;
  note: string;
}
