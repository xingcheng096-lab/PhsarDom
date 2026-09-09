import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeDollarSign,
  Boxes,
  Building2,
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

function useReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (typeof window !== "undefined") {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reducedMotion) {
        setVisible(true);
        return undefined;
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: options.threshold ?? 0.12,
        rootMargin: options.rootMargin ?? "0px 0px -40px 0px",
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options.rootMargin, options.threshold]);

  return { ref, visible };
}

function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}) {
  const { ref, visible } = useReveal();

  const hiddenTransform =
    direction === "left"
      ? "-translate-x-5"
      : direction === "right"
        ? "translate-x-5"
        : direction === "down"
          ? "-translate-y-4"
          : "translate-y-4";

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)] ${
        visible
          ? "translate-x-0 translate-y-0 opacity-100"
          : `${hiddenTransform} opacity-0`
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function ProductCard({ product }) {
  const volumeSavings = Math.max(
    0,
    Math.round((1 - product.tiers.at(-1).price / product.price) * 100),
  );

  return (
    <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-slate-200/60">
      <Link to={`/products/${product.id}`} className="block overflow-hidden">
        <div className="relative h-44 overflow-hidden bg-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.045]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="absolute left-3 top-3">
            <StatusBadge status={product.status} />
          </span>
        </div>
      </Link>

      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-brand-700">
          {product.supplier}
        </p>

        <Link
          to={`/products/${product.id}`}
          className="mt-1 block min-h-10 text-sm font-semibold text-slate-900 transition-colors duration-200 hover:text-brand-700"
        >
          {product.name}
        </Link>

        <p className="mt-1 text-xs text-slate-500">
          {product.category} · {product.sku}
        </p>

        <div className="mt-3 flex items-end justify-between border-t border-slate-100 pt-3">
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

        <p className="mt-3 rounded-lg bg-brand-50 px-2.5 py-2 text-xs font-medium text-brand-800 transition-colors duration-200 group-hover:bg-brand-100/70">
          Up to {volumeSavings}% savings at volume
        </p>
      </div>
    </article>
  );
}

export function HomePage() {
  const stats = [
    ["12K+", "Business products"],
    ["304", "Verified buyers"],
    ["$2.8M", "Monthly volume"],
    ["98.4%", "On-time delivery"],
  ];

  const benefits = [
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
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-cyan-500">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(14,165,233,.26),transparent_35%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(15,23,42,.06),rgba(2,6,23,.82))]" />
        <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl motion-safe:animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -left-28 bottom-0 h-80 w-80 rounded-full bg-blue-700/10 blur-3xl motion-safe:animate-[pulse_10s_ease-in-out_infinite]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-28">
          <div>
            <div className="motion-safe:animate-[fadeUp_.65s_ease-out_both]">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.18em] text-cyan-300 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.8)]" />
                PhsarDom · B2B Wholesale Platform
              </span>
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-white motion-safe:animate-[fadeUp_.7s_.08s_ease-out_both] sm:text-5xl lg:text-6xl lg:leading-[1.05]">
              Source Better.
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                Negotiate Faster.
              </span>
              <br />
              Buy at Scale.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 motion-safe:animate-[fadeUp_.7s_.16s_ease-out_both] sm:text-lg">
              PhsarDom connects verified businesses with commercial products,
              negotiated pricing, structured RFQs, and accountable purchase
              order workflows.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 motion-safe:animate-[fadeUp_.7s_.24s_ease-out_both]">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-400 hover:shadow-xl hover:shadow-cyan-500/30 active:scale-[.98]"
              >
                Create Business Account
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/products"
                className="inline-flex items-center rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 active:scale-[.98]"
              >
                Browse Products
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs text-slate-400 motion-safe:animate-[fadeUp_.7s_.32s_ease-out_both]">
              <span>Verified business buyers</span>
              <span>MOQ & tier pricing</span>
              <span>RFQ & quotation workflow</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {stats.map(([value, label], index) => (
              <div
                key={label}
                className="group rounded-xl border border-white/10 bg-white/[0.06] p-5 opacity-0 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-white/[0.09] hover:shadow-2xl hover:shadow-black/20 motion-safe:animate-[fadeUp_.7s_ease-out_forwards] motion-reduce:opacity-100 sm:p-6"
                style={{ animationDelay: `${120 + index * 90}ms` }}
              >
                <strong className="block text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {value}
                </strong>
                <p className="mt-2 text-[11px] font-medium uppercase tracking-[.14em] text-slate-400 transition-colors group-hover:text-slate-300">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-brand-600">
                Product range
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Wholesale categories
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Explore commercial categories designed for verified B2B
                purchasing and volume procurement.
              </p>
            </div>

            <Link
              to="/categories"
              className="group hidden items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 sm:flex"
            >
              View all
              <ChevronRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, index) => (
            <Reveal key={cat.name} delay={index * 70}>
              <Link
                to={`/categories/${cat.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-slate-200/60"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-bold text-brand-600 transition-all duration-300 group-hover:scale-105 group-hover:bg-brand-50 group-hover:text-brand-700">
                  {cat.icon}
                </span>

                <span className="min-w-0">
                  <strong className="block text-sm font-semibold text-slate-900">
                    {cat.name}
                  </strong>
                  <small className="mt-1 block leading-5 text-slate-500">
                    {cat.description}
                  </small>
                </span>

                <ChevronRight
                  size={17}
                  className="ml-auto shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand-600"
                />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Reveal>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-brand-600">
                  Curated wholesale
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Featured wholesale products
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Selected products with commercial MOQ and volume-based
                  pricing.
                </p>
              </div>

              <Link
                to="/products"
                className="group inline-flex items-center gap-1 text-sm font-semibold text-brand-600"
              >
                Browse catalog
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 3).map((product, index) => (
              <Reveal key={product.id} delay={index * 90}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-brand-600">
              Built for B2B procurement
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              A structured wholesale buying experience
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              From minimum order quantities to pricing tiers and delivery
              coordination, PhsarDom supports the complete purchasing flow.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {benefits.map(([Icon, title, text], index) => (
            <Reveal key={title} delay={index * 90}>
              <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-slate-200/50">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-cyan-400 to-blue-500" />

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-[.16em] text-slate-400">
                    0{index + 1}
                  </span>

                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:bg-brand-100">
                    <Icon size={21} />
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-semibold text-slate-950">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <Reveal>
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-slate-950 px-6 py-10 text-white shadow-2xl sm:px-8 lg:px-10">
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-blue-600/10 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-300">
                  Start purchasing at scale
                </p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  Ready for business-grade purchasing?
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Register your organization for verification, negotiated
                  pricing, RFQs, purchase orders, and commercial delivery
                  tracking.
                </p>
              </div>

              <Link
                to="/register"
                className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-50 active:scale-[.98]"
              >
                Register your business
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </Reveal>
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
        .filter((product) => {
          const haystack =
            `${product.name} ${product.sku} ${product.category} ${product.supplier} ${product.description}`.toLowerCase();

          return (
            haystack.includes(search.toLowerCase()) &&
            (!category || product.category === category) &&
            (!availability || product.status === availability) &&
            (!supplier || product.supplier === supplier) &&
            (!moq ||
              (moq === "50"
                ? product.moq <= 50
                : moq === "100"
                  ? product.moq <= 100
                  : product.moq >= 250)) &&
            (!price ||
              (price === "25"
                ? product.price < 25
                : price === "100"
                  ? product.price >= 25 && product.price <= 100
                  : product.price > 100))
          );
        })
        .sort((a, b) =>
          sort === "price"
            ? a.price - b.price
            : a.name.localeCompare(b.name),
        ),
    [search, category, availability, moq, price, supplier, sort],
  );

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setAvailability("");
    setMoq("");
    setPrice("");
    setSupplier("");
  };

  const filters = (
    <div className="space-y-4">
      <SelectInput
        label="Category"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
      >
        <option value="">All categories</option>
        {categories.map((item) => (
          <option key={item.name}>{item.name}</option>
        ))}
      </SelectInput>

      <SelectInput
        label="Minimum order"
        value={moq}
        onChange={(event) => setMoq(event.target.value)}
      >
        <option value="">Any MOQ</option>
        <option value="50">Up to 50</option>
        <option value="100">Up to 100</option>
        <option value="250">250+</option>
      </SelectInput>

      <SelectInput
        label="Price range"
        value={price}
        onChange={(event) => setPrice(event.target.value)}
      >
        <option value="">Any price</option>
        <option value="25">Under $25</option>
        <option value="100">$25 - $100</option>
        <option value="101">$100+</option>
      </SelectInput>

      <SelectInput
        label="Availability"
        value={availability}
        onChange={(event) => setAvailability(event.target.value)}
      >
        <option value="">Any availability</option>
        <option>In Stock</option>
        <option>Low Stock</option>
        <option>Backordered</option>
      </SelectInput>

      <SelectInput
        label="Supplier"
        value={supplier}
        onChange={(event) => setSupplier(event.target.value)}
      >
        <option value="">All suppliers</option>
        {[...new Set(products.map((product) => product.supplier))].map(
          (name) => (
            <option key={name}>{name}</option>
          ),
        )}
      </SelectInput>

      <button className="btn-ghost w-full" onClick={resetFilters}>
        Clear filters
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f5f7fa]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            B2B Marketplace
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Wholesale Product Catalog
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Commercial products with transparent MOQ and volume pricing.
          </p>
        </Reveal>

        <button
          className="btn-secondary mt-5 w-full lg:hidden"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <SlidersHorizontal
            size={16}
            className={`transition-transform duration-200 ${
              filtersOpen ? "rotate-90" : ""
            }`}
          />
          Filters
        </button>

        <div
          className={`grid overflow-hidden transition-all duration-300 lg:hidden ${
            filtersOpen
              ? "mt-3 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0">
            <div className="surface-card p-4">{filters}</div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
          <Reveal direction="left">
            <aside className="surface-card hidden h-fit p-4 lg:block">
              <h2 className="mb-4 flex items-center gap-2 border-b pb-3 font-semibold">
                <SlidersHorizontal size={16} />
                Refine results
              </h2>
              {filters}
            </aside>
          </Reveal>

          <div className="min-w-0">
            <Reveal delay={80}>
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
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>

                <select
                  aria-label="Sort products"
                  className="form-control sm:w-48"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="name">Product name</option>
                  <option value="price">Lowest price</option>
                </select>

                <span className="flex">
                  <button
                    type="button"
                    aria-label="Grid view"
                    onClick={() => setGrid(true)}
                    className={`h-10 w-10 rounded-l-md border transition-all duration-200 ${
                      grid
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    <Grid2X2 className="mx-auto" size={17} />
                  </button>

                  <button
                    type="button"
                    aria-label="List view"
                    onClick={() => setGrid(false)}
                    className={`h-10 w-10 rounded-r-md border transition-all duration-200 ${
                      !grid
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    <List className="mx-auto" size={17} />
                  </button>
                </span>
              </div>
            </Reveal>

            <p aria-live="polite" className="my-4 text-xs text-slate-500">
              Showing {filtered.length} product
              {filtered.length === 1 ? "" : "s"}
            </p>

            {filtered.length ? (
              <div
                key={`${grid}-${search}-${category}-${availability}-${moq}-${price}-${supplier}-${sort}`}
                className={`motion-safe:animate-[fadeIn_.25s_ease-out] ${
                  grid
                    ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                    : "grid gap-4"
                }`}
              >
                {filtered.map((product, index) => (
                  <div
                    key={product.id}
                    className="opacity-0 motion-safe:animate-[fadeUp_.4s_ease-out_forwards] motion-reduce:opacity-100"
                    style={{ animationDelay: `${Math.min(index * 45, 270)}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <Reveal>
                <div className="surface-card p-10 text-center">
                  <h2 className="font-semibold">
                    No products match your filters
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Adjust your search or reset the current filters.
                  </p>
                  <button
                    className="btn-secondary mt-4"
                    onClick={resetFilters}
                  >
                    Reset search
                  </button>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export function ProductDetailPage() {
  const { id } = useParams();
  const product = products.find((item) => item.id === Number(id));
  const [quantity, setQuantity] = useState(product?.moq || 0);

  useEffect(() => {
    setQuantity(product?.moq || 0);
  }, [id, product?.moq]);

  if (!product) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-20 text-center">
        <Reveal>
          <h1 className="text-2xl font-semibold">Product not found</h1>
          <p className="mt-2 text-slate-500">
            The requested wholesale item is unavailable.
          </p>
          <Link to="/products" className="btn-primary mt-5">
            Return to catalog
          </Link>
        </Reveal>
      </main>
    );
  }

  const tier =
    [...product.tiers].reverse().find((item) => quantity >= item.min) ||
    product.tiers[0];

  return (
    <main className="min-h-screen bg-[#f5f7fa]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <Reveal>
          <div className="mb-5 text-xs text-slate-500">
            <Link
              to="/products"
              className="transition-colors hover:text-brand-700"
            >
              Products
            </Link>{" "}
            / {product.category} / {product.name}
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal direction="left">
            <div className="surface-card overflow-hidden p-3">
              <div className="group overflow-hidden rounded-md">
                <img
                  src={product.image}
                  alt={product.name}
                  className="aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025] sm:aspect-[4/3]"
                />
              </div>
            </div>
          </Reveal>

          <Reveal direction="right" delay={80}>
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
                  <small className="block text-slate-500">
                    Available stock
                  </small>
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
                    {product.tiers.map((item) => {
                      const active =
                        quantity >= item.min &&
                        (!item.max || quantity <= item.max);

                      return (
                        <tr
                          key={item.min}
                          className={`border-t transition-all duration-200 ${
                            active
                              ? "bg-brand-50 ring-1 ring-inset ring-brand-200"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="p-3">
                            <span className="inline-flex items-center gap-2">
                              {item.min}
                              {item.max ? ` - ${item.max}` : "+"}
                              {active && (
                                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                                  Current tier
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="p-3 text-right font-semibold">
                            {currency(item.price)}
                          </td>
                        </tr>
                      );
                    })}
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
                    onChange={(event) =>
                      setQuantity(
                        Math.max(product.moq, Number(event.target.value)),
                      )
                    }
                    className="form-control transition-all duration-200 focus:ring-2 focus:ring-brand-200"
                  />
                </label>

                <span>
                  <span className="form-label">Estimated subtotal</span>
                  <strong
                    key={`${quantity}-${tier.price}`}
                    className="block min-h-10 rounded-md bg-slate-100 px-3 py-2 text-lg motion-safe:animate-[fadeIn_.2s_ease-out]"
                  >
                    {currency(quantity * tier.price)}
                  </strong>
                </span>
              </div>

              <Link
                to="/login"
                className="btn-primary group mt-5 w-full py-3 transition-all duration-300 hover:-translate-y-0.5"
              >
                Request a Quote
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <Card title="Specifications">
              <dl className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Unit of measure", product.unit],
                  ["Commercial grade", "Yes"],
                  ["Warranty", "24 months"],
                  ["Country of origin", "United States"],
                ].map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs text-slate-500">{key}</dt>
                    <dd className="mt-1 font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </Reveal>

          <Reveal delay={80}>
            <Card title="Documents">
              <button
                onClick={() => alert("Product data sheet downloaded.")}
                className="flex w-full items-center gap-2 border-b py-3 text-brand-700 transition-all duration-200 hover:translate-x-1"
              >
                <FileIcon />
                Product data sheet
              </button>

              <button
                onClick={() => alert("Warranty document downloaded.")}
                className="flex w-full items-center gap-2 py-3 text-brand-700 transition-all duration-200 hover:translate-x-1"
              >
                <FileIcon />
                Warranty information
              </button>
            </Card>
          </Reveal>
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
      <Reveal>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-brand-600">
          Product range
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Product Categories
        </h1>
        <p className="mt-2 max-w-xl text-slate-500">
          Explore our commercial product portfolio by category.
        </p>
      </Reveal>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => (
          <Reveal key={category.slug} delay={index * 70}>
            <Link
              to={`/categories/${category.slug}`}
              className="group block rounded-xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl"
            >
              <span className="text-3xl font-bold text-slate-200 transition-colors duration-300 group-hover:text-brand-200">
                {category.icon}
              </span>

              <h2 className="mt-5 text-lg font-semibold text-slate-900 transition-colors duration-200 group-hover:text-brand-700">
                {category.name}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {category.description}
              </p>

              <span className="mt-5 flex items-center gap-1 text-xs font-bold text-brand-600">
                Explore category
                <ChevronRight
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </main>
  );
}

export function CategoryPage() {
  const { slug } = useParams();
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-20 text-center">
        <Reveal>
          <h1 className="text-2xl font-semibold">Category not found</h1>
          <Link to="/categories" className="btn-primary mt-5">
            View all categories
          </Link>
        </Reveal>
      </main>
    );
  }

  const matchingProducts = products.filter(
    (product) => product.category === category.name,
  );

  return (
    <main className="min-h-screen bg-[#f5f7fa]">
      <div className="mx-auto max-w-7xl px-5 py-12">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-brand-600">
            Category
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {category.name}
          </h1>
          <p className="mt-2 max-w-xl text-slate-500">
            {category.description}
          </p>
        </Reveal>

        {matchingProducts.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {matchingProducts.map((product, index) => (
              <Reveal key={product.id} delay={index * 70}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal delay={80}>
            <div className="surface-card mt-8 p-10 text-center">
              <h2 className="font-semibold">No products in this category yet</h2>
              <Link to="/products" className="btn-secondary mt-4">
                Browse all products
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </main>
  );
}

export function AboutPage() {
  const values = [
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
  ];

  return (
    <main>
      <section className="relative overflow-hidden bg-slate-950 px-5 py-20 text-center text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(14,165,233,.18),transparent_40%)]" />

        <div className="relative">
          <div className="motion-safe:animate-[scaleIn_.55s_ease-out_both]">
            <BrandLogo variant="full" className="mx-auto w-44 sm:w-52" />
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-tight motion-safe:animate-[fadeUp_.65s_.08s_ease-out_both]">
            Business purchasing, made accountable.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 motion-safe:animate-[fadeUp_.65s_.16s_ease-out_both]">
            We connect verified organizations with reliable commercial
            suppliers, transparent volume pricing, and coordinated logistics.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-3">
        {values.map(([Icon, title, description], index) => (
          <Reveal key={title} delay={index * 100}>
            <div className="group rounded-xl border border-transparent p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:bg-white hover:shadow-lg">
              <Icon
                className="text-brand-600 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105"
                size={32}
              />
              <h2 className="mt-4 text-lg font-bold">{title}</h2>
              <p className="mt-2 leading-6 text-slate-500">{description}</p>
            </div>
          </Reveal>
        ))}
      </section>
    </main>
  );
}

export function LegalPage({ type }) {
  const sections = [
    "Introduction and scope",
    "Business account responsibilities",
    "Platform use and acceptable conduct",
    "Data handling and retention",
    "Contact and dispute resolution",
  ];

  return (
    <main className="mx-auto max-w-4xl px-5 py-14">
      <Reveal>
        <h1 className="text-3xl font-bold">{type}</h1>
        <p className="mt-2 text-xs text-slate-500">
          Last updated September 1, 2026
        </p>
      </Reveal>

      {sections.map((heading, index) => (
        <Reveal key={heading} delay={Math.min(index * 50, 200)}>
          <section className="mt-8">
            <h2 className="text-lg font-semibold">{heading}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              PhsarDom maintains professional standards for all business users.
              Information is collected and processed only as required to verify
              organizations, facilitate commercial transactions, provide
              support, and meet legal obligations.
            </p>
          </section>
        </Reveal>
      ))}
    </main>
  );
}
