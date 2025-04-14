import { z } from 'zod';

export const merchantD2cSchema = z.object({
  name: z.string().trim().min(1, 'Merchant Name is required'),
  logo_path: z.string().trim().min(1, 'Logo path is required'),
  return_url: z.string().url('Invalid URL format'),
  order_number_regex: z.string().min(1, 'Order Number Regex is required'),
  refund_processing_days: z.preprocess(
    value => {
      return value === '' || value === undefined ? 0 : Number(value);
    },
    z
      .number()
      .min(0, 'Must be a positive integer')
      .max(365, 'Must be less than 365'),
  ),
  additional_data: z.string().refine(val => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, 'Invalid JSON format'),
  action_state: z.string().refine(val => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, 'Invalid JSON format'),
  brand_id: z.preprocess(
    val => {
      if (val === '' || val === null || val === undefined) return 0;
      if (typeof val === 'object') return null;
      if (isNaN(Number(val))) return null;

      return Number(val);
    },
    z.number().min(1, 'Brand is required'),
  ),
  return_policy_link: z.string().trim(),
  is_featured: z.boolean(),
});

export type MerchantD2cFormValues = z.infer<typeof merchantD2cSchema>;
