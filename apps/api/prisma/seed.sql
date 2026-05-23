INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "createdAt", "updatedAt")
VALUES (
  'admin_hefai_owner',
  'HEFAI Owner',
  'hefai137@gmail.com',
  '$2a$12$BWIWM4TbrfH/IV.W2K.qvOUZEDXKh4uCKS8z6IoJb9Z5J44V09TBu',
  'ADMIN',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "Product" ("id", "sku", "name", "category", "material", "description", "price", "priceRange", "stock", "imageUrl", "featured", "active", "dimensions", "useCase", "createdAt", "updatedAt")
VALUES
('prod_office_desk', 'HF-OFC-101', 'Executive Office Desk', 'OFFICE', 'ENGINEERED_WOOD', 'Spacious workstation with modesty panel, cable routing, and a durable laminate surface for daily office use.', 14500, 'Rs. 12,500 - Rs. 18,500', 18, 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80', true, true, '1500 x 750 x 760 mm', 'Manager cabins, accounts desks, and front office teams', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod_task_chair', 'HF-OFC-132', 'Ergonomic Task Chair', 'OFFICE', 'METAL_WOOD', 'Adjustable chair with breathable back, smooth castors, and firm support for long work sessions.', 6200, 'Rs. 4,800 - Rs. 8,500', 42, 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=1200&q=80', true, true, '650 x 650 x 980 mm', 'Computer labs, offices, reception, and staff rooms', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod_student_bench', 'HF-EDU-210', 'Dual Student Desk Bench', 'EDUCATIONAL', 'METAL_WOOD', 'Two-seater classroom bench desk with powder-coated frame and polished writing top.', 7800, 'Rs. 6,500 - Rs. 10,500', 35, 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80', true, true, '1100 x 760 x 760 mm', 'Schools, coaching centers, training rooms', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod_teacher_table', 'HF-EDU-245', 'Teacher Table with Storage', 'EDUCATIONAL', 'WOOD', 'Compact teacher table with lockable drawer and side cabinet for classroom essentials.', 9800, 'Rs. 8,000 - Rs. 13,500', 14, 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80', false, true, '1200 x 600 x 760 mm', 'Classrooms, labs, libraries, administrative rooms', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod_steel_almirah', 'HF-ALM-310', 'Steel Office Almirah', 'ALMIRAH', 'STEEL', 'Heavy-duty steel almirah with adjustable shelves, secure locking, and anti-rust powder coating.', 16800, 'Rs. 13,500 - Rs. 24,000', 22, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80', true, true, '900 x 450 x 1980 mm', 'Office files, school records, domestic storage', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod_wood_almirah', 'HF-ALM-326', 'Wooden Wardrobe Almirah', 'ALMIRAH', 'WOOD', 'Domestic wooden almirah with hanging space, shelves, and a refined finish for home storage.', 22500, 'Rs. 18,000 - Rs. 34,000', 10, 'https://images.unsplash.com/photo-1616593969747-4797dc75033e?auto=format&fit=crop&w=1200&q=80', false, true, '1050 x 560 x 1980 mm', 'Home storage, hostel rooms, staff quarters', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("sku") DO NOTHING;
