import { z } from 'zod';

export const rulesSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  provider_id: z.preprocess(
    val => {
      if (val === '' || val === null || val === undefined) return 0;
      if (typeof val === 'object') return null;
      if (isNaN(Number(val))) return null;

      return Number(val);
    },
    z.number().min(1, 'Provider is required'),
  ),
  rule: z.preprocess(
    val => {
      if (val === '' || val === null || val === undefined) return '';
      return val;
    },
    z.string().min(1, 'Rule is required'),
  ),

  amount_in_cents: z.preprocess(
    val => (val === '' || val === null ? undefined : val),
    z
      .number({ required_error: 'Amount is required' })
      .min(0.01, 'Amount should be more than 0')
      .nullable(),
  ),
  weight: z.preprocess(
    val => (val === '' || val === null ? undefined : val),
    z
      .number({ required_error: 'Weight is required' })
      .min(1, 'Weight should be more than 0')
      .nullable(),
  ),
});

export type RulesFormValues = z.infer<typeof rulesSchema>;
