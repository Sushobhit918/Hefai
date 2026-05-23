import bcrypt from "bcryptjs";
import { PrismaClient, ProductCategory, Material, Role } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    sku: "HF-OFC-101",
    name: "Executive Office Desk",
    category: ProductCategory.OFFICE,
    material: Material.ENGINEERED_WOOD,
    description: "Spacious workstation with modesty panel, cable routing, and a durable laminate surface for daily office use.",
    price: 14500,
    priceRange: "Rs. 12,500 - Rs. 18,500",
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    dimensions: "1500 x 750 x 760 mm",
    useCase: "Manager cabins, accounts desks, and front office teams"
  },
  {
    sku: "HF-OFC-132",
    name: "Ergonomic Task Chair",
    category: ProductCategory.OFFICE,
    material: Material.METAL_WOOD,
    description: "Adjustable chair with breathable back, smooth castors, and firm support for long work sessions.",
    price: 6200,
    priceRange: "Rs. 4,800 - Rs. 8,500",
    stock: 42,
    imageUrl: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    dimensions: "650 x 650 x 980 mm",
    useCase: "Computer labs, offices, reception, and staff rooms"
  },
  {
    sku: "HF-EDU-210",
    name: "Dual Student Desk Bench",
    category: ProductCategory.EDUCATIONAL,
    material: Material.METAL_WOOD,
    description: "Two-seater classroom bench desk with powder-coated frame and polished writing top.",
    price: 7800,
    priceRange: "Rs. 6,500 - Rs. 10,500",
    stock: 35,
    imageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    dimensions: "1100 x 760 x 760 mm",
    useCase: "Schools, coaching centers, training rooms"
  },
  {
    sku: "HF-EDU-245",
    name: "Teacher Table with Storage",
    category: ProductCategory.EDUCATIONAL,
    material: Material.WOOD,
    description: "Compact teacher table with lockable drawer and side cabinet for classroom essentials.",
    price: 9800,
    priceRange: "Rs. 8,000 - Rs. 13,500",
    stock: 14,
    imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    dimensions: "1200 x 600 x 760 mm",
    useCase: "Classrooms, labs, libraries, administrative rooms"
  },
  {
    sku: "HF-ALM-310",
    name: "Steel Office Almirah",
    category: ProductCategory.ALMIRAH,
    material: Material.STEEL,
    description: "Heavy-duty steel almirah with adjustable shelves, secure locking, and anti-rust powder coating.",
    price: 16800,
    priceRange: "Rs. 13,500 - Rs. 24,000",
    stock: 22,
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    dimensions: "900 x 450 x 1980 mm",
    useCase: "Office files, school records, domestic storage"
  },
  {
    sku: "HF-ALM-326",
    name: "Wooden Wardrobe Almirah",
    category: ProductCategory.ALMIRAH,
    material: Material.WOOD,
    description: "Domestic wooden almirah with hanging space, shelves, and a refined finish for home storage.",
    price: 22500,
    priceRange: "Rs. 18,000 - Rs. 34,000",
    stock: 10,
    imageUrl: "https://images.unsplash.com/photo-1616593969747-4797dc75033e?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    dimensions: "1050 x 560 x 1980 mm",
    useCase: "Home storage, hostel rooms, staff quarters"
  }
];

async function main() {
  await prisma.user.upsert({
    where: { email: "hefai137@gmail.com" },
    update: {},
    create: {
      name: "HEFAI Owner",
      email: "hefai137@gmail.com",
      passwordHash: await bcrypt.hash("Admin@12345", 12),
      role: Role.ADMIN
    }
  });

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
