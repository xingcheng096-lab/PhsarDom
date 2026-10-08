
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Grid2X2,
  List,
  ArrowRight,
  Package,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

import * as productData from "../../../data/products";

import bannerImage from "../../../assets/categories-banner.jpg";

const sourceProducts =
  productData.products ||
  productData.default ||
  [];

function getPrice(product) {
  return Number(
    product.price ??
    product.basePrice ??
    product.unitPrice ??
    product.unit_price ??
    0
  );
}

function getMOQ(product) {
  return Number(
    product.moq ??
    product.minOrder ??
    product.minimumOrder ??
    product.minimum_order ??
    1
  );
}

function getName(product) {
  return product.name || product.title || "Unnamed Product";
}

function getImage(product) {
  return (
    product.image ||
    product.imageUrl ||
    product.image_url ||
    product.thumbnail ||
    ""
  );
}

function ProductCard({ product, listView = false }) {
  const price = getPrice(product);
  const moq = getMOQ(product);
  const name = getName(product);
  const image = getImage(product);

  const id = product.id ?? product.slug;
  const href = id
    ? `/products/${encodeURIComponent(id)}`
    : "/products";

  const stock =
    product.stockStatus ||
    product.stock_status ||
    product.availability ||
    "In Stock";

  return (
    <Link
      to={href}
      className={`group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl ${
        listView ? "flex flex-col sm:flex-row" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-slate-100 ${
          listView
            ? "h-56 sm:h-auto sm:w-64 sm:shrink-0"
            : "h-56"
        }`}
      >
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package size={54} className="text-slate-300" />
          </div>
        )}

        <span className="absolute left-4 top-4 rounded-full border border-emerald-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
          {stock}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
          {product.supplier || product.brand || "Wholesale Supplier"}
        </p>

        <h3 className="mt-2 line-clamp-2 min-h-12 text-lg font-bold text-slate-900">
          {name}
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          {product.category || "Commercial Products"}
          {product.sku ? ` Â· ${product.sku}` : ""}
        </p>

        <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs text-slate-500">Starting at</p>
            <strong className="text-2xl font-extrabold text-slate-900">
              ${price.toFixed(2)}
            </strong>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500">Minimum order</p>
            <strong className="text-sm text-slate-800">
              {moq} units
            </strong>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <Truck size={16} className="text-blue-600" />
          {product.shippingTime || "Business shipping available"}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">
          <span>Explore wholesale pricing</span>
          <ArrowRight size={17} />
        </div>
      </div>
    </Link>
  );
}

