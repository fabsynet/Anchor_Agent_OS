import { z } from 'zod';

export const createPolicySchema = z
  .object({
    type: z.enum([
      'auto',
      'home',
      'life',
      'health',
      'commercial',
      'travel',
      'umbrella',
      'other',
    ]),
    customType: z.string().optional().or(z.literal('')),
    carrier: z.string().optional().or(z.literal('')),
    policyNumber: z.string().optional().or(z.literal('')),
    startDate: z.string().optional().or(z.literal('')),
    endDate: z.string().optional().or(z.literal('')),
    /** Decimal as string, e.g. "1250.00" -- parsed by backend */
    premium: z.string().optional().or(z.literal('')),
    /** Decimal as string */
    coverageAmount: z.string().optional().or(z.literal('')),
    /** Decimal as string */
    deductible: z.string().optional().or(z.literal('')),
    paymentFrequency: z
      .enum(['monthly', 'quarterly', 'semi_annual', 'annual'])
      .optional(),
    /** Decimal as string, percentage e.g. "15.00" */
    brokerCommission: z.string().optional().or(z.literal('')),
    status: z
      .enum([
        'draft',
        'active',
        'pending_renewal',
        'renewed',
        'expired',
        'cancelled',
      ])
      .default('draft'),
    notes: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.type === 'other') {
        return !!(data.customType && data.customType.trim().length > 0);
      }
      return true;
    },
    {
      message: 'Custom type is required when policy type is "other"',
      path: ['customType'],
    },
  );

export const updatePolicySchema = z.object({
  type: z
    .enum([
      'auto',
      'home',
      'life',
      'health',
      'commercial',
      'travel',
      'umbrella',
      'other',
    ])
    .optional(),
  customType: z.string().optional().or(z.literal('')),
  carrier: z.string().optional().or(z.literal('')),
  policyNumber: z.string().optional().or(z.literal('')),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
  premium: z.string().optional().or(z.literal('')),
  coverageAmount: z.string().optional().or(z.literal('')),
  deductible: z.string().optional().or(z.literal('')),
  paymentFrequency: z
    .enum(['monthly', 'quarterly', 'semi_annual', 'annual'])
    .optional(),
  brokerCommission: z.string().optional().or(z.literal('')),
  status: z
    .enum([
      'draft',
      'active',
      'pending_renewal',
      'renewed',
      'expired',
      'cancelled',
    ])
    .optional(),
  notes: z.string().optional().or(z.literal('')),
});

export type CreatePolicyInput = z.infer<typeof createPolicySchema>;
export type UpdatePolicyInput = z.infer<typeof updatePolicySchema>;
