import { z } from 'zod';
import { customerFeeRateTypes, merchantFeeRateTypes } from '../feeRate';

export const feeRateSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    description: z.string(),
    flat_rate_in_cents: z.preprocess(
      value => {
        return value === '' || value === undefined ? 0 : Number(value);
      },
      z.number().min(0, 'Fee Flat Rate is required'),
    ),
    percentage_rate: z.preprocess(
      value => {
        return value === '' || value === undefined ? 0 : Number(value);
      },
      z.number().min(0, 'Percentage is required').max(100, 'Max is 100'),
    ),
    entity: z.enum(['CUSTOMER', 'MERCHANT'], {
      errorMap: () => ({ message: 'Entity is required' }),
    }),
    type: z.string().min(1, 'Type is required'),
  })
  .refine(
    data => {
      if (data.entity === 'CUSTOMER') {
        return customerFeeRateTypes.some(t => t.value === data.type);
      }
      if (data.entity === 'MERCHANT') {
        return merchantFeeRateTypes.some(t => t.value === data.type);
      }
      return false;
    },
    {
      message: 'Invalid type for selected entity',
      path: ['type'],
    },
  );

export type FeeRateFormValues = z.infer<typeof feeRateSchema>;
