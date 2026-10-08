
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Boxes,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  Globe2,
  Handshake,
  LockKeyhole,
  Package,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users,
  WalletCards,
} from "lucide-react";

const features = [
  {
    icon: Boxes,
    title: "Wholesale Product Catalog",
    description:
      "Discover commercial products with transparent minimum order quantities, structured categories, and volume-based pricing.",
  },
  {
    icon: ClipboardList,
    title: "RFQ & Negotiation",
    description:
      "Create requests for quotations, review offers, negotiate commercial terms, and convert accepted quotations into purchase orders.",
  },
  {
    icon: WalletCards,
    title: "Credit & Payment Terms",
    description:
      "Support business purchasing workflows with credit limits, Net-30 or Net-60 terms, and payment schedule visibility.",
  },
  {
    icon: Truck,
    title: "Logistics & Fulfillment",
    description:
      "Track shipment planning, order fulfillment, partial deliveries, and warehouse-related operations.",
  },
  {
    icon: ShieldCheck,
    title: "Buyer Verification",
    description:
      "Review business information, supporting documents, and account approval decisions through structured KYC workflows.",
  },
  {
    icon: BarChart3,
    title: "Business Reporting",
    description:
      "Explore operational dashboards and reporting interfaces for purchasing, sales, inventory, and logistics.",
  },
];

const workflow = [
  {
    number: "01",
    icon: Building2,
    title: "Create Business Account",
    description:
      "Register your company and provide business information.",
  },
  {
    number: "02",
    icon: FileCheck2,
    title: "Complete Verification",
    description:
      "Submit business documents for account review.",
  },
  {
    number: "03",
    icon: ShoppingCart,
    title: "Source Wholesale Products",
    description:
      "Browse products, compare pricing tiers, and review MOQ requirements.",
  },
  {
    number: "04",
    icon: Handshake,
    title: "Negotiate & Order",
    description:
      "Submit RFQs, negotiate quotations, and create purchase orders.",
  },
];

const values = [
  {
    icon: LockKeyhole,
    title: "Trust & Accountability",
    description:
      "Structured approvals and clear business records help teams make informed decisions.",
  },
  {
    icon: TrendingUp,
    title: "Operational Efficiency",
    description:
      "Connected workflows reduce unnecessary steps across procurement and fulfillment.",
  },
  {
    icon: Globe2,
    title: "Business Connectivity",
    description:
      "A unified marketplace experience connects wholesale sourcing with enterprise operations.",
  },
];

const technologies = [
  "React",
  "Vite",
  "Tailwind CSS",
  "React Router",
  "Modular Components",
  "Role-Based UI",
];

function SectionLabel({ children }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-blue-700">
      <span className="h-2 w-2 rounded-full bg-cyan-500" />
      {children}
    </span>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-700 group-hover:text-white">
        <Icon size={26} strokeWidth={1.8} />
      </div>

      <h3 className="mt-6 text-lg font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-600">
        {description}
      </p>
    </article>
  );
}

