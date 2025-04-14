import { FailureResponse } from '@/types/FailureResponse';

export const isFailureResponse = (error: unknown): error is FailureResponse => {
  return typeof error === 'object' && error !== null && 'message' in error;
};
