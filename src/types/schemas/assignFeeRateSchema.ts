import { z } from 'zod';

export const assignFeeRateSchema = z.object({
  merchant_name: z.string().min(1, 'Merchant Name is required'),
  fee_rate_id: z.preprocess(
    val => {
      if (val === '' || val === null || val === undefined) return 0;
      if (typeof val === 'object') return null;
      if (isNaN(Number(val))) return null;

      return Number(val);
    },
    z.number().min(1, 'Fee Rate is required'),
  ),
});

export type AssignFeeRateFormValues = z.infer<typeof assignFeeRateSchema>;
