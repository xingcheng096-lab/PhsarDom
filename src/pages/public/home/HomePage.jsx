
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BadgeDollarSign,
  BarChart3,
  Boxes,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Globe2,
  Headphones,
  Layers3,
  LockKeyhole,
  Package,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  Zap,
} from "lucide-react";

import heroImage from "../../../assets/phsardom-hero.png";
import electronicsImage from "../../../assets/electronics.png";
import safetyImage from "../../../assets/safety.png";
import packagingImage from "../../../assets/packaging.png";
import furnitureImage from "../../../assets/furniture.jpg";
import cleaningImage from "../../../assets/category-cleaning.jpg";
import toolsImage from "../../../assets/category-tools.jpg";

const categories = [
  {
    name: "Electronics",
    subtitle: "Business technology",
    image: electronicsImage,
  },
  {
    name: "Safety Equipment",
    subtitle: "Industrial protection",
    image: safetyImage,
  },
  {
    name: "Packaging",
    subtitle: "Shipping & fulfillment",
    image: packagingImage,
  },
  {
    name: "Office Furniture",
    subtitle: "Modern workspaces",
    image: furnitureImage,
  },
  {
    name: "Cleaning Supplies",
    subtitle: "Facility essentials",
    image: cleaningImage,
  },
  {
    name: "Tools",
    subtitle: "Professional hardware",
    image: toolsImage,
  },
];

const metrics = [
  { Icon: Boxes, value: "12K+", label: "Product Listings" },
  { Icon: Users, value: "304", label: "Business Buyers" },
  { Icon: TrendingUp, value: "$2.8M", label: "Monthly Volume" },
  { Icon: Truck, value: "98.4%", label: "On-Time Delivery" },
];

const capabilities = [
  {
    Icon: Search,
    number: "01",
    title: "Wholesale Product Discovery",
    description:
      "Find commercial products with transparent minimum order quantities, supplier information, and pricing tiers.",
    tags: ["Product Catalog", "MOQ", "Supplier Search"],
  },
  {
    Icon: BadgeDollarSign,
    number: "02",
    title: "Tiered & Contract Pricing",
    description:
      "Compare quantity-based discounts and negotiate pricing structures tailored to business purchasing needs.",
    tags: ["Volume Discounts", "Buyer Pricing"],
  },
  {
    Icon: FileText,
    number: "03",
    title: "RFQ & Quote Negotiation",
    description:
      "Create quotation requests, review commercial proposals, and manage counter-offers in a structured workflow.",
    tags: ["RFQ", "Counter-Offers", "Approvals"],
  },
  {
    Icon: PackageCheck,
    number: "04",
    title: "Purchase Order Management",
    description:
      "Manage orders, commercial terms, fulfillment milestones, and shipment status from one connected platform.",
    tags: ["Purchase Orders", "Logistics"],
  },
];

