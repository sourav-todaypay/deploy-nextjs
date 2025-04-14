import { z } from 'zod';

export const cancleDisbursementSchema = z.object({
  note: z.string().trim().max(25, 'Upto 25 characters are allowed').optional(),
});

export type CancleDisbursementFormValues = z.infer<
  typeof cancleDisbursementSchema
>;
