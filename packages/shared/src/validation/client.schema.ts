import { z } from 'zod';

export const createClientSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    status: z.enum(['lead', 'client']).default('lead'),
    address: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    province: z.string().optional().or(z.literal('')),
    postalCode: z.string().optional().or(z.literal('')),
    dateOfBirth: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.status === 'lead') {
        return !!(data.email || data.phone);
      }
      return true;
    },
    { message: 'Lead requires at least email or phone', path: ['email'] },
  );

export const updateClientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  status: z.enum(['lead', 'client']).optional(),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  province: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