export function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("name");
  const [view, setView] = useState("grid");
  const [availability, setAvailability] = useState("all");
  const [moqFilter, setMoqFilter] = useState("all");

  const products = Array.isArray(sourceProducts)
    ? sourceProducts
    : [];

  const categories = useMemo(
    () =>
      [...new Set(products.map((p) => p.category).filter(Boolean))]
        .sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const name = getName(product).toLowerCase();
      const sku = String(product.sku || "").toLowerCase();
      const supplier = String(
        product.supplier || product.brand || ""
      ).toLowerCase();
      const productCategory = String(
        product.category || ""
      ).toLowerCase();

      const matchesSearch =
        !query ||
        [name, sku, supplier, productCategory].some((value) =>
          value.includes(query)
        );

      const matchesCategory =
        category === "all" || product.category === category;

      const matchesMOQ =
        moqFilter === "all" ||
        (moqFilter === "100" && getMOQ(product) <= 100) ||
        (moqFilter === "500" && getMOQ(product) <= 500);

      const stock = String(
        product.stockStatus ||
        product.stock_status ||
        product.availability ||
        "In Stock"
      ).toLowerCase();

      const matchesAvailability =
        availability === "all" ||
        stock.includes(availability);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMOQ &&
        matchesAvailability
      );
    });

    return result.sort((a, b) => {
      if (sort === "price-low") return getPrice(a) - getPrice(b);
      if (sort === "price-high") return getPrice(b) - getPrice(a);
      if (sort === "moq") return getMOQ(a) - getMOQ(b);

      return getName(a).localeCompare(getName(b));
    });
  }, [products, search, category, sort, availability, moqFilter]);

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setAvailability("all");
    setMoqFilter("all");
    setSort("name");
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      {/* HERO BANNER */}
      <section className="relative isolate overflow-hidden bg-[#eaf4ff]">
        <img
          src={bannerImage}
          alt="PhsarDom wholesale product categories"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/75 to-white/5" />

        <div className="relative mx-auto flex min-h-[300px] max-w-[1440px] items-center px-6 py-12 lg:px-10">
          <div className="max-w-xl">
            <span className="inline-flex rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              PhsarDom Â· B2B Marketplace
            </span>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
              Wholesale Product
              <span className="block text-blue-700">Catalog</span>
            </h1>

            <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
              Discover commercial products with transparent
              minimum order quantities and volume-based pricing.
            </p>

            <div className="mt-6 flex flex-wrap gap-5 text-sm font-medium text-slate-700">
              <span className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-blue-600" />
                Verified suppliers
              </span>

              <span className="flex items-center gap-2">
                <Package size={18} className="text-blue-600" />
                Bulk ordering
              </span>

              <span className="flex items-center gap-2">
                <Truck size={18} className="text-blue-600" />
                B2B logistics
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG */}
      <section className="mx-auto max-w-[1440px] px-6 py-10 lg:px-10">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
          {/* FILTER SIDEBAR */}
          <aside className="self-start rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-[calc(var(--public-navbar-height,4rem)+16px)] lg:max-h-[calc(100vh-var(--public-navbar-height,4rem)-32px)] lg:overflow-y-auto">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
              <SlidersHorizontal size={18} className="text-blue-700" />
              <h2 className="font-bold text-slate-900">
                Refine results
              </h2>
            </div>

            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Category
                </span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm"
                >
                  <option value="all">All categories</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Minimum order
                </span>
                <select
                  value={moqFilter}
                  onChange={(e) => setMoqFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm"
                >
                  <option value="all">Any MOQ</option>
                  <option value="100">Up to 100 units</option>
                  <option value="500">Up to 500 units</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Availability
                </span>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm"
                >
                  <option value="all">Any availability</option>
                  <option value="in stock">In Stock</option>
                  <option value="backordered">Backordered</option>
                  <option value="low stock">Low Stock</option>
                </select>
              </label>

              <button
                type="button"
                onClick={resetFilters}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw size={16} />
                Clear filters
              </button>
            </div>
          </aside>

          {/* PRODUCT CONTENT */}
          <div className="min-w-0">
            {/* STICKY SEARCH TOOLBAR */}
            <div className="sticky top-[var(--public-navbar-height,4rem)] z-40 rounded-xl border border-slate-200 bg-white p-3 shadow-md">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search product, SKU, supplier, or category"
                    className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-12 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-12 rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-700 md:w-52"
                >
                  <option value="name">Product name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="moq">Minimum order</option>
                </select>

                <div className="flex overflow-hidden rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setView("grid")}
                    aria-label="Grid view"
                    className={`flex h-12 w-12 items-center justify-center ${
                      view === "grid"
                        ? "bg-blue-700 text-white"
                        : "bg-white text-slate-600"
                    }`}
                  >
                    <Grid2X2 size={19} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setView("list")}
                    aria-label="List view"
                    className={`flex h-12 w-12 items-center justify-center ${
                      view === "list"
                        ? "bg-blue-700 text-white"
                        : "bg-white text-slate-600"
                    }`}
                  >
                    <List size={19} />
                  </button>
                </div>
              </div>
            </div>

            <p className="my-5 text-sm text-slate-500">
              Showing {filteredProducts.length} products
            </p>

            {filteredProducts.length ? (
              <div
                className={
                  view === "grid"
                    ? "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
                    : "grid grid-cols-1 gap-5"
                }
              >
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id ?? product.sku ?? index}
                    product={product}
                    listView={view === "list"}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center">
                <Package
                  size={44}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 text-xl font-bold text-slate-900">
                  No products found
                </h3>

                <p className="mt-2 text-slate-500">
                  Try changing your search or filters.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-600"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProductsPage;

