import { z } from 'zod';

export const sendBulkEmailSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  body: z.string().min(1, 'Message body is required').max(10000, 'Message too long'),
  recipientFilter: z.enum(['all', 'clients_only', 'leads_only']).default('all'),
});
export type SendBulkEmailInput = z.input<typeof sendBulkEmailSchema>;

export const emailSettingsSchema = z.object({
  birthdayEmailsEnabled: z.boolean(),
  renewalReminder60Days: z.boolean(),
  renewalReminder30Days: z.boolean(),
  renewalReminder7Days: z.boolean(),
});
export type EmailSettingsInput = z.input<typeof emailSettingsSchema>;

export const emailHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['birthday_greeting', 'renewal_reminder', 'bulk_announcement', 'digest']).optional(),
  clientId: z.string().uuid().optional(),
});
export type EmailHistoryQueryInput = z.input<typeof emailHistoryQuerySchema>;
