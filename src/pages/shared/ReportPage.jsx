import { useState } from "react";
import {
  Boxes,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  FileCheck2,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { ChartCard, StatCard } from "../../components/cards/DashboardCards";
import {
  ConversionChart,
  BuyerGrowthChart,
  CategoryBarChart,
  InventoryPositionChart,
  OrdersChart,
  RevenueChart,
  StatusDonutChart,
} from "../../components/charts/BusinessCharts";
import { Alert, Card } from "../../components/ui";
import { buyers, invoices, products, purchaseOrders } from "../../data";
import { buyerGrowthSeries, categoryRevenue, conversionSeries, inventoryByWarehouse, inventoryValueByProduct, invoiceStatus, orderSeries, receivablesByMonth, revenueSeries } from "../../data/chartData";
import { currency } from "../../utils/format";

const cfg = {
  sales: {
    title: "Sales Report",
    description:
      "Revenue, order volume, deal size, and quotation effectiveness.",
    cards: [
      ["Revenue", "$2.92M", CircleDollarSign, "green", "8.4%", "period growth"],
      ["Orders", "983", ShoppingCart, "blue", null, "193 this month"],
      [
        "Average Deal Size",
        "$18.6K",
        TrendingUp,
        "violet",
        "3.1%",
        "period growth",
      ],
      ["Quote Conversion", "67%", FileCheck2, "amber", "4.0%", "period growth"],
    ],
    primary: "Revenue Trend",
    secondary: "Quote Conversion",
  },
  buyers: {
    title: "Buyer Report",
    description: "Verified account growth, value, and retention performance.",
    cards: [
      ["Active Buyers", "304", Users, "blue", "5.2%", "period growth"],
      ["New Buyers", "33", Users, "green", null, "6 this month"],
      [
        "Lifetime Value",
        "$92.4K",
        CircleDollarSign,
        "violet",
        "4.8%",
        "period growth",
      ],
      ["Retention", "91%", TrendingUp, "amber", null, "12-month rolling"],
    ],
    primary: "Buyer Growth",
    secondary: "Account Value",
  },
  inventory: {
    title: "Inventory Report",
    description: "Stock value, availability risk, and warehouse movement.",
    cards: [
      ["Inventory Value", "$4.21M", Boxes, "green", "2.2%", "period change"],
      ["Low Stock", "1", Boxes, "amber", null, "Requires reorder"],
      ["Backorders", "1", ClipboardList, "red", null, "125 units"],
      ["Warehouses", "4", Boxes, "blue", null, "3 active"],
    ],
    primary: "Inventory Value Trend",
    secondary: "Stock Movement",
  },
  finance: {
    title: "Finance Report",
    description:
      "Receivables, payment performance, and business credit exposure.",
    cards: [
      ["Outstanding", "$212.9K", CreditCard, "amber", null, "Open receivables"],
      [
        "Paid This Month",
        "$1.92M",
        CircleDollarSign,
        "green",
        "7.6%",
        "period growth",
      ],
      ["Overdue", "$18.8K", CreditCard, "red", null, "1 invoice"],
      [
        "Credit Exposure",
        "$3.1M",
        TrendingUp,
        "violet",
        null,
        "Across verified buyers",
      ],
    ],
    primary: "Collections Trend",
    secondary: "Invoice Volume",
  },
  executive: {
    title: "Executive Report",
    description: "Consolidated commercial and operational performance.",
    cards: [
      [
        "Revenue",
        "$2.92M",
        CircleDollarSign,
        "green",
        "8.4%",
        "six-month growth",
      ],
      ["Active Buyers", "304", Users, "blue", "5.2%", "period growth"],
      ["Open RFQs", "4", ClipboardList, "violet", null, "1 new"],
      ["Pending POs", "1", ShoppingCart, "amber", null, "Requires approval"],
      ["Inventory Value", "$4.21M", Boxes, "blue", "2.2%", "period change"],
      ["Renewal Rate", "87.5%", FileCheck2, "green", "1.4%", "period growth"],
    ],
    primary: "Revenue Trend",
    secondary: "Buyer Growth",
  },
};
export default function ReportPage({ type = "sales" }) {
  const c = cfg[type] || cfg.sales;
  const [period, setPeriod] = useState(6);
  const [notice, setNotice] = useState("");
  const chartData = revenueSeries.slice(-period);
  const revenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const orders = chartData.reduce((sum, item) => sum + item.orders, 0);
  const cards = c.cards.map((card) => card[0] === "Revenue" ? [card[0], currency(revenue), ...card.slice(2)] : card[0] === "Orders" ? [card[0], orders.toLocaleString(), ...card.slice(2)] : card);
  const ranking = type === "buyers" ? buyers : products;
  const exportReport = () => {
    const content = `Period,"Last ${period} months"\nMetric,Value\n${cards.map(([label, value]) => `"${label}","${value}"`).join("\n")}`;
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Report CSV downloaded.");
  };
  return (
    <>
      <PageHeader
        title={c.title}
        description={`${c.description} Last ${period} months.`}
        actions={
          <>
            <select
              aria-label="Reporting period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="form-control w-full sm:w-44"
            >
              <option value="3">Last 3 months</option>
              <option value="6">Last 6 months</option>
            </select>
            <button className="btn-primary" onClick={exportReport}>
              Export CSV
            </button>
          </>
        }
      />
      {notice && (
        <div className="mb-4">
          <Alert type="success" onClose={() => setNotice("")}>
            {notice}
          </Alert>
        </div>
      )}
      <div
        className={`grid gap-4 sm:grid-cols-2 ${type === "executive" ? "xl:grid-cols-3" : "xl:grid-cols-4"}`}
      >
        {cards.map(([label, value, Icon, tone, trend, context]) => (
          <StatCard
            key={label}
            label={label}
            value={value}
            icon={Icon}
            tone={tone}
            trend={trend}
            context={context}
          />
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {type==='sales'&&<><ChartCard title="Revenue Trend" subtitle={`Last ${period} months`}><RevenueChart data={chartData}/></ChartCard><ChartCard title="Revenue by Category" subtitle="Quoted pipeline value"><CategoryBarChart data={categoryRevenue} name="Quoted Value" format="currency"/></ChartCard><ChartCard title="Average Deal Activity" subtitle="Purchase orders by month"><OrdersChart data={orderSeries.slice(-period)}/></ChartCard><ChartCard title="Quote Conversion" subtitle={`Last ${period} months`}><ConversionChart data={conversionSeries.slice(-period)}/></ChartCard></>}
        {type==='buyers'&&<><ChartCard title="Buyer Growth" subtitle={`Last ${period} months`}><BuyerGrowthChart data={buyerGrowthSeries.slice(-period)}/></ChartCard><ChartCard title="Buyer Credit Capacity" subtitle="Credit limit by verified account"><CategoryBarChart data={buyers.map((buyer)=>({name:buyer.business.replace(/ (Group|LLC|Inc\.)$/,''),value:buyer.creditLimit})).sort((a,b)=>b.value-a.value)} labelKey="name" name="Credit Limit" format="currency"/></ChartCard><ChartCard title="Top Buyers" subtitle="Booked purchase order value"><CategoryBarChart data={buyers.map((buyer)=>({name:buyer.business.replace(/ (Group|LLC|Inc\.)$/,''),value:purchaseOrders.filter((order)=>order.buyer===buyer.business).reduce((sum,order)=>sum+order.amount,0)})).sort((a,b)=>b.value-a.value)} labelKey="name" name="PO Value" format="currency"/></ChartCard><ChartCard title="Buyer Lifetime Value Proxy" subtitle="Active contract and credit capacity"><CategoryBarChart data={buyers.map((buyer)=>({name:buyer.business.split(' ')[0],value:buyer.creditLimit}))} labelKey="name" name="Account Capacity" format="currency"/></ChartCard></>}
        {type==='inventory'&&<><ChartCard title="Stock by Warehouse" subtitle="Available, reserved, and allocated"><InventoryPositionChart data={inventoryByWarehouse}/></ChartCard><ChartCard title="Inventory Value" subtitle="Current stock value by product"><CategoryBarChart data={inventoryValueByProduct} labelKey="product" name="Inventory Value" format="currency"/></ChartCard><ChartCard title="Low Stock Products" subtitle="Products requiring replenishment"><CategoryBarChart data={inventoryValueByProduct.filter((item)=>item.value<40000)} labelKey="product" name="Stock Value" format="currency"/></ChartCard><ChartCard title="Available vs Reserved" subtitle="Warehouse inventory position"><InventoryPositionChart data={inventoryByWarehouse}/></ChartCard></>}
        {type==='finance'&&<><ChartCard title="Invoice Status Distribution" subtitle="Current receivables"><StatusDonutChart data={invoiceStatus}/></ChartCard><ChartCard title="Outstanding vs Paid" subtitle="Invoice balances by status"><CategoryBarChart data={invoiceStatus.map((item)=>({name:item.name,value:item.amount}))} labelKey="name" name="Invoice Amount" format="currency"/></ChartCard><ChartCard title="Overdue Trend" subtitle="Receivables by due month"><CategoryBarChart data={receivablesByMonth} labelKey="period" dataKey="overdue" name="Overdue" format="currency"/></ChartCard><ChartCard title="Credit Exposure" subtitle="Invoice exposure by buyer"><CategoryBarChart data={buyers.map((buyer)=>({name:buyer.business.split(' ')[0],value:invoices.filter((invoice)=>invoice.buyer===buyer.business).reduce((sum,invoice)=>sum+invoice.amount,0)}))} labelKey="name" name="Exposure" format="currency"/></ChartCard></>}
        {type==='executive'&&<><ChartCard title="Revenue Trend" subtitle={`Last ${period} months`}><RevenueChart data={chartData}/></ChartCard><ChartCard title="Order Trend" subtitle={`Last ${period} months`}><OrdersChart data={orderSeries.slice(-period)}/></ChartCard><ChartCard title="Buyer Growth" subtitle={`Last ${period} months`}><BuyerGrowthChart data={buyerGrowthSeries.slice(-period)}/></ChartCard><ChartCard title="RFQ Conversion" subtitle={`Last ${period} months`}><ConversionChart data={conversionSeries.slice(-period)}/></ChartCard></>}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card
          title={
            type === "buyers"
              ? "Top Buyers"
              : type === "inventory"
                ? "Highest Value Products"
                : "Commercial Leaders"
          }
        >
          {ranking.slice(0, 5).map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b py-3 last:border-0"
            >
              <span>
                <strong className="block text-xs">
                  {index + 1}. {item.business || item.name}
                </strong>
                <small>{item.industry || item.category}</small>
              </span>
              <strong>{currency((5 - index) * 68400)}</strong>
            </div>
          ))}
        </Card>
        <Card title="Key Performance Indicators">
          {[
            ["Gross margin", "28.4%"],
            ["Order fulfillment", "96.8%"],
            ["Contract renewal rate", "87.5%"],
            ["Average payment time", "38 days"],
          ].map(([label, value]) => (
            <div
              className="flex justify-between border-b py-3 last:border-0"
              key={label}
            >
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}
