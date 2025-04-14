export interface FailureResponse {
  status: number;
  code: number;
  code_description: string;
  message: string;
  additional_info?: FailureResponseAdditionalInfo;
}

export interface FailureResponseAdditionalInfo {
  errors: FailureResponseError[];
  error: string;
  message: string;
}

export interface FailureResponseError {
  field: string;
  description: string;
}

export interface GenericSuccessResponse {
  message: string;
}
