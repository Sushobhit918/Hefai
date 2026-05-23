import { useEffect, useState } from "react";
import {
  Armchair,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  FileText,
  Lock,
  PackagePlus,
  MapPin,
  Search,
  ShoppingBag,
  Warehouse
} from "lucide-react";
import { api, currency } from "./api";
import type { CartItem, Dashboard, Order, Product, ProductCategory } from "./types";

const categories: Array<{ id: "ALL" | ProductCategory; label: string; icon: typeof BriefcaseBusiness }> = [
  { id: "ALL", label: "All quotation items", icon: Warehouse },
  { id: "OFFICE", label: "Office furniture", icon: BriefcaseBusiness },
  { id: "EDUCATIONAL", label: "Educational furniture", icon: BookOpen },
  { id: "ALMIRAH", label: "Steel and wooden almirah", icon: Armchair }
];

const emptyProduct = {
  sku: "",
  name: "",
  category: "OFFICE",
  material: "ENGINEERED_WOOD",
  description: "",
  price: 0,
  priceRange: "",
  stock: 0,
  imageUrl: "",
  featured: false,
  active: true,
  dimensions: "",
  useCase: ""
} satisfies Partial<Product>;

export function App() {
  const [mode, setMode] = useState<"store" | "admin">("store");

  return (
    <div>
      <header className="topbar">
        <div className="brand">
          <img className="brand-logo" src="/hefai-logo.jpg" alt="HEFAI logo" />
          <div>
            <strong>HEFAI</strong>
            <span>A unit by Haryana Furniture</span>
          </div>
        </div>
        <nav>
          <button className={mode === "store" ? "active" : ""} onClick={() => setMode("store")}>
            <FileText size={18} /> Customer quotation portal
          </button>
          <button className={mode === "admin" ? "active" : ""} onClick={() => setMode("admin")}>
            <Lock size={18} /> Owner system
          </button>
        </nav>
      </header>

      {mode === "store" ? <CustomerPortal /> : <AdminSystem />}
    </div>
  );
}

function CustomerPortal() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<"ALL" | ProductCategory>("ALL");
  const [query, setQuery] = useState("");
  const [basket, setBasket] = useState<CartItem[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "ALL") params.set("category", category);
    if (query) params.set("q", query);
    api.products(params.toString() ? `?${params}` : "").then(setProducts).catch((error) => setNotice(error.message));
  }, [category, query]);

  useEffect(() => {
    const stream = new EventSource(api.eventsUrl);
    stream.addEventListener("hefai", (event) => {
      const message = JSON.parse((event as MessageEvent).data) as { type: string };
      if (message.type.startsWith("product.")) {
        const params = new URLSearchParams();
        if (category !== "ALL") params.set("category", category);
        if (query) params.set("q", query);
        api.products(params.toString() ? `?${params}` : "").then(setProducts).catch(() => undefined);
      }
    });
    return () => stream.close();
  }, [category, query]);

  function addToBasket(product: Product) {
    setBasket((items) => {
      const existing = items.find((item) => item.product.id === product.id);
      if (existing) {
        return items.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...items, { product, quantity: 1 }];
    });
    setNotice(`${product.name} added to quotation request`);
  }

  const featured = products.filter((product) => product.featured).slice(0, 3);

  return (
    <main>
      <section className="hero professional-hero">
        <div className="hero-copy">
          <span className="eyebrow"><ClipboardList size={16} /> Institutional quotation desk</span>
          <h1>HEFAI</h1>
          <p>
            Request office, school, college, coaching, and almirah furniture quotations with project details,
            delivery expectations, and quantity requirements.
          </p>
          <div className="value-strip">
            <span>Bulk quotation review</span>
            <span>Organization-ready records</span>
            <span>Owner follow-up workflow</span>
          </div>
        </div>
        <FirmInfo />
      </section>

      <section className="toolbar">
        <div className="search">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search workstation, classroom bench, chair, almirah" />
        </div>
        <div className="segments">
          {categories.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={category === item.id ? "selected" : ""} onClick={() => setCategory(item.id)}>
                <Icon size={17} /> {item.label}
              </button>
            );
          })}
        </div>
      </section>

      {notice && <div className="notice"><CheckCircle2 size={18} /> {notice}</div>}

      <section className="split">
        <div>
          <h2>Recommended for quotation</h2>
          <div className="feature-grid">
            {featured.map((product) => <ProductCard key={product.id} product={product} onAdd={addToBasket} featured />)}
          </div>
          <h2>Quotation catalog</h2>
          <div className="product-grid">
            {products.map((product) => <ProductCard key={product.id} product={product} onAdd={addToBasket} />)}
          </div>
        </div>
        <QuotePanel
          basket={basket}
          setBasket={setBasket}
          setNotice={setNotice}
        />
      </section>
    </main>
  );
}