export function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[#062B49] text-white">
        <div className="pointer-events-none absolute -right-32 -top-48 h-[650px] w-[650px] rounded-full bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-[350px] w-[500px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto grid min-h-[540px] max-w-[1440px] items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:px-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-cyan-300">
              <BadgeCheck size={16} />
              About PhsarDom
            </div>

            <h1 className="mt-8 text-4xl font-black leading-[1.12] tracking-tight md:text-5xl xl:text-[62px]">
              Building a Smarter
              <span className="mt-2 block bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Wholesale Future.
              </span>
            </h1>

            <p className="mt-7 max-w-[610px] text-base leading-8 text-slate-300 md:text-lg">
              PhsarDom is a B2B wholesale e-commerce platform concept
              designed to simplify business sourcing, quotation
              negotiation, purchase orders, and enterprise procurement
              workflows.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-3 rounded-xl bg-blue-600 px-7 py-4 text-sm font-bold text-white transition hover:bg-blue-500"
              >
                Explore Products
                <ArrowRight size={19} />
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center gap-3 rounded-xl border border-white/30 bg-white/10 px-7 py-4 text-sm font-bold text-white transition hover:bg-white/20"
              >
                Create Business Account
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="relative">
            <div className="rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
              <div className="rounded-2xl bg-white p-6 text-slate-900">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <Package size={25} />
                    </div>
                    <div>
                      <p className="text-base font-extrabold">
                        PhsarDom Platform
                      </p>
                      <p className="text-xs text-slate-500">
                        Enterprise Procurement
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    B2B Platform
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  {[
                    {
                      icon: PackageCheck,
                      title: "Product Catalog",
                      value: "MOQ & Pricing",
                    },
                    {
                      icon: ClipboardList,
                      title: "RFQ Management",
                      value: "Negotiations",
                    },
                    {
                      icon: WalletCards,
                      title: "Purchase Orders",
                      value: "Credit Terms",
                    },
                    {
                      icon: Truck,
                      title: "Logistics",
                      value: "Fulfillment",
                    },
                  ].map(({ icon: Icon, title, value }) => (
                    <div
                      key={title}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <Icon size={23} className="text-blue-600" />
                      <p className="mt-4 text-sm font-bold text-slate-900">
                        {title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-xl bg-blue-50 p-4">
                  <CheckCircle2
                    size={22}
                    className="shrink-0 text-blue-600"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Connected Business Workflows
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      From sourcing to fulfillment
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 hidden items-center gap-3 rounded-2xl border border-white/20 bg-[#123F61] px-5 py-4 shadow-xl md:flex">
              <ShieldCheck size={25} className="text-cyan-300" />
              <div>
                <p className="text-sm font-bold">
                  Structured Verification
                </p>
                <p className="text-xs text-slate-300">
                  Business Account Review
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="mx-auto grid max-w-[1440px] items-center gap-14 px-6 py-24 lg:grid-cols-2 lg:px-12">
        <div>
          <SectionLabel>Who We Are</SectionLabel>

          <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-4xl">
            A Modern Approach to
            <span className="block text-blue-700">
              Business Procurement
            </span>
          </h2>

          <p className="mt-6 text-base leading-8 text-slate-600">
            PhsarDom is developed as a university B2B wholesale
            e-commerce system project, focusing on the practical
            challenges businesses face when purchasing products
            in large quantities.
          </p>

          <p className="mt-5 text-base leading-8 text-slate-600">
            The platform brings product discovery, tiered pricing,
            quotation negotiations, buyer verification, purchase
            orders, and fulfillment information into a connected
            digital experience.
          </p>

          <div className="mt-8 space-y-4">
            {[
              "Transparent minimum order quantities and volume pricing",
              "Structured RFQ and purchase order workflows",
              "Role-based business operations and approvals",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2
                  size={21}
                  className="mt-0.5 shrink-0 text-blue-600"
                />
                <span className="text-sm font-medium text-slate-700">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] bg-[#F1F6FC] p-7 md:p-10">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-7 shadow-sm">
              <Building2 size={31} className="text-blue-600" />
              <h3 className="mt-5 text-xl font-bold">
                Enterprise Buyers
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Procurement teams managing bulk purchases,
                quotations, credit terms, and supplier orders.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 shadow-sm">
              <Users size={31} className="text-cyan-600" />
              <h3 className="mt-5 text-xl font-bold">
                Sales Teams
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Account executives handling buyer onboarding,
                pricing discussions, and quotation approvals.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 shadow-sm sm:col-span-2">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-blue-50 p-3">
                  <Globe2 size={27} className="text-blue-700" />
                </div>

                <div>
                  <h3 className="text-xl font-bold">
                    One Connected B2B Experience
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Bringing wholesale commerce and enterprise
                    operational workflows together in one system
                    design.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="bg-[#F5F8FC] py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="mx-auto max-w-[750px] text-center">
            <SectionLabel>Our Mission</SectionLabel>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              Simplifying Wholesale Commerce
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-600">
              Our project aims to demonstrate how a modern digital
              platform can make business procurement more transparent,
              organized, and efficient.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {values.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon size={27} />
                </div>

                <h3 className="mt-6 text-xl font-bold">
                  {title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-[1440px] px-6 py-24 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[720px]">
            <SectionLabel>Platform Capabilities</SectionLabel>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              Everything Businesses Need
              <span className="block text-blue-700">
                In One Workspace
              </span>
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-600">
              Explore the core functional areas represented in
              the PhsarDom wholesale e-commerce system.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="bg-[#F5F8FC] py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="text-center">
            <SectionLabel>How It Works</SectionLabel>

            <h2 className="mt-5 text-3xl font-black tracking-tight md:text-4xl">
              From Registration to Procurement
            </h2>

            <p className="mx-auto mt-5 max-w-[650px] text-base leading-8 text-slate-600">
              A structured business purchasing journey designed
              for enterprise buyers.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {workflow.map(
              ({ number, icon: Icon, title, description }) => (
                <article
                  key={number}
                  className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
                >
                  <span className="absolute right-6 top-5 text-4xl font-black text-slate-100">
                    {number}
                  </span>

                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Icon size={26} />
                  </div>

                  <h3 className="mt-7 text-lg font-bold text-slate-950">
                    {title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {description}
                  </p>
                </article>
              )
            )}
          </div>
        </div>
      </section>

      {/* UNIVERSITY PROJECT */}
      <section className="mx-auto max-w-[1440px] px-6 py-24 lg:px-12">
        <div className="grid gap-12 rounded-[28px] bg-[#082E4D] p-8 text-white lg:grid-cols-2 lg:items-center lg:p-14">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300">
              University Project
            </span>

            <h2 className="mt-5 text-3xl font-black leading-tight md:text-4xl">
              Designed & Developed
              <span className="block text-cyan-300">
                By a Six-Member Team
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-8 text-slate-300">
              PhsarDom is a student-developed project exploring
              persona-driven UX/UI design and modular frontend
              architecture for enterprise wholesale commerce.
              It is intended as an academic demonstration rather
              than a claim of live commercial operations.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-7">
            <h3 className="text-lg font-bold">
              Technology & Design Approach
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-300">
              Built around reusable components, structured
              navigation, enterprise workflows, and role-based
              user experiences.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {technologies.map((technology) => (
                <span
                  key={technology}
                  className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-slate-100"
                >
                  {technology}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#F5F8FC] py-20">
        <div className="mx-auto max-w-[1440px] px-6 text-center lg:px-12">
          <SectionLabel>Get Started</SectionLabel>

          <h2 className="mt-5 text-3xl font-black text-slate-950 md:text-4xl">
            Explore the PhsarDom Platform
          </h2>

          <p className="mx-auto mt-5 max-w-[650px] text-base leading-8 text-slate-600">
            Discover wholesale products, explore product
            categories, and experience structured B2B
            procurement workflows.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-3 rounded-xl bg-blue-600 px-8 py-4 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Browse Products
              <ArrowRight size={19} />
            </Link>

            <Link
              to="/categories"
              className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-8 py-4 text-sm font-bold text-slate-800 transition hover:bg-blue-50"
            >
              Explore Categories
              <Boxes size={19} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AboutPage;
