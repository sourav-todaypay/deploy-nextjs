import { z } from 'zod';

export const planSchema = z
  .object({
    plan_name: z.string().min(1, 'Plan Name is required'),
    type: z.enum(['INVOICING', 'PREPAID'], {
      errorMap: () => ({ message: 'Mode is required' }),
    }),
    settlement_cycle_in_days: z.coerce
      .number()
      .min(1, 'Minimum settlement cycle is 1')
      .max(365, 'Maximum settlement cycle is 365')
      .optional(),
    credit_in_cents: z.coerce
      .number()
      .min(0, 'Minimum credit allowed is 0')
      .max(1_000_000, 'Maximum credit allowed is 1,000,000')
      .optional()
      .or(z.literal(undefined)),
    minimum_balance_in_cents: z.preprocess(val => {
      if (val === undefined || val === '' || val === '-') return null;
      if (typeof val === 'string') return Number(val);
      return val;
    }, z.number().nullable()),
  })
  .superRefine((data, ctx) => {
    const {
      minimum_balance_in_cents,
      credit_in_cents,
      type,
      settlement_cycle_in_days,
    } = data;

    if (type === 'INVOICING') {
      if (settlement_cycle_in_days === undefined) {
        ctx.addIssue({
          path: ['settlement_cycle_in_days'],
          message: 'Settlement cycle is required',
          code: z.ZodIssueCode.custom,
        });
      }
      if (credit_in_cents === undefined) {
        ctx.addIssue({
          path: ['credit_in_cents'],
          message: 'Credit is required',
          code: z.ZodIssueCode.custom,
        });
      }
      if (
        minimum_balance_in_cents === null ||
        minimum_balance_in_cents === undefined ||
        minimum_balance_in_cents >= 0
      ) {
        ctx.addIssue({
          path: ['minimum_balance_in_cents'],
          message: 'Min balance should be negative',
          code: z.ZodIssueCode.custom,
        });
      }
    }

    if (type === 'PREPAID') {
      if (
        minimum_balance_in_cents === null ||
        minimum_balance_in_cents === undefined ||
        minimum_balance_in_cents <= 0
      ) {
        ctx.addIssue({
          path: ['minimum_balance_in_cents'],
          message: 'Min balance should be positive',
          code: z.ZodIssueCode.custom,
        });
      }
    }

    if (
      type === 'INVOICING' &&
      minimum_balance_in_cents !== undefined &&
      credit_in_cents !== undefined &&
      Math.abs(minimum_balance_in_cents!) > credit_in_cents!
    ) {
      ctx.addIssue({
        path: ['credit_in_cents'],
        message:
          'Credit amount must be greater than or equal to minimum balance',
        code: z.ZodIssueCode.custom,
      });
    }
  });

export type PlanFormValues = z.infer<typeof planSchema>;
