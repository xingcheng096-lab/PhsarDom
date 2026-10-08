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
import heroImage from "../../assets/phsardom-hero.png";
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

export function useReveal(options = {}) {
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

export function Reveal({
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

export function ProductCard({ product }) {
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

        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
          <Truck size={13} />
          Ships in {product.leadTime}
        </p>

        <p className="mt-3 rounded-lg bg-brand-50 px-2.5 py-2 text-xs font-medium text-brand-800 transition-colors duration-200 group-hover:bg-brand-100/70">
          Up to {volumeSavings}% savings at volume
        </p>
      </div>
    </article>
  );
}



export function HomePage() {
  const stats = [
    { Icon: Boxes, value: "12K+", label: "Business Products" },
    { Icon: Building2, value: "304", label: "Verified Buyers" },
    { Icon: BadgeDollarSign, value: "$2.8M", label: "Monthly Volume" },
    { Icon: Truck, value: "98.4%", label: "On-Time Delivery" },
  ];

  return (
    <main>
      {/* HERO SECTION */}
      <section className="relative isolate min-h-[850px] overflow-hidden bg-[#052c4a] text-white">
        {/* Warehouse background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${heroImage}")`,
            backgroundPosition: "center center",
          }}
        />

        {/* Dark overlay for readable text */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#032b49]/95 via-[#032b49]/65 to-[#032b49]/10" />

        {/* Subtle bottom overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#032b49]/65 via-transparent to-transparent" />

        <div className="relative mx-auto flex min-h-[850px] max-w-[1600px] flex-col justify-between gap-12 px-6 pb-12 pt-20 lg:px-12 xl:px-16">
          {/* Main hero content */}
          <div className="relative z-10 max-w-[670px]">
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              PHSARDOM · B2B WHOLESALE PLATFORM
            </div>

            <h1 className="mt-9 text-[46px] font-extrabold leading-[1.12] tracking-tight sm:text-6xl xl:text-[68px]">
              Source Better.
              <br />

              <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-400 bg-clip-text text-transparent">
                Negotiate Faster.
              </span>

              <br />
              Buy at Scale.
            </h1>

            <p className="mt-7 max-w-[610px] text-base leading-8 text-slate-200 sm:text-lg">
              PhsarDom connects verified businesses with commercial
              products, negotiated pricing, structured RFQs, and
              accountable purchase order workflows.
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex min-h-14 items-center justify-center gap-5 rounded-lg bg-blue-600 px-7 font-semibold text-white shadow-xl shadow-blue-950/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500"
              >
                Create Business Account
                <ArrowRight size={19} />
              </Link>

              <Link
                to="/products"
                className="inline-flex min-h-14 items-center justify-center rounded-lg border border-white/40 bg-white/10 px-8 font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                Browse Products
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-9 flex max-w-[650px] flex-wrap items-center gap-x-7 gap-y-4 text-xs text-slate-200">
              <span className="flex items-center gap-2">
                <ShieldCheck
                  size={24}
                  className="shrink-0 text-sky-400"
                />
                Verified business buyers
              </span>

              <span className="flex items-center gap-2">
                <BadgeDollarSign
                  size={24}
                  className="shrink-0 text-sky-400"
                />
                MOQ & tier pricing
              </span>

              <span className="flex items-center gap-2">
                <PackageCheck
                  size={24}
                  className="shrink-0 text-sky-400"
                />
                RFQ to quotation workflow
              </span>
            </div>
          </div>

          {/* Floating RFQ widget */}
          <div className="pointer-events-none absolute right-[33%] top-[17%] z-10 hidden rounded-2xl border border-white/25 bg-[#123e60]/75 p-5 shadow-2xl backdrop-blur-lg 2xl:block">
            <div className="flex items-center gap-4">
              <span className="rounded-xl bg-blue-600 p-3">
                <PackageCheck size={26} />
              </span>

              <div>
                <p className="text-sm font-semibold">RFQ Requests</p>
                <strong className="text-2xl">24</strong>
                <p className="text-xs text-slate-300">
                  Pending Review
                </p>
              </div>
            </div>
          </div>

          {/* Purchase order widget */}
          <div className="pointer-events-none absolute right-[7%] top-[25%] z-10 hidden w-52 rotate-[-5deg] rounded-2xl bg-white p-5 text-slate-900 shadow-2xl 2xl:block">
            <p className="text-sm font-bold">Purchase Orders</p>
            <p className="mt-1 text-xs text-slate-500">
              Growth Overview
            </p>

            <div className="mt-4 flex h-20 items-end gap-2">
              {[30, 44, 38, 60, 75, 90].map((height, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-t bg-blue-500"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>

            <p className="mt-3 font-bold text-blue-600">+28%</p>
          </div>

          {/* Statistics — separate row, no overlap */}
          <div className="relative z-10 grid w-full grid-cols-2 gap-3 lg:ml-auto lg:w-[64%] lg:grid-cols-4">
            {stats.map(({ Icon, value, label }) => (
              <div
                key={label}
                className="flex min-h-[104px] items-center gap-3 rounded-xl border border-white/25 bg-[#082f50]/80 px-4 py-5 shadow-xl backdrop-blur-lg"
              >
                <Icon
                  size={28}
                  className="shrink-0 text-sky-400"
                />

                <div className="min-w-0">
                  <strong className="block text-xl font-extrabold xl:text-2xl">
                    {value}
                  </strong>

                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHOLESALE CATEGORIES */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Product Range
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Wholesale Categories
          </h2>

          <p className="mt-2 text-slate-500">
            Explore commercial categories for volume procurement.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/categories/${category.slug}`}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
            >
              <span className="text-xs font-bold text-blue-600">
                {category.icon}
              </span>

              <h3 className="mt-3 font-bold text-slate-900">
                {category.name}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-3xl font-bold text-slate-900">
              Featured Wholesale Products
            </h2>

            <Link
              to="/products"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Browse Catalog →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {products.slice(0, 3).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
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
          <aside className="surface-card sticky top-[calc(var(--public-navbar-height)+16px)] z-30 hidden h-fit max-h-[calc(100vh-var(--public-navbar-height)-24px)] self-start overflow-y-auto p-4 lg:block">
            <h2 className="mb-4 flex items-center gap-2 border-b pb-3 font-semibold">
              <SlidersHorizontal size={16} />
              Refine results
            </h2>
            {filters}
          </aside>

          <div className="min-w-0">
            <div className="surface-card sticky top-[var(--public-navbar-height)] z-40 flex flex-col gap-3 border-slate-200 bg-white p-3 shadow-md sm:flex-row">
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

              <div className="mt-5 grid grid-cols-2 gap-4 border-y py-4 sm:grid-cols-4">
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

                <span>
                  <small className="block text-slate-500">Lead time</small>
                  <strong>{product.leadTime}</strong>
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
                              {item.max === null && (
                                <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                  Best price
                                </span>
                              )}
                              {active && item.max !== null && (
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

              {(() => {
                const nextTier = product.tiers.find((item) => item.min > quantity)
                return nextTier ? (
                  <p className="mt-3 rounded-md bg-brand-50 px-3 py-2 text-xs font-medium text-brand-800">
                    Add {nextTier.min - quantity} more units to unlock{" "}
                    {currency(nextTier.price)}/unit.
                  </p>
                ) : (
                  <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                    Best wholesale price applied for this quantity.
                  </p>
                )
              })()}

              <div className="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-violet-700">
                    Verified buyer contract price
                  </span>
                  <span className="text-sm font-bold text-violet-800">
                    {currency(Math.round(tier.price * 0.94 * 100) / 100)}
                  </span>
                </div>
                <Link
                  to="/login"
                  className="mt-1 block text-[11px] font-medium text-violet-600 underline-offset-2 hover:underline"
                >
                  Login to unlock your contract pricing
                </Link>
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
                onClick={() => downloadMockDocument(`${product.name} data sheet`)}
                className="flex w-full items-center gap-2 border-b py-3 text-brand-700 transition-all duration-200 hover:translate-x-1"
              >
                <FileIcon />
                Product data sheet
              </button>

              <button
                onClick={() => downloadMockDocument(`${product.name} warranty`)}
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

function downloadMockDocument(name) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([`PhsarDom Wholesale\n${name}\nProduct documentation available in the local frontend workspace.`], { type: 'text/plain' }))
  link.download = `${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.txt`
  link.click()
  URL.revokeObjectURL(link.href)
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
