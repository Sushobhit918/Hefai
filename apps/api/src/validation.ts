import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const productSchema = z.object({
  sku: z.string().min(3),
  name: z.string().min(3),
  category: z.enum(["OFFICE", "EDUCATIONAL", "ALMIRAH"]),
  material: z.enum(["STEEL", "WOOD", "ENGINEERED_WOOD", "METAL_WOOD", "LAMINATE"]),
  description: z.string().min(20),
  price: z.number().int().nonnegative(),
  priceRange: z.string().min(3).optional(),
  stock: z.number().int().nonnegative(),
  imageUrl: z.string().url(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  dimensions: z.string().min(3),
  useCase: z.string().min(3)
});

export const orderSchema = z.object({
  customerName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  organization: z.string().min(2),
  address: z.string().min(10),
  projectName: z.string().min(2),
  segment: z.string().min(2),
  deliveryTimeline: z.string().min(2),
  budgetRange: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive()
    })
  ).min(1)
});

export const inquirySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  requirement: z.string().min(10),
  segment: z.string().min(3)
});

export const orderStatusSchema = z.object({
  status: z.enum(["NEW", "CONFIRMED", "IN_PROGRESS", "READY", "DELIVERED", "CANCELLED"])
});
