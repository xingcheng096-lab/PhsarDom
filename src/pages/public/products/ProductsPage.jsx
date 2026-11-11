
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search, SlidersHorizontal, Grid2X2, List, ArrowRight,
  Package, Truck, ShieldCheck, RotateCcw,
  Zap, Minus, Plus,
  ChevronDown, X, ArrowUpDown
} from "lucide-react";

import * as productData from "../../../data/products";
import bannerImage from "../../../assets/categories-banner.jpg";

const sourceProducts = productData.products || productData.default || [];

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);

function getName(p) {
  return p.name || p.title || "Unnamed Product";
}

function getMOQ(p) {
  const n = Number(
    p.moq ?? p.minOrder ?? p.minimumOrder ?? p.minimum_order ?? 1
  );
  return Number.isInteger(n) && n > 0 ? n : 1;
}

function getPrice(p) {
  const n = Number(
    p.price ?? p.basePrice ?? p.unitPrice ?? p.unit_price
  );
  return Number.isFinite(n) && n > 0 ? n : null;
}

function getImage(p) {
  return p.image || p.imageUrl || p.image_url || p.thumbnail || "";
}

function getId(p) {
  return p.id ?? p.slug ?? null;
}

function getStockLabel(p) {
  return String(
    p.stockStatus ?? p.stock_status ??
    p.availability ?? p.status ?? "Unknown"
  );
}

function getStockState(p) {
  const label = getStockLabel(p).toLowerCase();

  if (label.includes("backorder")) return "backorder";
  if (label.includes("out of stock") || label.includes("unavailable"))
    return "unavailable";
  if (label.includes("low stock")) return "low";
  if (label.includes("in stock")) return "available";
  return "unknown";
}

