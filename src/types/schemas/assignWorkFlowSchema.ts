import { z } from 'zod';

export const assignWorkFlowSchema = z.object({
  merchant_name: z.string().min(1, 'Merchant Name is required'),
  name: z.string().min(1, 'WorkFlow is required'),
});

export type AssignWorkFlowFormValues = z.infer<typeof assignWorkFlowSchema>;
