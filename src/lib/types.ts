export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  isAcceptingOrders: boolean;
  estimatedDeliveryMinutes: number;
  minOrderValue: number;
  deliveryFee: number;
  rating?: number;
  ratingCount?: number;
  phone?: string | null;
}

export interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  products: MenuProduct[];
}

export interface MenuProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  listPrice: number | null;
  servingCount: number | null;
  imageUrl: string | null;
  isAvailable: boolean;
  optionGroups: MenuOptionGroup[];
}

export interface MenuOptionGroup {
  id: string;
  name: string;
  minSelections: number;
  maxSelections: number;
  options: MenuOption[];
}

export interface MenuOption {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  priceModifier: number;
}

export interface CartLine {
  lineId: string;
  restaurantId: string;
  restaurantName: string;
  productId: string;
  name: string;
  description?: string;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  selectedOptions: MenuOption[];
  optionsSummary: string;
  customerNote: string;
}

export interface UserAddress {
  id: string;
  street: string;
  number?: string;
  complement?: string;
  referenceNote?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface OrderDetail {
  id: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  paymentMethod?: string;
  items: OrderDetailItem[];
  restaurant: { id: string; name: string; slug: string; logoUrl?: string } | null;
  deliveryAddress: { street: string; streetNumber?: string; complement?: string; neighborhood?: string; city?: string; state?: string } | null;
}

export interface OrderDetailItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type FulfillmentMode = "delivery" | "pickup";
export type PaymentMethod = "cash" | "credit_visa" | "credit_mastercard" | "credit_elo" | "credit_hipercard";
