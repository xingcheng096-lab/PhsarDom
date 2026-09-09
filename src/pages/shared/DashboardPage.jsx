import {
  BriefcaseBusiness,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  Package,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Truck,
  UserCheck,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import {
  ChartCard,
  InfoBox,
  StatCard,
} from "../../components/cards/DashboardCards";
import {
  ConversionChart,
  BuyerGrowthChart,
  CategoryBarChart,
  OrdersChart,
  PipelineChart,
  RepPerformanceChart,
  RevenueChart,
  StatusDonutChart,
} from "../../components/charts/BusinessCharts";
import DataTable from "../../components/tables/DataTable";
import { Card, StatusBadge } from "../../components/ui";
import {
  activityLogs,
  buyers,
  inventory,
  purchaseOrders,
  quotations,
  rfqs,
  shipments,
} from "../../data";
import { assignedPipeline, bookedValueByRep, buyerGrowthSeries, categoryRevenue, conversionSeries, dealPipeline, invoiceStatus, orderSeries, revenueSeries, rfqStatusData } from "../../data/chartData";
import { currency } from "../../utils/format";

const dashboardConfig = {
  buyer: {
    title: "Buyer Dashboard",
    description:
      "Welcome to PhsarDom. Purchasing activity for Atlas Hospitality Group.",
    cards: [
      ["Open RFQs", "1", ClipboardList, "blue", "1 awaiting response"],
      ["Active Quotations", "1", FileCheck2, "violet", "Expires Sep 20"],
      ["Purchase Orders", "1", ShoppingCart, "green", "1 in fulfillment"],
      ["Outstanding Invoices", "$68.4K", Receipt, "amber", "Net-60 terms"],
    ],
  },
  sales: {
    title: "Sales Workspace",
    description: "Welcome to PhsarDom. Review assigned accounts and daily priorities.",
    cards: [
      ["New RFQs", "2", ClipboardList, "blue", "1 assigned today"],
      ["Open Quotes", "3", FileCheck2, "violet", "2 require follow-up"],
      ["Pending POs", "2", ShoppingCart, "amber", "1 requires review"],
      ["Sales Value", "$428K", CircleDollarSign, "green", "8.4%", "this month"],
    ],
  },
  manager: {
    title: "Sales Management",
    description:
      "Welcome to PhsarDom. Review performance, approvals, and team activity.",
    cards: [
      ["Revenue", "$572K", TrendingUp, "green", "6.3%", "this month"],
      ["Open RFQs", "4", ClipboardList, "blue", "2 under review"],
      ["Approval Queue", "3", ClipboardCheck, "amber", "2 pricing exceptions"],
      ["Active Contracts", "2", BriefcaseBusiness, "violet", "1 renewal due"],
    ],
  },
  admin: {
    title: "Executive Dashboard",
    description: "Welcome to PhsarDom. Monitor commercial, finance, and operational health.",
    cards: [
      ["Revenue", "$572K", CircleDollarSign, "green", "6.3%", "this month"],
      ["Active Buyers", "4", Users, "blue", "1 pending verification"],
      ["Open RFQs", "4", ClipboardList, "violet", "1 new today"],
      ["Pending POs", "1", ShoppingCart, "amber", "Requires approval"],
    ],
  },
};
const poColumns = [
  { key: "number", label: "PO Number", primary: true },
  { key: "buyer", label: "Buyer" },
  { key: "amount", label: "Amount" },
  { key: "delivery", label: "Delivery" },
  { key: "status", label: "Status" },
];
const rfqColumns = [
  { key: "number", label: "RFQ", primary: true },
  { key: "buyer", label: "Buyer" },
  { key: "product", label: "Product" },
  { key: "quantity", label: "Quantity" },
  { key: "status", label: "Status" },
];
export default function DashboardPage({ role }) {
  const cfg = dashboardConfig[role];
  const navigate = useNavigate();
  const root = role;
  const buyerQuotes = quotations.filter(
    (x) => x.buyer === "Atlas Hospitality Group",
  );
  const buyerPOs = purchaseOrders.filter(
    (x) => x.buyer === "Atlas Hospitality Group",
  );
  const salesRfqs = rfqs.filter((x) => x.rep === "Daniel Brooks");
  const currentRfqs =
    role === "buyer"
      ? rfqs.filter((x) => x.buyer === "Atlas Hospitality Group")
      : role === "sales"
        ? salesRfqs
        : rfqs;
  const currentPOs = role === "buyer" ? buyerPOs : purchaseOrders;
  const [period,setPeriod]=useState(6);
  const periodAction=<select aria-label="Chart period" value={period} onChange={(event)=>setPeriod(Number(event.target.value))} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px]"><option value="3">3 Months</option><option value="6">6 Months</option></select>;
  const salesValueData=quotations.filter((quote)=>['Atlas Hospitality Group','Redwood Health Network'].includes(quote.buyer)).map((quote)=>({name:quote.buyer.replace(/ (Group|Network)$/,''),value:quote.amount}));
  const buyerOrderStatuses=Object.values(buyerPOs.reduce((result,order)=>{result[order.status]||={name:order.status,value:0};result[order.status].value+=1;return result},{}));
  return (
    <>
      <PageHeader
        title={cfg.title}
        description={cfg.description}
        actions={
          <button className="btn-secondary" onClick={() => window.print()}>
            Export snapshot
          </button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cfg.cards.map(([label, value, Icon, tone, trend, context]) => (
          <StatCard
            key={label}
            label={label}
            value={value}
            icon={Icon}
            tone={tone}
            trend={trend?.includes("%") ? trend : undefined}
            context={trend?.includes("%") ? context : trend}
          />
        ))}
      </div>
      {role === "admin" && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InfoBox
            label="Overdue Invoices"
            value="$18.8K"
            context="1 buyer account"
            icon={Receipt}
            tone="red"
          />
          <InfoBox
            label="Low Stock Products"
            value="2"
            context="1 backordered"
            icon={Package}
            tone="amber"
          />
          <InfoBox
            label="Pending Verification"
            value="1"
            context="Submitted Aug 29"
            icon={UserCheck}
            tone="blue"
          />
          <InfoBox
            label="Active Contracts"
            value="2"
            context="1 expiring soon"
            icon={FileCheck2}
            tone="violet"
          />
        </div>
      )}
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {role==='buyer'&&<><ChartCard title="Purchasing Spend" subtitle="Booked purchase order value"><CategoryBarChart data={buyerPOs.map((order)=>({period:order.created.slice(0,7),value:order.amount}))} labelKey="period" name="PO Spend" format="currency"/></ChartCard><ChartCard title="Orders by Status" subtitle="Current purchase order position"><StatusDonutChart data={buyerOrderStatuses} label="Buyer orders by status"/></ChartCard></>}
        {role==='sales'&&<><ChartCard title="My Sales Pipeline Value" subtitle="Assigned quotation value by buyer"><CategoryBarChart data={salesValueData} labelKey="name" name="Quote Value" format="currency"/></ChartCard><ChartCard title="RFQ Activity" subtitle="Assigned requests by current status"><StatusDonutChart data={rfqStatusData.filter((item)=>salesRfqs.some((rfq)=>rfq.status===item.name))} label="Assigned RFQ status"/></ChartCard><ChartCard title="Quotation Conversion" subtitle="Enterprise benchmark" action={periodAction}><ConversionChart data={conversionSeries.slice(-period)}/></ChartCard><ChartCard title="My Deal Pipeline" subtitle="Current assigned opportunities"><PipelineChart data={assignedPipeline}/></ChartCard></>}
        {role==='manager'&&<><ChartCard title="Revenue Performance" subtitle="Recognized revenue" action={periodAction}><RevenueChart data={revenueSeries.slice(-period)}/></ChartCard><ChartCard title="Quote Conversion" subtitle="Accepted quotations" action={periodAction}><ConversionChart data={conversionSeries.slice(-period)}/></ChartCard><ChartCard title="Sales Rep Performance" subtitle="Booked PO value by account owner"><RepPerformanceChart data={bookedValueByRep}/></ChartCard><ChartCard title="Deal Pipeline" subtitle="Commercial stages"><PipelineChart data={dealPipeline}/></ChartCard></>}
        {role==='admin'&&<><ChartCard title="Revenue Trend" subtitle="Recognized monthly revenue" action={periodAction}><RevenueChart data={revenueSeries.slice(-period)}/></ChartCard><ChartCard title="Orders Trend" subtitle="Purchase orders and completions" action={periodAction}><OrdersChart data={orderSeries.slice(-period)}/></ChartCard><ChartCard title="Buyer Growth" subtitle="New and active verified buyers" action={periodAction}><BuyerGrowthChart data={buyerGrowthSeries.slice(-period)}/></ChartCard><ChartCard title="RFQ / Quote Conversion" subtitle="Monthly acceptance rate" action={periodAction}><ConversionChart data={conversionSeries.slice(-period)}/></ChartCard><ChartCard title="Quoted Value by Category" subtitle="Current commercial pipeline"><CategoryBarChart data={categoryRevenue} name="Quoted Value" format="currency"/></ChartCard><ChartCard title="Invoice Status Distribution" subtitle="Current receivables"><StatusDonutChart data={invoiceStatus} label="Invoice status distribution"/></ChartCard></>}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <section className="min-w-0">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            {role === "buyer" ? "Recent Quotations" : "Recent RFQs"}
          </h2>
          <DataTable
            rows={role === "buyer" ? buyerQuotes : currentRfqs}
            columns={
              role === "buyer"
                ? [
                    { key: "number", label: "Quote", primary: true },
                    { key: "amount", label: "Amount" },
                    { key: "expiry", label: "Expiry" },
                    { key: "status", label: "Status" },
                  ]
                : rfqColumns
            }
            pageSize={4}
            caption="Recent commercial activity"
            onView={(row) =>
              navigate(
                `/${root}/${role === "buyer" ? "quotations" : "rfqs"}/${row.id}`,
              )
            }
          />
        </section>
        <section className="min-w-0">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            Recent Purchase Orders
          </h2>
          <DataTable
            rows={currentPOs}
            columns={poColumns}
            pageSize={4}
            caption="Recent purchase orders"
            onView={(row) => navigate(`/${root}/purchase-orders/${row.id}`)}
          />
        </section>
      </div>
      {role === "buyer" && (
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <Card title="Credit Usage">
            <div className="flex justify-between">
              <strong className="text-2xl">{currency(162500)}</strong>
              <span className="text-xs text-slate-500">
                of {currency(250000)}
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[65%] rounded-full bg-brand-600 transition-[width] duration-700" />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>65% utilized</span>
              <span>{currency(87500)} available</span>
            </div>
          </Card>
          <Card title="Shipment Tracking" className="lg:col-span-2">
            {shipments
              .filter((x) => x.buyer === "Atlas Hospitality Group")
              .map((s) => (
                <button
                  onClick={() => navigate(`/buyer/shipments/${s.id}`)}
                  className="flex w-full items-center justify-between border-b py-2.5 text-left last:border-0"
                  key={s.id}
                >
                  <span className="flex items-center gap-3">
                    <Truck size={17} className="text-brand-600" />
                    <span>
                      <strong className="block text-xs">{s.number}</strong>
                      <small>
                        {s.carrier} · {s.tracking}
                      </small>
                    </span>
                  </span>
                  <StatusBadge status={s.status} />
                </button>
              ))}
          </Card>
        </div>
      )}
      {role === "admin" && (
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <Card
            title="Pending Buyer Verification"
            action={
              <button
                onClick={() => navigate("/admin/buyers/pending")}
                className="text-xs font-semibold text-brand-700"
              >
                View queue
              </button>
            }
          >
            {buyers
              .filter((b) => b.status === "Pending")
              .map((b) => (
                <button
                  onClick={() => navigate(`/admin/buyers/${b.id}`)}
                  className="flex w-full items-center justify-between border-b py-3 text-left"
                  key={b.id}
                >
                  <span>
                    <strong className="block text-xs">{b.business}</strong>
                    <small>
                      {b.industry} · {b.contact}
                    </small>
                  </span>
                  <StatusBadge status={b.status} />
                </button>
              ))}
          </Card>
          <Card title="Low Stock Products">
            {inventory
              .filter((x) => x.status !== "Healthy")
              .map((x) => (
                <div
                  className="flex items-center justify-between border-b py-3"
                  key={x.id}
                >
                  <span>
                    <strong className="block text-xs">{x.product}</strong>
                    <small>
                      {x.warehouse} · Reorder at {x.reorderPoint}
                    </small>
                  </span>
                  <StatusBadge status={x.status} />
                </div>
              ))}
          </Card>
          <Card title="Recent Activity" className="xl:col-span-2">
            {activityLogs.map((log) => (
              <div
                className="grid gap-1 border-b py-3 sm:grid-cols-[145px_160px_1fr]"
                key={log.id}
              >
                <small>{log.time}</small>
                <strong className="text-xs">{log.user}</strong>
                <span>{log.description}</span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </>
  );
}
