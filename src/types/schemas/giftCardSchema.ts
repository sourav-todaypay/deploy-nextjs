import { z } from 'zod';

export const giftCardSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    mode: z.string().min(1, 'Mode is required'),
    percent: z.preprocess(
      val => (val === null ? undefined : val),
      z
        .number()
        .int()
        .min(1, 'Percent must be at least 1')
        .max(100, 'Percent cannot exceed 100')
        .optional(),
    ),
    maximum_offer_amount_in_cents: z.preprocess(
      val => (val === null ? undefined : val),
      z.number().min(0, 'Max Amount is required').optional(),
    ),
    minimum_transaction_amount_in_cents: z.preprocess(
      val => (val === '' || val === null ? undefined : val),
      z.number().min(0, 'Min txn amount is required').nullable(),
    ),
    maximum_transaction_amount_in_cents: z.preprocess(
      val => (val === '' || val === null ? undefined : val),
      z.number().min(0, 'Max txn amount is required').nullable(),
    ),
    brand_id: z
      .array(z.string().min(1, 'Brand cannot be empty'))
      .optional()
      .refine(
        arr => !arr || arr.length === 0 || arr.some(str => str.trim() !== ''),
        {
          message: 'Brand is required',
        },
      ),
    product_id: z
      .array(z.string().min(1, 'Product cannot be empty'))
      .refine(
        arr => !arr || arr.length === 0 || arr.some(str => str.trim() !== ''),
        {
          message: 'Product is required',
        },
      ),
    start_date: z.string().min(1, 'Start Date is required'),
    end_date: z.string().min(1, 'End Date is required'),
  })
  .superRefine((data, ctx) => {
    if (data.mode !== 'COUPON') {
      if (data.percent === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Percent is required for non-coupon mode',
          path: ['percent'],
        });
      }
      if (data.maximum_offer_amount_in_cents === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Max Offer Amount is required for non-coupon mode',
          path: ['maximum_offer_amount_in_cents'],
        });
      }
    }

    if (
      data.minimum_transaction_amount_in_cents !== null &&
      data.maximum_transaction_amount_in_cents !== null &&
      data.minimum_transaction_amount_in_cents >
        data.maximum_transaction_amount_in_cents
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Min amount should be less than max transaction amount',
        path: ['minimum_transaction_amount_in_cents'],
      });
    }

    if (
      data.minimum_transaction_amount_in_cents !== null &&
      data.maximum_transaction_amount_in_cents !== null &&
      data.maximum_transaction_amount_in_cents <
        data.minimum_transaction_amount_in_cents
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Max amount should be more than min transaction amount',
        path: ['maximum_transaction_amount_in_cents'],
      });
    }
  });

export type GiftCardFormValues = z.infer<typeof giftCardSchema>;
