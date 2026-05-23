import type { Dashboard, Order, Product } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const optionHeaders = options.headers instanceof Headers ? Object.fromEntries(options.headers.entries()) : options.headers;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(optionHeaders as Record<string, string> | undefined)
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  eventsUrl: `${API_URL}/events`,
  products: (params = "") => request<Product[]>(`/products${params}`),
  createOrder: (body: unknown) => request<Order>("/orders", { method: "POST", body: JSON.stringify(body) }),
  createInquiry: (body: unknown) => request("/inquiries", { method: "POST", body: JSON.stringify(body) }),
  login: (email: string, password: string) =>
    request<{ token: string; user: { name: string; email: string; role: string } }>("/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
  dashboard: (token: string) => request<Dashboard>("/admin/dashboard", auth(token)),
  adminProducts: (token: string) => request<Product[]>("/admin/products", auth(token)),
  adminOrders: (token: string) => request<Order[]>("/admin/orders", auth(token)),
  updateOrderStatus: (token: string, id: string, status: string) =>
    request<Order>(`/admin/orders/${id}/status`, { ...auth(token), method: "PATCH", body: JSON.stringify({ status }) }),
  upsertProduct: (token: string, product: Partial<Product>) =>
    request<Product>(product.id ? `/admin/products/${product.id}` : "/admin/products", {
      ...auth(token),
      method: product.id ? "PUT" : "POST",
      body: JSON.stringify(product)
    })
};

function auth(token: string): RequestInit {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export function currency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}