const process = [
  {
    Icon: Building2,
    step: "01",
    title: "Register Your Business",
    description:
      "Create your company account and complete the business onboarding process.",
  },
  {
    Icon: Search,
    step: "02",
    title: "Discover & Compare",
    description:
      "Browse commercial products, minimum quantities, and volume pricing.",
  },
  {
    Icon: ClipboardCheck,
    step: "03",
    title: "Negotiate & Approve",
    description:
      "Submit RFQs, review quotations, and agree on commercial terms.",
  },
  {
    Icon: Truck,
    step: "04",
    title: "Order & Track",
    description:
      "Create purchase orders and follow fulfillment and delivery milestones.",
  },
];

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-11 flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-[700px]">
        <div className="mb-4 flex items-center gap-3">
          <span className="h-[2px] w-7 bg-blue-600" />
          <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-700">
            {eyebrow}
          </span>
        </div>

        <h2 className="text-3xl font-black leading-tight tracking-tight text-[#0B1930] md:text-[40px]">
          {title}
        </h2>

        {description && (
          <p className="mt-4 text-base leading-8 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

function CategoryCard({ category }) {
  return (
    <Link
      to={`/products?category=${encodeURIComponent(category.name)}`}
      className="group relative overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/10"
    >
      <div className="relative h-[205px] overflow-hidden bg-slate-100">
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />
      </div>

      <div className="flex items-center justify-between gap-4 p-5">
        <div>
          <h3 className="text-lg font-extrabold text-[#0B1930]">
            {category.name}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {category.subtitle}
          </p>
        </div>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition-all group-hover:bg-blue-600 group-hover:text-white">
          <ArrowUpRight size={20} />
        </span>
      </div>
    </Link>
  );
}

export function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      {/* HERO */}
      <section className="relative isolate min-h-[740px] overflow-hidden bg-[#031F36] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#031F36]/95 via-[#032A47]/85 to-[#032A47]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#031F36]/65 via-transparent to-transparent" />

        <div className="relative mx-auto flex min-h-[740px] max-w-[1500px] flex-col justify-center px-6 py-20 lg:px-12 xl:px-16">
          <div className="max-w-[690px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-cyan-300 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              The Future of B2B Wholesale
            </div>

            <h1 className="mt-8 text-[46px] font-black leading-[1.12] tracking-[-0.035em] sm:text-6xl xl:text-[72px]">
              Smarter Sourcing.
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-400 bg-clip-text text-transparent">
                Stronger Business.
              </span>
              <br />
              Better Growth.
            </h1>

            <p className="mt-7 max-w-[570px] text-base leading-8 text-slate-200 md:text-lg">
              Connect your business to a modern wholesale
              marketplace. Discover products, negotiate
              competitive pricing, manage RFQs, and streamline
              enterprise purchasing.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center gap-4 rounded-xl bg-[#0877F9] px-7 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-950/30 transition hover:bg-blue-500"
              >
                Start Your Business Account
                <ArrowRight
                  size={19}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/products"
                className="inline-flex items-center gap-3 rounded-xl border border-white/35 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                Explore Marketplace
                <ArrowUpRight size={18} />
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-4">
              {[
                "Verified Businesses",
                "Volume Pricing",
                "Secure Procurement",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-200"
                >
                  <CheckCircle2 size={17} className="text-cyan-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* HERO METRICS */}
          <div className="mt-14 grid grid-cols-2 gap-3 lg:absolute lg:bottom-9 lg:right-12 lg:mt-0 lg:w-[56%] lg:grid-cols-4">
            {metrics.map(({ Icon, value, label }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/20 bg-[#073552]/80 p-5 shadow-2xl backdrop-blur-xl"
              >
                <Icon size={24} className="mb-3 text-cyan-400" />
                <strong className="block text-2xl font-black tracking-tight">
                  {value}
                </strong>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-5 px-6 py-8 lg:grid-cols-4 lg:px-10">
          {[
            { Icon: ShieldCheck, text: "Business Verification" },
            { Icon: BadgeDollarSign, text: "Transparent Wholesale Pricing" },
            { Icon: FileCheck2, text: "Structured Procurement" },
            { Icon: Truck, text: "Order & Delivery Tracking" },
          ].map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Icon size={22} />
              </span>
              <span className="text-sm font-bold text-slate-700">
                {text}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bg-[#F5F7FB] py-20">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <SectionHeading
            eyebrow="Explore Our Marketplace"
            title="Shop by Business Category"
            description="Discover professional wholesale products across the categories your business relies on."
            action={
              <Link
                to="/categories"
                className="inline-flex items-center gap-3 rounded-xl border border-blue-200 bg-white px-6 py-3.5 text-sm font-extrabold text-blue-700 transition hover:bg-blue-50"
              >
                All Categories
                <ArrowRight size={18} />
              </Link>
            }
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.name} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM CAPABILITIES */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <SectionHeading
            eyebrow="Enterprise Commerce Solutions"
            title="Everything Your Business Needs to Buy at Scale"
            description="A unified B2B purchasing experience, from product discovery and price negotiation to purchase orders and delivery."
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {capabilities.map(
              ({ Icon, number, title, description, tags }) => (
                <div
                  key={title}
                  className="group relative overflow-hidden rounded-[22px] border border-slate-200 bg-white p-8 transition-all hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/5"
                >
                  <span className="absolute right-7 top-5 text-6xl font-black text-slate-50">
                    {number}
                  </span>

                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                    <Icon size={27} />
                  </div>

                  <h3 className="relative mt-7 text-xl font-black text-[#0B1930]">
                    {title}
                  </h3>

                  <p className="relative mt-3 max-w-[490px] text-sm leading-8 text-slate-500">
                    {description}
                  </p>

                  <div className="relative mt-6 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="bg-[#F5F7FB] py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <SectionHeading
            eyebrow="How It Works"
            title="From Sourcing to Delivery"
            description="A clear, structured procurement journey built for modern business buyers."
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {process.map(({ Icon, step, title, description }) => (
              <div
                key={step}
                className="relative rounded-[20px] border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                    <Icon size={26} />
                  </span>

                  <span className="text-4xl font-black text-slate-100">
                    {step}
                  </span>
                </div>

                <h3 className="mt-7 text-lg font-extrabold text-slate-950">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUSINESS VALUE */}
      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2 lg:px-10">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-[2px] w-7 bg-blue-600" />
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-700">
                Designed for Business
              </span>
            </div>

            <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-[42px]">
              Procurement Built Around
              <span className="block text-blue-700">
                Your Business Goals.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-500">
              PhsarDom brings together purchasing teams,
              sales representatives, and business operations
              through structured wholesale workflows.
            </p>

            <div className="mt-8 space-y-5">
              {[
                {
                  title: "Better Cost Visibility",
                  text: "Review pricing tiers and minimum order requirements before making purchasing decisions.",
                },
                {
                  title: "Clear Negotiation History",
                  text: "Keep quotation revisions and commercial discussions organized.",
                },
                {
                  title: "Connected Order Management",
                  text: "Follow purchasing milestones and fulfillment progress.",
                },
              ].map(({ title, text }) => (
                <div key={title} className="flex gap-4">
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Check size={17} />
                  </span>

                  <div>
                    <h3 className="font-extrabold text-slate-900">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm leading-7 text-slate-500">
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/about"
              className="mt-9 inline-flex items-center gap-3 font-extrabold text-blue-700 transition hover:text-blue-500"
            >
              Learn More About PhsarDom
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* PROCUREMENT WORKSPACE PREVIEW */}
          <div className="rounded-[28px] border border-slate-200 bg-[#F4F7FC] p-5 shadow-xl shadow-slate-900/5 md:p-8">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Procurement Overview
                  </p>
                  <h3 className="mt-1 text-lg font-black text-slate-900">
                    Business Workspace
                  </h3>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 p-5">
                {[
                  {
                    Icon: FileText,
                    value: "24",
                    label: "RFQ Requests",
                    tone: "bg-blue-50 text-blue-600",
                  },
                  {
                    Icon: ClipboardCheck,
                    value: "18",
                    label: "Open Quotes",
                    tone: "bg-violet-50 text-violet-600",
                  },
                  {
                    Icon: Package,
                    value: "42",
                    label: "Purchase Orders",
                    tone: "bg-cyan-50 text-cyan-600",
                  },
                  {
                    Icon: Truck,
                    value: "12",
                    label: "Shipments",
                    tone: "bg-emerald-50 text-emerald-600",
                  },
                ].map(({ Icon, value, label, tone }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-100 p-4"
                  >
                    <div className={`inline-flex rounded-lg p-2 ${tone}`}>
                      <Icon size={19} />
                    </div>
                    <p className="mt-3 text-2xl font-black text-slate-900">
                      {value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 px-5 py-5">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Procurement Workflow
                  </h4>
                  <span className="text-xs font-semibold text-blue-600">
                    Overview
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {[
                    "RFQ",
                    "Quote",
                    "Approval",
                    "PO",
                    "Delivery",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex min-w-0 flex-1 flex-col items-center gap-2"
                    >
                      <div
                        className={`h-2 w-full rounded-full ${
                          index < 3 ? "bg-blue-600" : "bg-slate-200"
                        }`}
                      />
                      <span className="text-[10px] font-semibold text-slate-500">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-slate-400">
              Illustrative workspace preview
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#F5F7FB] px-6 py-20 lg:px-10">
        <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[28px] bg-gradient-to-r from-[#062C4B] via-[#074A7A] to-[#0874BE] px-8 py-14 text-white md:px-14">
          <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -right-8 -top-12 h-60 w-60 rounded-full border border-white/10" />

          <div className="relative flex flex-col items-start justify-between gap-9 lg:flex-row lg:items-center">
            <div className="max-w-[680px]">
              <div className="mb-5 flex items-center gap-2 text-sm font-bold text-cyan-300">
                <Sparkles size={19} />
                Your Next Business Opportunity Starts Here
              </div>

              <h2 className="text-3xl font-black leading-tight md:text-[42px]">
                Grow Your Business with
                <span className="block text-cyan-300">
                  Smarter Wholesale.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-base leading-8 text-blue-100">
                Explore business products, compare wholesale
                pricing, and manage your procurement journey
                through PhsarDom.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-3 rounded-xl bg-white px-7 py-4 text-sm font-extrabold text-blue-800 transition hover:bg-blue-50"
              >
                Create Business Account
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/products"
                className="inline-flex items-center gap-3 rounded-xl border border-white/35 bg-white/10 px-7 py-4 text-sm font-bold text-white transition hover:bg-white/20"
              >
                Browse Products
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
