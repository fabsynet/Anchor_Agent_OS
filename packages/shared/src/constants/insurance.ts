export const POLICY_TYPES = [
  { value: 'auto', label: 'Auto', icon: 'Car' },
  { value: 'home', label: 'Home', icon: 'Home' },
  { value: 'life', label: 'Life', icon: 'Heart' },
  { value: 'health', label: 'Health', icon: 'Activity' },
  { value: 'commercial', label: 'Commercial', icon: 'Building2' },
  { value: 'travel', label: 'Travel', icon: 'Plane' },
  { value: 'umbrella', label: 'Umbrella', icon: 'Umbrella' },
  { value: 'other', label: 'Other', icon: 'FileText' },
] as const;

export const POLICY_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'secondary' },
  { value: 'active', label: 'Active', color: 'default' },
  { value: 'pending_renewal', label: 'Pending Renewal', color: 'warning' },
  { value: 'renewed', label: 'Renewed', color: 'default' },
  { value: 'expired', label: 'Expired', color: 'destructive' },
  { value: 'cancelled', label: 'Cancelled', color: 'destructive' },
] as const;

export const CANADIAN_PROVINCES = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'YT', label: 'Yukon' },
] as const;

/** Common Canadian insurance carriers for autocomplete/suggestions */
export const COMMON_CARRIERS = [
  'Intact Insurance',
  'Aviva Canada',
  'Desjardins Insurance',
  'The Co-operators',
  'Wawanesa Insurance',
  'Economical Insurance',
  'RSA Canada',
  'Travelers Canada',
  'Zurich Canada',
  'Sun Life',
  'Manulife',
  'Canada Life',
  'Industrial Alliance (iA)',
  'Empire Life',
  'Equitable Life',
  'TD Insurance',
  'RBC Insurance',
  'BMO Insurance',
  'Scotia Life Insurance',
] as const;

export const PAYMENT_FREQUENCIES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi_annual', label: 'Semi-Annual' },
  { value: 'annual', label: 'Annual' },
] as const;
