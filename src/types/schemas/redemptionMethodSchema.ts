import { z } from 'zod';

export const redemptionMethodSchema = z.object({
  title: z.string().trim().min(1, 'title is required'),
  settlement_time: z.string().trim().min(1, 'Settlement time is required'),
  fee_rate_id: z.preprocess(val => {
    if (val === '' || val === null || val === undefined) return null;
    if (typeof val === 'object') return null;
    if (isNaN(Number(val))) return null;

    return Number(val);
  }, z.number().min(1, 'Fee Rate is required').nullable()),
});

export type RedemptionMethodFormValues = z.infer<typeof redemptionMethodSchema>;
