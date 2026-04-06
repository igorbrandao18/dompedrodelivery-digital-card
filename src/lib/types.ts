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
