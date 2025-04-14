import { z } from 'zod';

export const paymentPlanSchema = z
  .object({
    name: z.string().trim().min(1, 'Plan name is required'),
    internal_name: z.string().trim().min(1, 'Internal name is required'),

    plan_validity_in_days: z.preprocess(
      val => (val === '' || val === null ? undefined : val),
      z
        .number({ required_error: 'Plan validity is required' })
        .min(0, 'Plan validity is required'),
    ),

    number_of_installments: z.preprocess(
      val => (val === '' || val === null ? undefined : val),
      z
        .number({ required_error: 'No. of installments is required' })
        .min(0, 'No. of installments is required'),
    ),

    frequency_in_days: z.preprocess(
      val => (val === '' || val === null ? undefined : val),
      z
        .number({ required_error: 'Frequency in days is required' })
        .min(0, 'Frequency in days is required'),
    ),

    percentage_per_installment: z.preprocess(
      val => (val === '' || val === null ? undefined : val),
      z
        .number({ required_error: 'Percentage per installment is required' })
        .min(0.0, 'Percentage per installment is required')
        .max(100, 'Max is 100'),
    ),

    fees_in_cents: z.preprocess(
      val => (val === '' || val === null ? undefined : val),
      z
        .number({ required_error: 'Fee flat rate is required' })
        .min(0, 'Fee flat rate is required'),
    ),

    is_active: z.enum(['true', 'false'], {
      required_error: 'Activation status is required',
    }),

    minimum_transaction_amount_in_cents: z.preprocess(
      val => (val === '' || val === null ? undefined : val),
      z
        .number({ required_error: 'Min txn amount is required' })
        .min(0, 'Min txn amount is required'),
    ),
    maximum_transaction_amount_in_cents: z.preprocess(
      val => (val === '' || val === null ? undefined : val),
      z
        .number({ required_error: 'Max txn amount is required' })
        .min(0, 'Max txn amount is required'),
    ),
  })
  .refine(
    data =>
      data.minimum_transaction_amount_in_cents === null ||
      data.maximum_transaction_amount_in_cents === null ||
      data.minimum_transaction_amount_in_cents <=
        data.maximum_transaction_amount_in_cents,
    {
      message: 'Min amount should be less than max transaction amount',
      path: ['minimum_transaction_amount_in_cents'],
    },
  )
  .refine(
    data =>
      data.minimum_transaction_amount_in_cents === null ||
      data.maximum_transaction_amount_in_cents === null ||
      data.maximum_transaction_amount_in_cents >=
        data.minimum_transaction_amount_in_cents,
    {
      message: 'Max amount should be more than min transaction amount',
      path: ['maximum_transaction_amount_in_cents'],
    },
  );

export type PaymentPlanFormValues = z.infer<typeof paymentPlanSchema>;
