import { z } from 'zod';

export const invoiceSettlementSchema = z.object({
  utr_number: z.string().trim().min(1, 'UTR Number is required'),
  invoice_number: z.string().optional(),
});

export type InvoiceSettlementFormValues = z.infer<
  typeof invoiceSettlementSchema
>;