function FirmInfo() {
  return (
    <aside className="access-panel">
      <span className="eyebrow"><MapPin size={16} /> Firm address</span>
      <h2>Haryana Furniture</h2>
      <p>Plot number 137, Industrial Estate, Phase 2, Panchkula</p>
      <dl>
        <div><dt>Quotation model</dt><dd>Submit requirements directly without account creation.</dd></div>
        <div><dt>Best for</dt><dd>Schools, offices, institutions, and almirah requirements.</dd></div>
      </dl>
    </aside>
  );
}

function ProductCard({ product, onAdd, featured = false }: { product: Product; onAdd: (product: Product) => void; featured?: boolean }) {
  return (
    <article className={featured ? "product-card featured" : "product-card"}>
      <img src={product.imageUrl} alt={product.name} />
      <div className="product-body">
        <div className="row">
          <span className="tag">{product.category.replace("_", " ")}</span>
          <span className="stock">{product.stock} available</span>
        </div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <dl>
          <div><dt>Size</dt><dd>{product.dimensions}</dd></div>
          <div><dt>Best for</dt><dd>{product.useCase}</dd></div>
        </dl>
        <div className="card-actions">
          <strong>{product.priceRange || "Quotation range on request"}</strong>
          <button onClick={() => onAdd(product)}><ShoppingBag size={17} /> Add to quote</button>
        </div>
      </div>
    </article>
  );
}

function QuotePanel({
  basket,
  setBasket,
  setNotice
}: {
  basket: CartItem[];
  setBasket: (items: CartItem[]) => void;
  setNotice: (value: string) => void;
}) {
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    organization: "",
    address: "",
    projectName: "",
    segment: "Office",
    deliveryTimeline: "Within 2-4 weeks",
    budgetRange: "",
    notes: ""
  });

  async function submit() {
    const order = await api.createOrder({
      ...form,
      items: basket.map((item) => ({ productId: item.product.id, quantity: item.quantity }))
    });
    setBasket([]);
    setNotice(`Quotation ${order.id.slice(-6).toUpperCase()} submitted for admin review.`);
  }

  return (
    <aside className="cart-panel">
      <h2><ClipboardList size={20} /> Quote request</h2>
      {basket.length === 0 ? <p className="muted">Select products and quantities, then submit a formal quotation request.</p> : null}
      {basket.map((item) => (
        <div className="cart-line" key={item.product.id}>
          <span>{item.product.name}</span>
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(event) => setBasket(basket.map((line) => line.product.id === item.product.id ? { ...line, quantity: Number(event.target.value) } : line))}
          />
        </div>
      ))}
      <p className="quote-range-note">Final quotation will be prepared after reviewing size, material, finish, quantity, delivery, and installation requirements.</p>
      <div className="form-grid">
        <input placeholder="Customer name" value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} />
        <input placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        <input placeholder="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        <input placeholder="Organization / Institution" value={form.organization} onChange={(event) => setForm({ ...form, organization: event.target.value })} />
        <input placeholder="Billing / delivery address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
        <input placeholder="Project / requirement title" value={form.projectName} onChange={(event) => setForm({ ...form, projectName: event.target.value })} />
        <select value={form.segment} onChange={(event) => setForm({ ...form, segment: event.target.value })}>
          <option>Office</option>
          <option>School</option>
          <option>College</option>
          <option>Coaching center</option>
          <option>Domestic almirah</option>
          <option>Government / tender</option>
        </select>
        <input placeholder="Delivery timeline" value={form.deliveryTimeline} onChange={(event) => setForm({ ...form, deliveryTimeline: event.target.value })} />
        <input placeholder="Budget range, if any" value={form.budgetRange} onChange={(event) => setForm({ ...form, budgetRange: event.target.value })} />
        <input placeholder="Material, color, delivery, installation, or billing notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
      </div>
      <button className="primary" disabled={!basket.length} onClick={() => submit().catch((error) => setNotice(error.message))}>
        <FileText size={18} /> Submit quotation
      </button>
    </aside>
  );
}

