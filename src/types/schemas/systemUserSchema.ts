import { z } from 'zod';

export const systemUserSchema = z.object({
  refund_amount_limit_in_cents: z.preprocess(
    val => (val === '' || val === null ? undefined : val),
    z
      .number({ required_error: 'Refund limit is required' })
      .min(1, 'Min refund amount should be 1'),
  ),
  share_link: z.boolean(),
});

export type systemUserFormValues = z.infer<typeof systemUserSchema>;
