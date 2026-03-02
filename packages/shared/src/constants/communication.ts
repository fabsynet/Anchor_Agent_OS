export const EMAIL_TYPES = [
  { value: 'birthday_greeting', label: 'Birthday Greeting' },
  { value: 'renewal_reminder', label: 'Renewal Reminder' },
  { value: 'bulk_announcement', label: 'Announcement' },
  { value: 'digest', label: 'Daily Digest' },
] as const;

export const EMAIL_STATUSES = [
  { value: 'queued', label: 'Queued' },
  { value: 'sent', label: 'Sent' },
  { value: 'failed', label: 'Failed' },
] as const;

export const RENEWAL_REMINDER_INTERVALS = [60, 30, 7] as const;

export const RECIPIENT_FILTERS = [
  { value: 'all', label: 'All Clients & Leads' },
  { value: 'clients_only', label: 'Clients Only' },
  { value: 'leads_only', label: 'Leads Only' },
] as const;