function AdminSystem() {
  const [token, setToken] = useState(localStorage.getItem("hefai_token") ?? "");
  const [email, setEmail] = useState("hefai137@gmail.com");
  const [password, setPassword] = useState("Admin@12345");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productForm, setProductForm] = useState<Partial<Product>>(emptyProduct);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    Promise.all([api.dashboard(token), api.adminProducts(token), api.adminOrders(token)])
      .then(([dash, productList, orderList]) => {
        setDashboard(dash);
        setProducts(productList);
        setOrders(orderList);
      })
      .catch((error) => setMessage(error.message));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const stream = new EventSource(api.eventsUrl);
    stream.addEventListener("hefai", (event) => {
      const message = JSON.parse((event as MessageEvent).data) as { type: string };
      if (["quote.created", "quote.status.updated", "product.created", "product.updated", "product.archived", "inquiry.created"].includes(message.type)) {
        Promise.all([api.dashboard(token), api.adminProducts(token), api.adminOrders(token)])
          .then(([dash, productList, orderList]) => {
            setDashboard(dash);
            setProducts(productList);
            setOrders(orderList);
          })
          .catch(() => undefined);
      }
    });
    return () => stream.close();
  }, [token]);

  async function login() {
    const result = await api.login(email, password);
    localStorage.setItem("hefai_token", result.token);
    setToken(result.token);
    setMessage(`Welcome, ${result.user.name}`);
  }

  async function saveProduct() {
    const saved = await api.upsertProduct(token, {
      ...productForm,
      price: Number(productForm.price),
      priceRange: productForm.priceRange?.trim() || undefined,
      stock: Number(productForm.stock)
    });
    setProducts([saved, ...products.filter((product) => product.id !== saved.id)]);
    setProductForm(emptyProduct);
    setMessage("Product saved");
  }

  if (!token) {
    return (
      <main className="admin-login">
        <section>
          <span className="eyebrow"><Lock size={16} /> Owner access</span>
          <h1>HEFAI admin system</h1>
          <p>Manage quotation requests, customer details, catalog, stock, and operational follow-up.</p>
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" />
          <button className="primary" onClick={() => login().catch((error) => setMessage(error.message))}><Lock size={18} /> Login</button>
          {message && <p className="muted">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="admin">
      <section className="admin-head">
        <div>
          <span className="eyebrow"><BarChart3 size={16} /> Owner operations</span>
          <h1>Quotation command center</h1>
        </div>
        <button onClick={() => { localStorage.removeItem("hefai_token"); setToken(""); }}>Logout</button>
      </section>

      {message && <div className="notice"><CheckCircle2 size={18} /> {message}</div>}

      <section className="metrics">
        <Metric label="Active products" value={dashboard?.metrics.activeProducts ?? 0} />
        <Metric label="Open quotations" value={dashboard?.metrics.pendingOrders ?? 0} />
        <Metric label="Open inquiries" value={dashboard?.metrics.openInquiries ?? 0} />
        <Metric label="Quoted value" value={currency(dashboard?.metrics.recentRevenue ?? 0)} />
      </section>

      <section className="admin-grid">
        <div className="panel">
          <h2><ClipboardList size={20} /> Customer quotations</h2>
          <div className="quote-list">
            {orders.map((order) => (
              <AdminQuoteCard
                key={order.id}
                order={order}
                onStatus={(status) => api.updateOrderStatus(token, order.id, status).then((updated) => {
                  setOrders(orders.map((item) => item.id === updated.id ? { ...item, status: updated.status } : item));
                })}
              />
            ))}
          </div>
        </div>

        <div className="panel">
          <h2><PackagePlus size={20} /> Product control</h2>
          <div className="form-grid admin-form">
            {(["sku", "name", "imageUrl", "dimensions", "useCase", "description"] as const).map((key) => (
              <input key={key} placeholder={key} value={String(productForm[key] ?? "")} onChange={(event) => setProductForm({ ...productForm, [key]: event.target.value })} />
            ))}
            <input placeholder="price range e.g. Rs. 13,500 - Rs. 24,000" value={productForm.priceRange ?? ""} onChange={(event) => setProductForm({ ...productForm, priceRange: event.target.value })} />
            <select value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value as ProductCategory })}>
              <option value="OFFICE">Office</option>
              <option value="EDUCATIONAL">Educational</option>
              <option value="ALMIRAH">Almirah</option>
            </select>
            <select value={productForm.material} onChange={(event) => setProductForm({ ...productForm, material: event.target.value })}>
              <option value="STEEL">Steel</option>
              <option value="WOOD">Wood</option>
              <option value="ENGINEERED_WOOD">Engineered wood</option>
              <option value="METAL_WOOD">Metal + wood</option>
              <option value="LAMINATE">Laminate</option>
            </select>
            <input type="number" placeholder="internal estimate price" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: Number(event.target.value) })} />
            <input type="number" placeholder="stock" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: Number(event.target.value) })} />
          </div>
          <button className="primary" onClick={() => saveProduct().catch((error) => setMessage(error.message))}>Save product</button>
          <div className="table">
            {products.slice(0, 8).map((product) => (
              <button key={product.id} onClick={() => setProductForm(product)}>
                <span>{product.name}</span><small>{product.priceRange || currency(product.price)} · {product.stock} units</small>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function AdminQuoteCard({ order, onStatus }: { order: Order; onStatus: (status: string) => void }) {
  return (
    <article className="quote-card">
      <div className="quote-card-head">
        <div>
          <span className="tag">{order.status}</span>
          <h3>{order.projectName ?? `Quotation ${order.id.slice(-6).toUpperCase()}`}</h3>
          <p>{order.organization} · {order.segment}</p>
        </div>
        <select value={order.status} onChange={(event) => onStatus(event.target.value)}>
          {["NEW", "CONFIRMED", "IN_PROGRESS", "READY", "DELIVERED", "CANCELLED"].map((status) => <option key={status}>{status}</option>)}
        </select>
      </div>
      <div className="detail-grid">
        <div><dt>Customer</dt><dd>{order.customerName}</dd></div>
        <div><dt>Email</dt><dd>{order.email}</dd></div>
        <div><dt>Phone</dt><dd>{order.phone}</dd></div>
        <div><dt>Address</dt><dd>{order.address}</dd></div>
        <div><dt>Timeline</dt><dd>{order.deliveryTimeline}</dd></div>
        <div><dt>Budget</dt><dd>{order.budgetRange || "Not provided"}</dd></div>
      </div>
      {order.notes && <p className="quote-notes">{order.notes}</p>}
      <div className="quote-items">
        {order.items.map((item) => (
          <div key={item.id}>
            <span>{item.product.name}</span>
            <strong>{item.quantity} x {currency(item.unitPrice)}</strong>
          </div>
        ))}
      </div>
      <strong className="total">{currency(order.total)}</strong>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
