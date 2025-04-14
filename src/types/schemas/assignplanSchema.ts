import { z } from 'zod';

export const assignPlanSchema = z.object({
  merchant_name: z.string().min(1, 'Merchant Name is required'),
  plan_uuid: z.string().min(1, 'Plan is required'),
  activate_plan_immediately: z.boolean(),
});

export type AssignPlanFormValues = z.infer<typeof assignPlanSchema>;
