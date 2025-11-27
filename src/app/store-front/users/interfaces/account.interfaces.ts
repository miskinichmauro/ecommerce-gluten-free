export interface UserProfileDto {
  fullName: string;
  email: string;
  phone?: string;
}

export interface UserAddressDto {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  isDefault: boolean;
}

export interface BillingProfileDto {
  id: string;
  legalName: string;
  taxId: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  isDefault: boolean;
}

export interface OrderDto {
  id: string;
  status?: string;
  total?: number;
  createdAt?: string;
  number?: string;
  items?: Array<{
    name?: string;
    quantity?: number;
    price?: number;
    total?: number;
  }>;
}
