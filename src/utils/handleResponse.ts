import { FailureResponse } from '@/types/FailureResponse';

export const handleResponse = async <T>(
  promise: Promise<{ status: number; data: T }>,
): Promise<T> => {
  const response = await promise;

  if (response.status < 200 || response.status > 300) {
    if (
      typeof response.data === 'object' &&
      response.data !== null &&
      'message' in response.data
    ) {
      throw response.data as unknown as FailureResponse;
    }

    throw new Error('Unexpected API error');
  }

  return response.data;
};
