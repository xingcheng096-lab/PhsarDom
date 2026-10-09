
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Truck,
  ShieldCheck,
  Layers3,
  PackageCheck,
} from "lucide-react";

import bannerImage from "../../../assets/categories-banner1.jpg";
import electronicsImage from "../../../assets/electronics.png";
import safetyImage from "../../../assets/safety.png";
import packagingImage from "../../../assets/packaging.png";
import furnitureImage from "../../../assets/furniture.jpg";
import cleaningImage from "../../../assets/category-cleaning.jpg";
import toolsImage from "../../../assets/category-tools.jpg";

const categories = [
  {
    id: 1,
    name: "Electronics",
    description:
      "Workplace technology, electrical equipment and enterprise accessories.",
    image: electronicsImage,
    color: "blue",
  },
  {
    id: 2,
    name: "Safety Equipment",
    description:
      "Certified PPE, protective workwear and operational safety products.",
    image: safetyImage,
    color: "green",
  },
  {
    id: 3,
    name: "Packaging",
    description:
      "Shipping, storage, packaging and fulfillment materials.",
    image: packagingImage,
    color: "orange",
  },
  {
    id: 4,
    name: "Office Furniture",
    description:
      "Commercial workspace furniture, fixtures and office solutions.",
    image: furnitureImage,
    color: "purple",
  },
  {
    id: 5,
    name: "Cleaning Supplies",
    description:
      "Institutional cleaning, hygiene and facility maintenance products.",
    image: cleaningImage,
    color: "pink",
  },
  {
    id: 6,
    name: "Tools",
    description:
      "Professional power tools, hardware and maintenance equipment.",
    image: toolsImage,
    color: "yellow",
  },
];

const colors = {
  blue: "text-blue-600 bg-blue-50",
  green: "text-emerald-600 bg-emerald-50",
  orange: "text-orange-600 bg-orange-50",
  purple: "text-violet-600 bg-violet-50",
  pink: "text-pink-600 bg-pink-50",
  yellow: "text-amber-600 bg-amber-50",
};


function CategoryCard({ category }) {
  return (
    <Link
      to={`/products?category=${encodeURIComponent(category.name)}`}
      className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
    >
      <div className="relative h-[230px] overflow-hidden bg-slate-100">
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex min-h-[210px] flex-col p-6">
        <h3 className="text-xl font-extrabold tracking-tight text-slate-950">
          {category.name}
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          {category.description}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5">
          <span className="text-sm font-bold text-blue-700">
            Explore Category
          </span>

          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700 transition-all group-hover:translate-x-1 group-hover:bg-blue-600 group-hover:text-white">
            <ArrowRight size={19} />
          </span>
        </div>
      </div>
    </Link>
  );
}


export function CategoriesPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FB]">
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-white">
        {/* HERO BACKGROUND */}
<div
  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: `url(${bannerImage})`,
  }}
/>

{/* GRADIENT OVERLAY */}
<div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent" />

        <div className="relative mx-auto flex min-h-[410px] max-w-[1440px] items-center px-6 py-12 lg:px-10">
          <div className="max-w-[680px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              <Layers3 size={16} />
              PhsarDom · Product Range
            </div>

            <h1 className="mt-7 text-4xl font-black leading-[1.12] tracking-tight text-slate-950 md:text-5xl lg:text-[54px]">
              Explore Our
              <span className="block text-blue-700">
                Product Categories
              </span>
            </h1>

            <p className="mt-6 max-w-[600px] text-base leading-8 text-slate-600">
              Discover professional wholesale products across
              essential business categories. Built for reliable
              sourcing, bulk purchasing and enterprise operations.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <ShieldCheck size={19} className="text-blue-600" />
                Verified Suppliers
              </span>

              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Boxes size={19} className="text-blue-600" />
                Bulk Wholesale
              </span>

              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Truck size={19} className="text-blue-600" />
                Business Logistics
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-10">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-700">
              B2B Marketplace
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
              Shop by Category
            </h2>

            <p className="mt-3 text-sm text-slate-500">
              Find the right commercial products for your business.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-3 rounded-xl border border-blue-200 bg-white px-6 py-3.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
          >
            View All Products
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* BUSINESS CTA */}
      <section className="mx-auto max-w-[1440px] px-6 pb-16 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-8 rounded-[24px] bg-gradient-to-r from-[#07375C] to-[#0863A6] px-8 py-10 text-white md:flex-row md:items-center lg:px-12">
          <div>
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-cyan-300">
              <PackageCheck size={20} />
              Wholesale Business Solutions
            </div>

            <h2 className="text-2xl font-extrabold md:text-3xl">
              Ready to source products at scale?
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100">
              Explore wholesale products, compare pricing tiers
              and discover sourcing opportunities for your business.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex shrink-0 items-center gap-3 rounded-xl bg-white px-7 py-4 text-sm font-bold text-blue-800 transition hover:bg-blue-50"
          >
            Browse Products
            <ArrowRight size={19} />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default CategoriesPage;
