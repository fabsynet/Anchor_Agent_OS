export interface Tenant {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  province: string | null;
  createdAt: Date;
  updatedAt: Date;
}
