import dayjs from 'dayjs';
import { z } from 'zod';

export const inviteCodeSchema = (isEditing: boolean) =>
  z.object({
    code: z
      .string()
      .trim()
      .min(1, 'Custom Code is required')
      .refine(val => !isEditing || val.length > 0, {
        message: 'Custom Code cannot be empty.',
      }),

    maximum_use_limit: z.preprocess(
      value =>
        value === '' || value === null || value === undefined
          ? 0
          : Number(value),
      z.number().min(1, 'Limit is required').max(100000, 'Max is 100000'),
    ),

    expires_at: z
      .string()
      .refine(val => dayjs(val, 'YYYY-MM-DD', true).isValid(), {
        message: 'Date is required',
      }),
  });

export type InviteCodeFormValues = z.infer<ReturnType<typeof inviteCodeSchema>>;
