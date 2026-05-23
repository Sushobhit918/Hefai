import bcrypt from "bcryptjs";
import { Router } from "express";
import { signToken, requireAdmin } from "../auth.js";
import { prisma } from "../db.js";
import { deleteByPattern, publishEvent } from "../redis.js";
import { loginSchema, orderStatusSchema, productSchema } from "../validation.js";

export const adminRouter = Router();

adminRouter.post("/auth/login", async (req, res) => {
  const payload = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  const passwordOk = user ? await bcrypt.compare(payload.password, user.passwordHash) : false;

  if (!user || !passwordOk || !["ADMIN", "STAFF"].includes(user.role)) {
    res.status(401).json({ message: "Invalid owner credentials" });
    return;
  }

  res.json({
    token: signToken({ id: user.id, email: user.email, role: user.role }),
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

adminRouter.use(requireAdmin);

adminRouter.get("/dashboard", async (_req, res) => {
  const [orders, products, inquiries, lowStock] = await Promise.all([
    prisma.order.findMany({
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    prisma.product.findMany(),
    prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.product.findMany({ where: { stock: { lte: 12 }, active: true }, orderBy: { stock: "asc" } })
  ]);

  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  res.json({
    metrics: {
      activeProducts: products.filter((product) => product.active).length,
      pendingOrders: orders.filter((order) => !["DELIVERED", "CANCELLED"].includes(order.status)).length,
      openInquiries: inquiries.filter((inquiry) => !inquiry.resolved).length,
      recentRevenue: revenue
    },
    recentOrders: orders,
    inquiries,
    lowStock
  });
});

adminRouter.get("/products", async (_req, res) => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  res.json(products);
});

adminRouter.post("/products", async (req, res) => {
  const payload = productSchema.parse(req.body);
  const product = await prisma.product.create({ data: payload });
  await deleteByPattern("products:*");
  await publishEvent("product.created", { id: product.id, name: product.name });
  res.status(201).json(product);
});

adminRouter.put("/products/:id", async (req, res) => {
  const payload = productSchema.partial().parse(req.body);
  const product = await prisma.product.update({ where: { id: req.params.id }, data: payload });
  await Promise.all([deleteByPattern("products:*"), deleteByPattern(`product:${product.id}`)]);
  await publishEvent("product.updated", { id: product.id, name: product.name });
  res.json(product);
});

adminRouter.delete("/products/:id", async (req, res) => {
  await prisma.product.update({ where: { id: req.params.id }, data: { active: false } });
  await Promise.all([deleteByPattern("products:*"), deleteByPattern(`product:${req.params.id}`)]);
  await publishEvent("product.archived", { id: req.params.id });
  res.status(204).send();
});

adminRouter.get("/orders", async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: { customer: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" }
  });
  res.json(orders);
});

adminRouter.patch("/orders/:id/status", async (req, res) => {
  const payload = orderStatusSchema.parse(req.body);
  const order = await prisma.order.update({ where: { id: req.params.id }, data: { status: payload.status } });
  await publishEvent("quote.status.updated", { id: order.id, status: order.status });
  res.json(order);
});

adminRouter.get("/inquiries", async (_req, res) => {
  const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: "desc" } });
  res.json(inquiries);
});

adminRouter.patch("/inquiries/:id/resolve", async (req, res) => {
  const inquiry = await prisma.inquiry.update({
    where: { id: req.params.id },
    data: { resolved: Boolean(req.body.resolved) }
  });
  await publishEvent("inquiry.updated", { id: inquiry.id, resolved: inquiry.resolved });
  res.json(inquiry);
});
