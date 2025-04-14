import { z } from 'zod';

export const promptsSchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  content: z.string().trim().min(1, 'content is required'),
});

export type PromptsFormValues = z.infer<typeof promptsSchema>;
