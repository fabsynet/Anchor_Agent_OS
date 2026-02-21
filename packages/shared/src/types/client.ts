export type ClientStatus = 'lead' | 'client';

/** Full Client record as returned from the API. Dates are ISO strings. */
export interface Client {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  /** ISO date string (YYYY-MM-DD) or null */
  dateOfBirth: string | null;
  status: ClientStatus;
  createdById: string;
  /** ISO datetime string */
  createdAt: string;
  /** ISO datetime string */
  updatedAt: string;
}

/** Lightweight client item for list views (includes computed fields). */
export interface ClientListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: ClientStatus;
  /** Number of policies associated with this client */
  policyCount: number;
  /** ISO date string of the nearest upcoming policy end date, or null */
  nextRenewalDate: string | null;
  /** ISO datetime string */
  createdAt: string;
}
