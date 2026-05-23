import { Router } from "express";
import { prisma } from "../db.js";
import { getCachedJson, publishEvent, setCachedJson } from "../redis.js";
import { inquirySchema, orderSchema } from "../validation.js";

export const publicRouter = Router();
const allowedCategories = ["OFFICE", "EDUCATIONAL", "ALMIRAH"] as const;
type AllowedCategory = (typeof allowedCategories)[number];

publicRouter.get("/health", (_req, res) => {
  res.json({ ok: true, service: "HEFAI API" });
});

publicRouter.get("/events", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  res.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);

  const { redisSubscriber } = await import("../redis.js");
  const subscriber = redisSubscriber.duplicate();
  await subscriber.connect().catch(() => undefined);
  await subscriber.subscribe("hefai:events");

  subscriber.on("message", (_channel: string, message: string) => {
    res.write(`event: hefai\ndata: ${message}\n\n`);
  });

  const keepAlive = setInterval(() => {
    res.write(`event: ping\ndata: ${JSON.stringify({ at: new Date().toISOString() })}\n\n`);
  }, 25000);

  req.on("close", () => {
    clearInterval(keepAlive);
    subscriber.disconnect();
  });
});

publicRouter.get("/products", async (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const safeCategory = allowedCategories.includes(category as AllowedCategory)
    ? (category as AllowedCategory)
    : undefined;

  const cacheKey = `products:${safeCategory ?? "ALL"}:${q ?? ""}`;
  const cached = await getCachedJson(cacheKey);
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    res.json(cached);
    return;
  }

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(safeCategory ? { category: safeCategory } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { useCase: { contains: q, mode: "insensitive" } }
            ]
          }
        : {})
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
  });

  await setCachedJson(cacheKey, products, 90);
  res.setHeader("X-Cache", "MISS");
  res.json(products);
});

publicRouter.get("/products/:id", async (req, res) => {
  const cacheKey = `product:${req.params.id}`;
  const cached = await getCachedJson(cacheKey);
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    res.json(cached);
    return;
  }

  const product = await prisma.product.findFirst({ where: { id: req.params.id, active: true } });
  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }
  await setCachedJson(cacheKey, product, 120);
  res.setHeader("X-Cache", "MISS");
  res.json(product);
});

publicRouter.post("/orders", async (req, res) => {
  const payload = orderSchema.parse(req.body);
  const ids = payload.items.map((item) => item.productId);
  const products = await prisma.product.findMany({ where: { id: { in: ids }, active: true } });
  const productById = new Map(products.map((product) => [product.id, product]));

  const pricedItems = payload.items.map((item) => {
    const product = productById.get(item.productId);
    if (!product) {
      throw new Error(`Unavailable product: ${item.productId}`);
    }
    return { ...item, unitPrice: product.price };
  });

  const total = pricedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const order = await prisma.order.create({
    data: {
      customerName: payload.customerName,
      email: payload.email,
      phone: payload.phone,
      organization: payload.organization,
      address: payload.address,
      projectName: payload.projectName,
      segment: payload.segment,
      deliveryTimeline: payload.deliveryTimeline,
      budgetRange: payload.budgetRange,
      notes: payload.notes,
      total,
      items: {
        create: pricedItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      }
    },
    include: { customer: true, items: { include: { product: true } } }
  });

  await publishEvent("quote.created", {
    id: order.id,
    organization: order.organization,
    projectName: order.projectName,
    total: order.total
  });

  res.status(201).json(order);
});

publicRouter.post("/inquiries", async (req, res) => {
  const payload = inquirySchema.parse(req.body);
  const inquiry = await prisma.inquiry.create({ data: payload });
  await publishEvent("inquiry.created", { id: inquiry.id, name: inquiry.name, segment: inquiry.segment });
  res.status(201).json(inquiry);
});
