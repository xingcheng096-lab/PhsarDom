import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeDollarSign,
  Boxes,
  Building2,
  Check,
  ChevronRight,
  Grid2X2,
  List,
  PackageCheck,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Truck,
} from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { products } from "../../data";
import { currency } from "../../utils/format";
import { Card, SelectInput, StatusBadge } from "../../components/ui";
import BrandLogo from "../../components/common/BrandLogo";

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    icon: "01",
    description: "Workplace technology and enterprise accessories",
  },
  {
    name: "Safety Equipment",
    slug: "safety-equipment",
    icon: "02",
    description: "Certified PPE and operational safety products",
  },
  {
    name: "Packaging",
    slug: "packaging",
    icon: "03",
    description: "Shipping, storage, and fulfillment materials",
  },
  {
    name: "Office Furniture",
    slug: "office-furniture",
    icon: "04",
    description: "Commercial workspace furniture and fixtures",
  },
  {
    name: "Cleaning Supplies",
    slug: "cleaning-supplies",
    icon: "05",
    description: "Institutional cleaning and facility products",
  },
  {
    name: "Tools",
    slug: "tools",
    icon: "06",
    description: "Professional tools and maintenance equipment",
  },
];
function ProductCard({ product }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <Link to={`/products/${product.id}`}>
        <div className="relative h-44 overflow-hidden bg-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
          <span className="absolute left-3 top-3">
            <StatusBadge status={product.status} />
          </span>
        </div>
      </Link>
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">
          {product.supplier}
        </p>
        <Link
          to={`/products/${product.id}`}
          className="mt-1 block min-h-10 text-sm font-semibold text-slate-900 hover:text-brand-700"
        >
          {product.name}
        </Link>
        <p className="mt-1 text-xs text-slate-500">
          {product.category} · {product.sku}
        </p>
        <div className="mt-3 flex items-end justify-between border-t pt-3">
          <span>
            <small className="block text-xs text-slate-500">Starting at</small>
            <strong className="text-lg text-slate-950">
              {currency(product.price)}
            </strong>
          </span>
          <span className="text-right text-xs">
            <small className="block text-slate-500">Minimum order</small>
            <strong>
              {product.moq} {product.unit}s
            </strong>
          </span>
        </div>
        <p className="mt-3 rounded-md bg-brand-50 px-2.5 py-2 text-xs text-brand-800">
          Up to{" "}
          {Math.round((1 - product.tiers.at(-1).price / product.price) * 100)}%
          savings at volume
        </p>
      </div>
    </article>
  );
}