function getAvailableQuantity(p) {
  const raw = p.availableStock ?? p.available_stock ??
    p.stockQuantity ?? p.stock_quantity ?? p.stock;

  if (raw === undefined || raw === null || raw === "") return null;

  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function getTierPrice(p, quantity) {
  const tiers = Array.isArray(p.tiers) ? p.tiers : [];

  const valid = tiers
    .map((t) => ({
      min: Number(
        t.minQuantity ?? t.minQty ?? t.min ??
        t.quantity ?? t.from ?? 1
      ),
      price: Number(t.price ?? t.unitPrice),
    }))
    .filter(
      (t) =>
        Number.isFinite(t.min) &&
        t.min > 0 &&
        Number.isFinite(t.price) &&
        t.price > 0
    )
    .sort((a, b) => b.min - a.min);

  const tier = valid.find((t) => quantity >= t.min);

  return tier?.price ?? getPrice(p);
}

function canBuy(p, quantity) {
  if (getId(p) === null) return false;
  if (!Number.isInteger(quantity) || quantity < getMOQ(p)) return false;
  if (getTierPrice(p, quantity) === null) return false;

  const state = getStockState(p);
  if (state === "backorder" || state === "unavailable" || state === "unknown")
    return false;

  const available = getAvailableQuantity(p);
  if (available !== null && quantity > available) return false;

  return true;
}

function purchaseUrl(p, quantity) {
  const id = getId(p);
  const review = new URLSearchParams({
    productId: String(id),
    quantity: String(quantity),
    purchaseKey: `public-${id}-${quantity}`,
  });

  const destination = `/buyer/purchase-review?${review.toString()}`;
  return `/login?${new URLSearchParams({ from: destination })}`;
}

function StockBadge({ product }) {
  const state = getStockState(product);

  const styles = {
    available: "bg-emerald-50 text-emerald-700 border-emerald-200",
    low: "bg-amber-50 text-amber-700 border-amber-200",
    backorder: "bg-orange-50 text-orange-700 border-orange-200",
    unavailable: "bg-red-50 text-red-700 border-red-200",
    unknown: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${styles[state]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${
        state === "available" ? "bg-emerald-500" :
        state === "low" ? "bg-amber-500" :
        state === "backorder" ? "bg-orange-500" :
        state === "unavailable" ? "bg-red-500" : "bg-slate-400"
      }`} />
      {getStockLabel(product)}
    </span>
  );
}

function ProductCard({ product, listView = false }) {
  const moq = getMOQ(product);
  const [quantity, setQuantity] = useState(moq);

  const id = getId(product);
  const href = id !== null
    ? `/products/${encodeURIComponent(String(id))}`
    : "/products";

  const name = getName(product);
  const image = getImage(product);
  const unitPrice = getTierPrice(product, quantity);
  const total = unitPrice === null ? null : unitPrice * quantity;
  const eligible = canBuy(product, quantity);

  const changeQuantity = (next) => {
    const n = Number(next);
    if (Number.isInteger(n) && n >= moq && n <= 1000000) {
      setQuantity(n);
    }
  };

  return (
    <article className={`group relative flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.05)] transition-all duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_20px_48px_rgba(30,64,175,0.13)] ${
      listView ? "sm:flex-row" : ""
    }`}>
      <div className={`relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 ${
        listView ? "h-64 sm:h-auto sm:w-[38%] sm:shrink-0" : "h-60"
      }`}>
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.07]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package size={64} className="text-blue-200" />
          </div>
        )}

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-900/10 via-transparent to-white/20" />

        <div className="absolute left-4 top-4">
          <StockBadge product={product} />
        </div>

        <Link
          to={href}
          aria-label={`View ${name}`}
          className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/80 bg-white/90 text-blue-700 shadow-md backdrop-blur-sm transition hover:bg-blue-600 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          <ArrowRight size={19} />
        </Link>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-600">
          {product.supplier || product.brand || "Wholesale Supplier"}
        </p>

        <Link to={href} className="mt-2 line-clamp-2 text-lg font-extrabold leading-snug text-slate-900 hover:text-blue-700">
          {name}
        </Link>

        <p className="mt-2 text-xs text-slate-500">
          {product.category || "Commercial Products"}
          {product.sku ? ` · ${product.sku}` : ""}
        </p>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-2 border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs font-medium text-slate-500">Unit price</p>
            <p className="mt-1 text-2xl font-black tracking-tight text-blue-700">
              {unitPrice === null ? "Ask for price" : money(unitPrice)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500">Minimum order</p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {moq.toLocaleString()} units
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <Truck size={15} className="text-blue-600" />
          <span>
            {product.shippingTime || product.leadTime || "Lead time on request"}
          </span>
        </div>

        <div className="mt-4 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">
              Order quantity
            </span>
            <span className="text-xs font-bold text-blue-700">
              {total === null ? "Price unavailable" : `Subtotal ${money(total)}`}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => changeQuantity(quantity - 1)}
                disabled={quantity <= moq}
                aria-label={`Decrease ${name} quantity`}
                className="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30"
              >
                <Minus size={15} />
              </button>

              <input
                type="number"
                min={moq}
                step="1"
                value={quantity}
                aria-label={`${name} quantity`}
                onChange={(e) => changeQuantity(e.target.value)}
                className="h-10 w-16 border-x border-slate-200 text-center text-sm font-bold text-slate-900 outline-none"
              />

              <button
                type="button"
                onClick={() => changeQuantity(quantity + 1)}
                aria-label={`Increase ${name} quantity`}
                className="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-100"
              >
                <Plus size={15} />
              </button>
            </div>

            <Link
              to={href}
              className="text-xs font-semibold text-blue-700 hover:underline"
            >
              View tiers
            </Link>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <Link
            to={href}
            className="flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-2 text-center text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
          >
            View Details
          </Link>

          {eligible ? (
            <Link
              to={purchaseUrl(product, quantity)}
              className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-blue-700 px-2 text-center text-xs font-bold text-white shadow-lg shadow-blue-700/15 transition hover:bg-blue-800 active:scale-[0.98]"
            >
              <Zap size={15} />
              Buy Now
            </Link>
          ) : (
            <button
              type="button"
              disabled
              title="Direct purchase is unavailable for this quantity or stock status"
              className="flex min-h-11 items-center justify-center rounded-xl bg-slate-100 px-2 text-xs font-bold text-slate-500"
            >
              Unavailable
            </button>
          )}
        </div>

        {!eligible && (
          <p className="mt-2 text-center text-[11px] text-slate-500">
            Check availability or request purchasing terms.
          </p>
        )}
      </div>
    </article>
  );
}

export function ProductsPage() {
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "all");
  const [availability, setAvailability] = useState("all");
  const [moqFilter, setMoqFilter] = useState("all");
  const [sort, setSort] = useState("name");
  const [view, setView] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    setSearch(params.get("search") || "");
    setCategory(params.get("category") || "all");
  }, [params]);

  const products = useMemo(
    () => Array.isArray(sourceProducts) ? sourceProducts : [],
    []
  );

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products
      .filter((p) => {
        const searchable = [
          getName(p),
          p.sku,
          p.supplier,
          p.brand,
          p.category,
        ].map((v) => String(v || "").toLowerCase());

        const matchesSearch =
          !query || searchable.some((v) => v.includes(query));

        const matchesCategory =
          category === "all" || p.category === category;

        const state = getStockState(p);
        const matchesAvailability =
          availability === "all" || state === availability;

        const matchesMOQ =
          moqFilter === "all" ||
          (moqFilter === "100" && getMOQ(p) <= 100) ||
          (moqFilter === "500" && getMOQ(p) <= 500);

        return (
          matchesSearch &&
          matchesCategory &&
          matchesAvailability &&
          matchesMOQ
        );
      })
      .sort((a, b) => {
        if (sort === "price-low")
          return (getPrice(a) ?? Infinity) - (getPrice(b) ?? Infinity);

        if (sort === "price-high")
          return (getPrice(b) ?? -Infinity) - (getPrice(a) ?? -Infinity);

        if (sort === "moq") return getMOQ(a) - getMOQ(b);

        return getName(a).localeCompare(getName(b));
      });
  }, [products, search, category, availability, moqFilter, sort]);

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setAvailability("all");
    setMoqFilter("all");
    setSort("name");
  };

  const scrollToCatalog = () => {
    document.getElementById("product-catalog")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  const filterContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={19} className="text-blue-700" />
          <h2 className="font-extrabold text-slate-900">Filters</h2>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">
          Category
        </span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      <div>
        <p className="mb-3 text-sm font-bold text-slate-700">Availability</p>
        <div className="space-y-2">
          {[
            ["all", "All products"],
            ["available", "In Stock"],
            ["low", "Low Stock"],
            ["backorder", "Backordered"],
            ["unavailable", "Unavailable"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-blue-50"
            >
              <input
                type="radio"
                name={showMobileFilters ? "availability-mobile" : "availability-desktop"}
                checked={availability === value}
                onChange={() => setAvailability(value)}
                className="accent-blue-700"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">
          Minimum Order (MOQ)
        </span>
        <select
          value={moqFilter}
          onChange={(e) => setMoqFilter(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-blue-500"
        >
          <option value="all">Any MOQ</option>
          <option value="100">Up to 100 units</option>
          <option value="500">Up to 500 units</option>
        </select>
      </label>

      <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="flex items-center gap-2 text-blue-700">
          <ShieldCheck size={19} />
          <span className="text-sm font-bold">Business Purchasing</span>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          Review wholesale pricing and minimum quantities before placing
          your business order.
        </p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f4f7fc] text-slate-900">

      {/* COMPACT COMMERCE HERO — products remain the focus */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1440px] items-center gap-6 px-5 py-7 md:grid-cols-[1.2fr_0.8fr] md:px-8 md:py-9 lg:px-10">
          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-blue-700">
              <ShieldCheck size={14} /> PhsarDom wholesale marketplace
            </div>
            <h1 className="max-w-2xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-[44px]">
              Everything your business needs, <span className="text-blue-700">at wholesale prices.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              Compare products, check minimum quantities, and buy directly or request a quote.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="button" onClick={scrollToCatalog}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
                Browse products <ArrowRight size={17} />
              </button>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Package size={15} className="text-blue-700" /> {products.length} products in catalog
              </span>
            </div>
          </div>
          <div className="relative hidden h-48 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50 md:block lg:h-56">
            <img src={bannerImage} alt="Wholesale tools and business supplies" className="h-full w-full object-cover transition-transform duration-500 motion-safe:hover:scale-105" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-950/15 to-transparent" />
            <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/95 px-3 py-2 text-xs font-bold text-slate-800 shadow-md">
              <Truck size={17} className="text-blue-700" /> Wholesale supplies, simpler ordering
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG */}
      <section
        id="product-catalog"
        className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-8 md:px-8 lg:px-10"
      >
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">

          {/* DESKTOP FILTERS */}
          <aside className="hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            {filterContent}
          </aside>

          <div className="min-w-0">
            {/* SEARCH BAR */}
            <div className="sticky top-[var(--public-navbar-height,4rem)] z-30 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[180px] flex-1">
                  <Search
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products, SKU, supplier..."
                    aria-label="Search products"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowMobileFilters(true)}
                  className="flex h-12 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold lg:hidden"
                >
                  <SlidersHorizontal size={17} />
                  Filters
                </button>

                <div className="relative">
                  <ArrowUpDown size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    aria-label="Sort products"
                    className="h-12 max-w-[190px] appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
                  >
                    <option value="name">Product name</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="moq">Minimum order</option>
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                <div className="flex overflow-hidden rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setView("grid")}
                    aria-label="Grid view"
                    aria-pressed={view === "grid"}
                    className={`flex h-12 w-11 items-center justify-center ${
                      view === "grid" ? "bg-blue-700 text-white" : "text-slate-500"
                    }`}
                  >
                    <Grid2X2 size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    aria-label="List view"
                    aria-pressed={view === "list"}
                    className={`flex h-12 w-11 items-center justify-center ${
                      view === "list" ? "bg-blue-700 text-white" : "text-slate-500"
                    }`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>



            <div className="my-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Explore Products
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Showing {filteredProducts.length} products
                </p>
              </div>

              {(search || category !== "all" || availability !== "all" || moqFilter !== "all") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
                >
                  <RotateCcw size={14} />
                  Clear all filters
                </button>
              )}
            </div>

            {filteredProducts.length ? (
              <div className={
                view === "grid"
                  ? "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
                  : "grid grid-cols-1 gap-5"
              }>
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={getId(product) ?? product.sku ?? index}
                    product={product}
                    listView={view === "list"}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50">
                  <Package size={38} className="text-blue-400" />
                </div>
                <h3 className="mt-5 text-xl font-extrabold">No products found</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Try a different search or reset your filters.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white hover:bg-blue-800"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MOBILE FILTER PANEL */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setShowMobileFilters(false)}
            className="absolute inset-0 bg-slate-950/50"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Product filters"
            className="absolute right-0 top-0 flex h-full w-[min(360px,90vw)] flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="text-lg font-extrabold">Refine Products</h2>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                aria-label="Close filter panel"
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {filterContent}
            </div>
            <div className="border-t p-4">
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="w-full rounded-xl bg-blue-700 py-3 font-bold text-white"
              >
                Show {filteredProducts.length} Products
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ProductsPage;
