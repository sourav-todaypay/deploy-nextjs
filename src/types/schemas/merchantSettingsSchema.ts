import { z } from 'zod';

export const merchantSettingsSchema = z
  .object({
    merchant_name: z.string().trim().min(1, 'Merchant name is required'),
    delayed_by: z.preprocess(value => {
      return value === '' || value === undefined ? undefined : Number(value);
    }, z.number().min(0, 'Disbursement Batch Delay is required').max(1000000, 'Max is 100000 min').optional()),
    minimum_refund_amount_in_cents: z.preprocess(
      val => (val === '' || val === null ? undefined : val),
      z.number().nullable().optional(),
    ),
    maximum_refund_amount_in_cents: z.preprocess(
      val => (val === '' || val === null ? undefined : val),
      z.number().nullable().optional(),
    ),
    sftp_value: z.boolean(),
    notification_value: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (
      data.minimum_refund_amount_in_cents !== undefined &&
      data.maximum_refund_amount_in_cents !== undefined &&
      data.minimum_refund_amount_in_cents! >
        data.maximum_refund_amount_in_cents!
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Min amount should be less than max transaction amount',
        path: ['minimum_refund_amount_in_cents'],
      });
    }

    if (
      data.minimum_refund_amount_in_cents !== undefined &&
      data.maximum_refund_amount_in_cents !== undefined &&
      data.maximum_refund_amount_in_cents! <
        data.minimum_refund_amount_in_cents!
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Max amount should be more than min transaction amount',
        path: ['maximum_refund_amount_in_cents'],
      });
    }
  });

export type MerchantSettingsFormValues = z.infer<typeof merchantSettingsSchema>;
