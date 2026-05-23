export type ProductCategory = "OFFICE" | "EDUCATIONAL" | "ALMIRAH";

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  material: string;
  description: string;
  price: number;
  priceRange?: string;
  stock: number;
  imageUrl: string;
  featured: boolean;
  active: boolean;
  dimensions: string;
  useCase: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  address: string | null;
  role: string;
};

export type Order = {
  id: string;
  userId?: string;
  customerName: string;
  email: string;
  phone: string;
  organization?: string;
  address: string;
  projectName?: string;
  segment?: string;
  deliveryTimeline?: string;
  budgetRange?: string;
  notes?: string;
  status: string;
  total: number;
  createdAt: string;
  customer?: Customer;
  items: Array<{ id: string; quantity: number; unitPrice: number; product: Product }>;
};

export type Dashboard = {
  metrics: {
    activeProducts: number;
    pendingOrders: number;
    openInquiries: number;
    recentRevenue: number;
  };
  recentOrders: Order[];
  inquiries: Array<{ id: string; name: string; phone: string; requirement: string; segment: string; resolved: boolean }>;
  lowStock: Product[];
};
