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

export interface OrderItemDto {
  id?: string;
  product?: {
    id?: string;
    title?: string;
    description?: string;
    slug?: string;
    price?: number;
    images?: Array<string | Record<string, any>>;
  };
  name?: string;
  quantity?: number;
  price?: number;
  unitPrice?: number;
  total?: number;
}

export interface OrderDto {
  id: string;
  orderNumber?: string;
  status?: string;
  total?: number;
  createdAt?: string;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  billingProfile?: {
    legalName?: string;
    taxId?: string;
    email?: string;
    phone?: string;
    addressLine1?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  items?: OrderItemDto[];
}
