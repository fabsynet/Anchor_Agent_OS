export type EmailType = 'birthday_greeting' | 'renewal_reminder' | 'bulk_announcement' | 'digest' | 'cross_sell_campaign';
export type EmailStatus = 'queued' | 'sent' | 'failed';

export interface EmailLog {
  id: string;
  tenantId: string;
  clientId: string | null;
  recipientEmail: string;
  type: EmailType;
  subject: string;
  status: EmailStatus;
  errorMessage: string | null;
  metadata: Record<string, unknown> | null;
  sentAt: string;
  sentById: string | null;
  // Populated relations
  client?: { id: string; firstName: string; lastName: string } | null;
  sentBy?: { id: string; firstName: string; lastName: string } | null;
}

export interface TenantEmailSettings {
  id: string;
  tenantId: string;
  birthdayEmailsEnabled: boolean;
  renewalReminder60Days: boolean;
  renewalReminder30Days: boolean;
  renewalReminder7Days: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BulkEmailPayload {
  subject: string;
  body: string;
  recipientFilter?: 'all' | 'clients_only' | 'leads_only';
}

export interface EmailHistoryQuery {
  page?: number;
  limit?: number;
  type?: EmailType;
  clientId?: string;
}

export interface CrossSellPairing {
  id: string;
  tenantId: string;
  name: string;
  types: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CrossSellCampaign {
  id: string;
  tenantId: string;
  subject: string;
  body: string;
  scheduledAt: string;
  recurring: boolean;
  active: boolean;
  lastRunAt: string | null;
  createdById: string;
  createdAt: string;
}

export interface CrossSellCampaignWithEmails extends CrossSellCampaign {
  emailedCount: number;
  emailedClients: Array<{
    clientId: string;
    clientName: string;
    email: string;
    sentAt: string;
    status: string;
  }>;
}
