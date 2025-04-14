import { z } from 'zod';

export const setRefundLimitSchema = z.object({
  amount_in_cents: z.preprocess(
    val => (val === '' || val === null ? undefined : val),
    z
      .number({ required_error: 'Refund limit is required' })
      .min(1, 'Min refund amount should be 1'),
  ),
});

export type setRefundLimitFormValues = z.infer<typeof setRefundLimitSchema>;
