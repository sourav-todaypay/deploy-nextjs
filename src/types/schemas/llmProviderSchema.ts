import { z } from 'zod';

export const llmProviderSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  key: z.string().trim().min(1, 'Key is required'),
  weight: z.preprocess(
    val => (val === '' || val === null ? undefined : val),
    z
      .number({ required_error: 'Weight is required' })
      .min(0, 'Weight is required'),
  ),
  prompt_id: z.preprocess(
    val => {
      if (val === '' || val === null || val === undefined) return 0;
      if (typeof val === 'object') return null;
      if (isNaN(Number(val))) return null;

      return Number(val);
    },
    z.number().min(1, 'Prompt is required'),
  ),
});

export type LlmProviderFormValues = z.infer<typeof llmProviderSchema>;
