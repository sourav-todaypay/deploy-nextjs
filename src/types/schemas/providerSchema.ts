import { z } from 'zod';

export const providerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  config: z.string().refine(val => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, 'Invalid JSON format'),
  weight: z.preprocess(
    val => (val === '' || val === null ? 0 : val),
    z.number().min(1, 'Weight should be more than 0').nullable(),
  ),
});

export type ProviderFormValues = z.infer<typeof providerSchema>;
