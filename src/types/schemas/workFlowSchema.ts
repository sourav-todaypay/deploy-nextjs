import { z } from 'zod';

export const workFlowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  transaction_kind: z.string().min(1, 'Transaction kind is required'),
  sub_type: z.string().min(1, 'Transaction sub-type is required'),
  on_status_code: z.union([z.number(), z.nan()]).refine(val => !isNaN(val), {
    message: 'Transaction status is required',
  }),
  data: z
    .string()
    .min(1, 'Data is required')
    .refine(val => {
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    }, 'Invalid JSON format'),

  is_default: z.enum(['true', 'false']),
});

export type WorkFlowFormValues = z.infer<typeof workFlowSchema>;