export function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(40,120,189,.4),transparent_40%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-block border-l-2 border-cyan-400 pl-3 text-xs font-bold uppercase tracking-[.2em] text-cyan-300">
              PhsarDom · B2B Wholesale Platform
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl">
              Source Better.
              <br />
              <span className="text-cyan-300">Negotiate Faster.</span> Buy at
              Scale.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              PhsarDom connects verified businesses with commercial products,
              negotiated pricing, and accountable purchase order workflows.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary px-5 py-3">
                Create Business Account <ArrowRight size={16} />
              </Link>
              <Link
                to="/products"
                className="btn border-slate-600 bg-transparent px-5 py-3 text-white hover:bg-white/10"
              >
                Browse Products
              </Link>
            </div>
          </div>
          <div className="hidden grid-cols-2 gap-3 lg:grid">
            {[
              ["12K+", "Business products"],
              ["304", "Verified buyers"],
              ["$2.8M", "Monthly volume"],
              ["98.4%", "On-time delivery"],
            ].map(([v, l]) => (
              <div
                className="border border-white/10 bg-white/5 p-6 backdrop-blur"
                key={l}
              >
                <strong className="text-3xl text-white">{v}</strong>
                <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
                  {l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Product range
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Wholesale categories
            </h2>
          </div>
          <Link
            to="/categories"
            className="hidden items-center gap-1 text-sm font-semibold text-brand-600 sm:flex"
          >
            View all <ChevronRight size={16} />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              to={`/categories/${cat.slug}`}
              key={cat.name}
              className="flex items-center gap-4 rounded border p-5 hover:border-brand-400 hover:shadow-card"
            >
              <span className="flex h-12 w-12 items-center justify-center bg-slate-100 font-bold text-brand-600">
                {cat.icon}
              </span>
              <span>
                <strong className="text-sm text-slate-800">{cat.name}</strong>
                <small className="mt-1 block text-slate-500">
                  {cat.description}
                </small>
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="bg-slate-100">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <h2 className="text-2xl font-bold text-slate-900">
            Featured wholesale products
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 3).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            [
              Boxes,
              "Order by MOQ",
              "Minimum order quantities keep wholesale prices competitive and fulfillment efficient.",
            ],
            [
              BadgeDollarSign,
              "Unlock tier pricing",
              "Your unit cost decreases automatically as order quantities move through pricing tiers.",
            ],
            [
              Truck,
              "Coordinate delivery",
              "Track purchase orders and commercial freight from allocation through delivery.",
            ],
          ].map(([Icon, title, text], i) => (
            <div
              key={title}
              className="border-t-4 border-brand-500 bg-white p-6 shadow-card"
            >
              <span className="text-xs font-bold text-slate-400">0{i + 1}</span>
              <Icon className="mt-4 text-brand-600" size={28} />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-brand-700">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-5 py-12 text-white md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold">
              Ready for business-grade purchasing?
            </h2>
            <p className="mt-2 text-brand-100">
              Register your organization for verification and negotiated
              pricing.
            </p>
          </div>
          <Link
            to="/register"
            className="btn border-white bg-white px-5 py-3 text-brand-700 hover:bg-slate-100"
          >
            Register your business
          </Link>
        </div>
      </section>
    </>
  );
}

export function ProductsPage() {
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState("");
  const [availability, setAvailability] = useState("");
  const [moq, setMoq] = useState("");
  const [price, setPrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [sort, setSort] = useState("name");
  const [grid, setGrid] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => setSearch(params.get("search") || ""), [params]);
  const filtered = useMemo(
    () =>
      products
        .filter((p) => {
          const haystack =
            `${p.name} ${p.sku} ${p.category} ${p.supplier} ${p.description}`.toLowerCase();
          return (
            haystack.includes(search.toLowerCase()) &&
            (!category || p.category === category) &&
            (!availability || p.status === availability) &&
            (!supplier || p.supplier === supplier) &&
            (!moq ||
              (moq === "50"
                ? p.moq <= 50
                : moq === "100"
                  ? p.moq <= 100
                  : p.moq >= 250)) &&
            (!price ||
              (price === "25"
                ? p.price < 25
                : price === "100"
                  ? p.price >= 25 && p.price <= 100
                  : p.price > 100))
          );
        })
        .sort((a, b) =>
          sort === "price" ? a.price - b.price : a.name.localeCompare(b.name),
        ),
    [search, category, availability, moq, price, supplier, sort],
  );
  const filters = (
    <div className="space-y-4">
      <SelectInput
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.name}>{c.name}</option>
        ))}
      </SelectInput>
      <SelectInput
        label="Minimum order"
        value={moq}
        onChange={(e) => setMoq(e.target.value)}
      >
        <option value="">Any MOQ</option>
        <option value="50">Up to 50</option>
        <option value="100">Up to 100</option>
        <option value="250">250+</option>
      </SelectInput>
      <SelectInput
        label="Price range"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      >
        <option value="">Any price</option>
        <option value="25">Under $25</option>
        <option value="100">$25 - $100</option>
        <option value="101">$100+</option>
      </SelectInput>
      <SelectInput
        label="Availability"
        value={availability}
        onChange={(e) => setAvailability(e.target.value)}
      >
        <option value="">Any availability</option>
        <option>In Stock</option>
        <option>Low Stock</option>
        <option>Backordered</option>
      </SelectInput>
      <SelectInput
        label="Supplier"
        value={supplier}
        onChange={(e) => setSupplier(e.target.value)}
      >
        <option value="">All suppliers</option>
        {[...new Set(products.map((p) => p.supplier))].map((s) => (
          <option key={s}>{s}</option>
        ))}
      </SelectInput>
      <button
        className="btn-ghost w-full"
        onClick={() => {
          setCategory("");
          setAvailability("");
          setMoq("");
          setPrice("");
          setSupplier("");
        }}
      >
        Clear filters
      </button>
    </div>
  );
  return (
    <main className="bg-[#f5f7fa]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
          B2B Marketplace
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          Wholesale Product Catalog
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Commercial products with transparent MOQ and volume pricing.
        </p>
        <button
          className="btn-secondary mt-5 w-full lg:hidden"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
        {filtersOpen && (
          <div className="surface-card mt-3 p-4 lg:hidden">{filters}</div>
        )}
        <div className="mt-6 grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="surface-card hidden h-fit p-4 lg:block">
            <h2 className="mb-4 flex items-center gap-2 border-b pb-3 font-semibold">
              <SlidersHorizontal size={16} />
              Refine results
            </h2>
            {filters}
          </aside>
          <div className="min-w-0">
            <div className="surface-card flex flex-col gap-3 p-3 sm:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">Search products</span>
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  className="form-control pl-10"
                  placeholder="Search product, SKU, supplier, or category"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <select
                aria-label="Sort products"
                className="form-control sm:w-48"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="name">Product name</option>
                <option value="price">Lowest price</option>
              </select>
              <span className="flex">
                <button
                  aria-label="Grid view"
                  onClick={() => setGrid(true)}
                  className={`h-10 w-10 rounded-l-md border ${grid ? "border-brand-600 bg-brand-600 text-white" : "bg-white"}`}
                >
                  <Grid2X2 className="mx-auto" size={17} />
                </button>
                <button
                  aria-label="List view"
                  onClick={() => setGrid(false)}
                  className={`h-10 w-10 rounded-r-md border ${!grid ? "border-brand-600 bg-brand-600 text-white" : "bg-white"}`}
                >
                  <List className="mx-auto" size={17} />
                </button>
              </span>
            </div>
            <p aria-live="polite" className="my-4 text-xs text-slate-500">
              Showing {filtered.length} product
              {filtered.length === 1 ? "" : "s"}
            </p>
            {filtered.length ? (
              <div
                className={
                  grid
                    ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                    : "grid gap-4"
                }
              >
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="surface-card p-10 text-center">
                <h2 className="font-semibold">
                  No products match your filters
                </h2>
                <button
                  className="btn-secondary mt-4"
                  onClick={() => {
                    setSearch("");
                    setCategory("");
                    setAvailability("");
                    setMoq("");
                    setPrice("");
                    setSupplier("");
                  }}
                >
                  Reset search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export function ProductDetailPage() {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));
  const [quantity, setQuantity] = useState(product?.moq || 0);
  useEffect(() => setQuantity(product?.moq || 0), [id, product?.moq]);
  if (!product)
    return (
      <main className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <p className="mt-2 text-slate-500">
          The requested wholesale item is unavailable.
        </p>
        <Link to="/products" className="btn-primary mt-5">
          Return to catalog
        </Link>
      </main>
    );
  const tier =
    [...product.tiers].reverse().find((x) => quantity >= x.min) ||
    product.tiers[0];
  return (
    <main className="bg-[#f5f7fa]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-5 text-xs text-slate-500">
          <Link to="/products" className="hover:text-brand-700">
            Products
          </Link>{" "}
          / {product.category} / {product.name}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="surface-card p-3">
            <img
              src={product.image}
              alt={product.name}
              className="aspect-square w-full rounded-md object-cover sm:aspect-[4/3]"
            />
          </div>
          <div className="surface-card p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              {product.supplier}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {product.name}
            </h1>
            <p className="mt-2 text-xs text-slate-500">
              {product.category} · SKU {product.sku}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4 border-y py-4 sm:grid-cols-3">
              <span>
                <small className="block text-slate-500">MOQ</small>
                <strong>
                  {product.moq} {product.unit}s
                </strong>
              </span>
              <span>
                <small className="block text-slate-500">Availability</small>
                <StatusBadge status={product.status} />
              </span>
              <span>
                <small className="block text-slate-500">Available stock</small>
                <strong>{product.stock.toLocaleString()}</strong>
              </span>
            </div>
            <p className="mt-5 leading-6">{product.description}</p>
            <div className="mt-5 overflow-hidden rounded-md border">
              <table className="w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 text-left">Quantity tier</th>
                    <th className="p-3 text-right">Unit price</th>
                  </tr>
                </thead>
                <tbody>
                  {product.tiers.map((t) => (
                    <tr key={t.min} className="border-t">
                      <td className="p-3">
                        {t.min}
                        {t.max ? ` - ${t.max}` : "+"}
                      </td>
                      <td className="p-3 text-right font-semibold">
                        {currency(t.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label>
                <span className="form-label">Order quantity</span>
                <input
                  type="number"
                  min={product.moq}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(product.moq, Number(e.target.value)))
                  }
                  className="form-control"
                />
              </label>
              <span>
                <span className="form-label">Estimated subtotal</span>
                <strong className="block min-h-10 rounded-md bg-slate-100 px-3 py-2 text-lg">
                  {currency(quantity * tier.price)}
                </strong>
              </span>
            </div>
            <Link to="/login" className="btn-primary mt-5 w-full py-3">
              Request a Quote
            </Link>
          </div>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card title="Specifications" className="lg:col-span-2">
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ["Unit of measure", product.unit],
                ["Commercial grade", "Yes"],
                ["Warranty", "24 months"],
                ["Country of origin", "United States"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-slate-500">{k}</dt>
                  <dd className="mt-1 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card title="Documents">
            <button
              onClick={() => alert("Product data sheet downloaded.")}
              className="flex w-full items-center gap-2 border-b py-3 text-brand-700"
            >
              <FileIcon />
              Product data sheet
            </button>
            <button
              onClick={() => alert("Warranty document downloaded.")}
              className="flex w-full items-center gap-2 py-3 text-brand-700"
            >
              <FileIcon />
              Warranty information
            </button>
          </Card>
        </div>
      </div>
    </main>
  );
}
function FileIcon() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded bg-red-100 text-[9px] font-bold text-red-600">
      PDF
    </span>
  );
}
export function CategoriesPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-14">
      <h1 className="text-3xl font-bold text-slate-900">Product Categories</h1>
      <p className="mt-2 text-slate-500">
        Explore our commercial product portfolio by category.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            to={`/categories/${cat.slug}`}
            key={cat.slug}
            className="rounded border p-7 hover:border-brand-500 hover:shadow-lg"
          >
            <span className="text-3xl font-bold text-slate-200">
              {cat.icon}
            </span>
            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              {cat.name}
            </h2>
            <p className="mt-2 text-sm text-slate-500">{cat.description}</p>
            <span className="mt-5 flex items-center gap-1 text-xs font-bold text-brand-600">
              Explore category <ChevronRight size={14} />
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
export function CategoryPage() {
  const { slug } = useParams();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat)
    return (
      <main className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="text-2xl font-semibold">Category not found</h1>
        <Link to="/categories" className="btn-primary mt-5">
          View all categories
        </Link>
      </main>
    );
  const matching = products.filter((p) => p.category === cat.name);
  return (
    <main className="bg-[#f5f7fa]">
      <div className="mx-auto max-w-7xl px-5 py-12">
        <h1 className="text-3xl font-semibold text-slate-950">{cat.name}</h1>
        <p className="mt-2 text-slate-500">{cat.description}</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {matching.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </main>
  );
}
export function AboutPage() {
  return (
    <main>
      <section className="bg-slate-900 px-5 py-20 text-center text-white">
        <BrandLogo variant="full" className="mx-auto w-44 sm:w-52" />
        <h1 className="mt-4 text-4xl font-bold">
          Business purchasing, made accountable.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300">
          We connect verified organizations with reliable commercial suppliers,
          transparent volume pricing, and coordinated logistics.
        </p>
      </section>
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-3">
        {[
          [
            Building2,
            "Verified network",
            "Every buyer and supplier relationship follows formal business verification.",
          ],
          [
            ShieldCheck,
            "Commercial confidence",
            "Documented quotations, approvals, contracts, and audit trails protect every transaction.",
          ],
          [
            PackageCheck,
            "End-to-end visibility",
            "Track sourcing through purchase order, invoice, allocation, and delivery.",
          ],
        ].map(([Icon, t, d]) => (
          <div key={t}>
            <Icon className="text-brand-600" size={32} />
            <h2 className="mt-4 text-lg font-bold">{t}</h2>
            <p className="mt-2 leading-6 text-slate-500">{d}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
export function LegalPage({ type }) {
  return (
    <main className="mx-auto max-w-4xl px-5 py-14">
      <h1 className="text-3xl font-bold">{type}</h1>
      <p className="mt-2 text-xs text-slate-500">
        Last updated September 1, 2026
      </p>
      {[
        "Introduction and scope",
        "Business account responsibilities",
        "Platform use and acceptable conduct",
        "Data handling and retention",
        "Contact and dispute resolution",
      ].map((h) => (
        <section key={h} className="mt-8">
          <h2 className="text-lg font-semibold">{h}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            PhsarDom maintains professional standards for all business users.
            Information is collected and processed only as required to verify
            organizations, facilitate commercial transactions, provide support,
            and meet legal obligations.
          </p>
        </section>
      ))}
    </main>
  );
}
