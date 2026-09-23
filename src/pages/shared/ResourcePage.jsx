import { useMemo, useState } from "react";
import {
  Boxes,
  CircleDollarSign,
  Clock3,
  Download,
  PackageCheck,
  PackageX,
  Plus,
  Receipt,
  ShieldAlert,
  Truck,
} from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import { InfoBox } from "../../components/cards/DashboardCards";
import DataTable from "../../components/tables/DataTable";
import SchemaForm from "../../components/forms/SchemaForm";
import {
  Alert,
  ConfirmDialog,
  Modal,
} from "../../components/ui";
import {
  activityLogs,
  buyers,
  contracts,
  inventory,
  invoices,
  products,
  purchaseOrders,
  quotations,
  rfqs,
  shipments,
  users,
  warehouses,
} from "../../data";
import { resourceSchemas } from "../../data/resourceSchemas";
import { getStoredRecords, removeRecord, saveRecord } from "../../services/mockStore";

const simpleData = {
  categories: [
    "Electronics",
    "Safety Equipment",
    "Packaging",
    "Office Furniture",
    "Cleaning Supplies",
    "Tools",
  ].map((name, id) => ({
    id: id + 1,
    name,
    products: [42, 36, 58, 24, 31, 47][id],
    status: "Active",
    updated: "2026-09-01",
  })),
  pricing: products.flatMap((p) =>
    p.tiers
      .slice(0, 2)
      .map((t, i) => ({
        id: p.id * 10 + i,
        product: p.name,
        min: t.min,
        max: t.max || "No limit",
        price: t.price,
        status: "Active",
      })),
  ),
  tasks: [
    {
      id: 1,
      title: "Follow up Atlas pricing review",
      priority: "High",
      due: "2026-09-09",
      status: "Open",
    },
    {
      id: 2,
      title: "Prepare Redwood renewal proposal",
      priority: "Medium",
      due: "2026-09-12",
      status: "In Progress",
    },
    {
      id: 3,
      title: "Confirm Summit delivery terms",
      priority: "High",
      due: "2026-09-08",
      status: "Open",
    },
    {
      id: 4,
      title: "Review account pipeline",
      priority: "Low",
      due: "2026-09-15",
      status: "Completed",
    },
  ],
  notifications: [
    {
      id: 1,
      title: "New RFQ assigned",
      message: "RFQ-2026-1048 is ready for review",
      created: "2026-09-08",
      status: "Unread",
    },
    {
      id: 2,
      title: "Pricing approved",
      message: "Manager approved QT-2026-0831",
      created: "2026-09-07",
      status: "Read",
    },
    {
      id: 3,
      title: "Shipment delayed",
      message: "SHP-2026-7704 delivery date changed",
      created: "2026-09-06",
      status: "Unread",
    },
  ],
  carriers: [
    {
      id: 1,
      name: "DHL Freight",
      service: "National LTL / FTL",
      contact: "freight@dhl.com",
      status: "Active",
    },
    {
      id: 2,
      name: "FedEx Freight",
      service: "Priority Freight",
      contact: "commercial@fedex.com",
      status: "Active",
    },
    {
      id: 3,
      name: "XPO Logistics",
      service: "LTL and Last Mile",
      contact: "support@xpo.com",
      status: "Active",
    },
    {
      id: 4,
      name: "Old Dominion",
      service: "Regional LTL",
      contact: "accounts@odfl.com",
      status: "Active",
    },
  ],
  credit: buyers.map((b, i) => ({
    ...b,
    id: b.id,
    buyer: b.business,
    used: [162500, 82000, 0, 201000, 91200, 143000][i],
    available: Math.max(
      0,
      b.creditLimit - [162500, 82000, 0, 201000, 91200, 143000][i],
    ),
    overdue: [0, 0, 0, 12400, 18750, 0][i],
    terms: ["Net-60", "Net-30", "Net-30", "Net-30", "Net-30", "Net-90"][i],
    risk: ["LOW", "LOW", "MEDIUM", "LOW", "HIGH", "MEDIUM"][i],
  })),
  approvals: quotations.map((q, i) => ({
    ...q,
    request: i % 2 ? "Quote Approval" : "Pricing Exception",
    requestedBy: i % 2 ? "Sophia Turner" : "Daniel Brooks",
    variance: `${q.discount}%`,
    submitted: "2026-09-07",
    status: i < 3 ? "Pending" : "Approved",
  })),
  roles: [
    {
      id: 1,
      name: "Super Admin",
      users: 2,
      scope: "All modules",
      status: "Active",
    },
    {
      id: 2,
      name: "Sales Manager",
      users: 4,
      scope: "Sales and approvals",
      status: "Active",
    },
    {
      id: 3,
      name: "Account Executive",
      users: 18,
      scope: "Assigned accounts",
      status: "Active",
    },
    {
      id: 4,
      name: "Verified Buyer",
      users: 304,
      scope: "Own organization",
      status: "Active",
    },
  ],
  documents: [
    {
      id: 1,
      name: "Business License 2026.pdf",
      type: "Business License",
      uploaded: "2026-01-12",
      status: "Verified",
    },
    {
      id: 2,
      name: "IRS Tax Certificate.pdf",
      type: "Tax Document",
      uploaded: "2026-01-12",
      status: "Verified",
    },
    {
      id: 3,
      name: "Purchasing Authorization.pdf",
      type: "Authorization",
      uploaded: "2026-02-03",
      status: "Active",
    },
  ],
  locations: inventory.map((x) => ({
    id: x.id,
    warehouse: x.warehouse,
    bin: x.bin,
    sku: x.sku,
    capacity: 5000,
    utilization: `${Math.min(98, Math.round((x.available + x.reserved) / 50))}%`,
    status: x.status === "Backordered" ? "Review" : "Active",
  })),
  reservations: inventory
    .filter((x) => x.reserved > 0)
    .map((x) => ({
      id: x.id,
      reference: `RSV-2026-${810 + x.id}`,
      sku: x.sku,
      product: x.product,
      warehouse: x.warehouse,
      quantity: x.reserved,
      status: "Active",
    })),
  creditNotes: invoices
    .slice(0, 3)
    .map((x, i) => ({
      id: x.id,
      number: `CN-2026-${310 + i}`,
      buyer: x.buyer,
      invoice: x.number,
      amount: [1200, 850, 2400][i],
      reason: ["Freight adjustment", "Quantity discrepancy", "Product return"][
        i
      ],
      status: i === 0 ? "Issued" : "Draft",
    })),
  paymentTerms: [
    {
      id: 1,
      name: "Net-30",
      days: 30,
      discount: "None",
      buyers: 3,
      status: "Active",
    },
    {
      id: 2,
      name: "Net-60",
      days: 60,
      discount: "1% / 10 days",
      buyers: 1,
      status: "Active",
    },
    {
      id: 3,
      name: "Net-90",
      days: 90,
      discount: "None",
      buyers: 1,
      status: "Active",
    },
  ],
  deliveries: shipments.map((x) => ({
    id: x.id,
    number: `DLV-${x.number.slice(4)}`,
    shipment: x.number,
    buyer: x.buyer,
    expected: x.expected,
    proof: x.status === "Delivered" ? "Received" : "Pending",
    status: x.status,
  })),
};
const definitions = {
  buyers: {
    rows: buyers.map((b, i) => ({
      ...b,
      used: [162500, 82000, 0, 201000, 91200, 143000][i],
    })),
    columns: [
      ["business", "Company"],
      ["contact", "Primary Contact"],
      ["industry", "Industry"],
      ["creditLimit", "Credit Limit"],
      ["used", "Credit Used"],
      ["rep", "Account Executive"],
      ["status", "Status"],
      ["registered", "Created"],
    ],
  },
  products: {
    rows: products.map((p) => ({ ...p, tierCount: p.tiers.length })),
    columns: [
      ["image", "Product"],
      ["name", "Product Name"],
      ["sku", "SKU"],
      ["category", "Category"],
      ["moq", "MOQ"],
      ["price", "Base Price"],
      ["tierCount", "Tiers"],
      ["stock", "Available Stock"],
      ["status", "Status"],
    ],
  },
  rfqs: {
    rows: rfqs,
    columns: [
      ["number", "RFQ Number"],
      ["buyer", "Buyer"],
      ["product", "Product"],
      ["quantity", "Quantity"],
      ["targetPrice", "Target Price"],
      ["rep", "Assigned Rep"],
      ["status", "Status"],
      ["created", "Created"],
    ],
  },
  quotations: {
    rows: quotations,
    columns: [
      ["number", "Quote Number"],
      ["buyer", "Buyer"],
      ["rfq", "RFQ"],
      ["amount", "Amount"],
      ["discount", "Discount %"],
      ["expiry", "Expiry"],
      ["status", "Status"],
    ],
  },
  purchaseOrders: {
    rows: purchaseOrders,
    columns: [
      ["number", "PO Number"],
      ["buyer", "Buyer"],
      ["quote", "Quote"],
      ["amount", "Amount"],
      ["terms", "Payment Terms"],
      ["delivery", "Delivery"],
      ["status", "Status"],
      ["created", "Created"],
    ],
  },
  contracts: {
    rows: contracts,
    columns: [
      ["number", "Contract"],
      ["buyer", "Buyer"],
      ["start", "Start Date"],
      ["end", "End Date"],
      ["value", "Value"],
      ["terms", "Payment Terms"],
      ["status", "Status"],
    ],
  },
  warehouses: {
    rows: warehouses,
    columns: [
      ["code", "Code"],
      ["name", "Warehouse"],
      ["location", "Location"],
      ["manager", "Manager"],
      ["status", "Status"],
    ],
  },
  inventory: {
    rows: inventory,
    columns: [
      ["sku", "SKU"],
      ["product", "Product"],
      ["warehouse", "Warehouse"],
      ["bin", "Bin"],
      ["onHand", "On Hand"],
      ["reserved", "Reserved"],
      ["available", "Available"],
      ["allocated", "Allocated"],
      ["backordered", "Backordered"],
      ["reorderPoint", "Reorder Point"],
      ["status", "Status"],
    ],
  },
  invoices: {
    rows: invoices,
    columns: [
      ["number", "Invoice"],
      ["buyer", "Buyer"],
      ["po", "PO"],
      ["amount", "Amount"],
      ["terms", "Credit Terms"],
      ["due", "Due Date"],
      ["status", "Status"],
    ],
  },
  shipments: {
    rows: shipments,
    columns: [
      ["number", "Shipment"],
      ["po", "PO"],
      ["buyer", "Buyer"],
      ["carrier", "Carrier"],
      ["tracking", "Tracking Number"],
      ["dispatch", "Dispatch"],
      ["expected", "Expected"],
      ["status", "Status"],
    ],
  },
  users: {
    rows: users,
    columns: [
      ["name", "Name"],
      ["email", "Email"],
      ["role", "Role"],
      ["department", "Department"],
      ["status", "Status"],
      ["lastLogin", "Last Login"],
    ],
  },
  activity: {
    rows: activityLogs,
    columns: [
      ["time", "Time"],
      ["user", "User"],
      ["role", "Role"],
      ["module", "Module"],
      ["action", "Action"],
      ["description", "Description"],
      ["ip", "IP Address"],
    ],
  },
  categories: {
    rows: simpleData.categories,
    columns: [
      ["name", "Category"],
      ["products", "Products"],
      ["status", "Status"],
      ["updated", "Last Updated"],
    ],
  },
  pricing: {
    rows: simpleData.pricing,
    columns: [
      ["product", "Product"],
      ["min", "Minimum Quantity"],
      ["max", "Maximum Quantity"],
      ["price", "Unit Price"],
      ["status", "Status"],
    ],
  },
  tasks: {
    rows: simpleData.tasks,
    columns: [
      ["title", "Task"],
      ["priority", "Priority"],
      ["due", "Due Date"],
      ["status", "Status"],
    ],
  },
  notifications: {
    rows: simpleData.notifications,
    columns: [
      ["title", "Notification"],
      ["message", "Message"],
      ["created", "Date"],
      ["status", "Status"],
    ],
  },
  carriers: {
    rows: simpleData.carriers,
    columns: [
      ["name", "Carrier"],
      ["service", "Service"],
      ["contact", "Contact"],
      ["status", "Status"],
    ],
  },
  credit: {
    rows: simpleData.credit,
    columns: [
      ["buyer", "Buyer"],
      ["creditLimit", "Credit Limit"],
      ["used", "Used Credit"],
      ["available", "Available Credit"],
      ["overdue", "Overdue"],
      ["terms", "Terms"],
      ["risk", "Risk"],
    ],
  },
  approvals: {
    rows: simpleData.approvals,
    columns: [
      ["request", "Request Type"],
      ["number", "Reference"],
      ["buyer", "Buyer"],
      ["requestedBy", "Requested By"],
      ["variance", "Variance"],
      ["submitted", "Submitted"],
      ["status", "Status"],
    ],
  },
  roles: {
    rows: simpleData.roles,
    columns: [
      ["name", "Role"],
      ["users", "Users"],
      ["scope", "Access Scope"],
      ["status", "Status"],
    ],
  },
  documents: {
    rows: simpleData.documents,
    columns: [
      ["name", "Document"],
      ["type", "Type"],
      ["uploaded", "Uploaded"],
      ["status", "Status"],
    ],
  },
  locations: {
    rows: simpleData.locations,
    columns: [
      ["warehouse", "Warehouse"],
      ["bin", "Bin"],
      ["sku", "Assigned SKU"],
      ["capacity", "Capacity"],
      ["utilization", "Utilization"],
      ["status", "Status"],
    ],
  },
  reservations: {
    rows: simpleData.reservations,
    columns: [
      ["reference", "Reservation"],
      ["sku", "SKU"],
      ["product", "Product"],
      ["warehouse", "Warehouse"],
      ["quantity", "Quantity"],
      ["status", "Status"],
    ],
  },
  creditNotes: {
    rows: simpleData.creditNotes,
    columns: [
      ["number", "Credit Note"],
      ["buyer", "Buyer"],
      ["invoice", "Invoice"],
      ["amount", "Amount"],
      ["reason", "Reason"],
      ["status", "Status"],
    ],
  },
  paymentTerms: {
    rows: simpleData.paymentTerms,
    columns: [
      ["name", "Payment Term"],
      ["days", "Days"],
      ["discount", "Early Payment"],
      ["buyers", "Buyers"],
      ["status", "Status"],
    ],
  },
  deliveries: {
    rows: simpleData.deliveries,
    columns: [
      ["number", "Delivery"],
      ["shipment", "Shipment"],
      ["buyer", "Buyer"],
      ["expected", "Expected"],
      ["proof", "Proof of Delivery"],
      ["status", "Status"],
    ],
  },
};
const addNames = {
  buyers: "Add Buyer",
  categories: "Add Category",
  pricing: "Add Pricing Tier",
  tasks: "Add Task",
  documents: "Upload Document",
  warehouses: "Add Warehouse",
  users: "Add User",
  carriers: "Add Carrier",
  locations: "Add Location / Bin",
  inventory: "Add Stock Record",
  reservations: "Add Reservation",
  invoices: "Create Invoice",
  creditNotes: "Create Credit Note",
  shipments: "Create Shipment",
  purchaseOrders: "Create Purchase Order",
  contracts: "Add Contract",
  roles: "Add Role",
  credit: "Add Credit Profile",
  paymentTerms: "Add Payment Terms",
};
export default function ResourcePage({
  type,
  title,
  description,
  basePath,
  addLabel,
  filterStatus,
}) {
  const def = definitions[type] || definitions.tasks;
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const root = location.pathname.split("/")[1];
  const schema = resourceSchemas[type];
  const [rows, setRows] = useState(() => getStoredRecords(type, def.rows));
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [message, setMessage] = useState("");
  const queryStatus = params.get("status");
  const assigned = params.get("assigned");
  const scopedRows = useMemo(
    () =>
      rows.filter((row) => {
        if (
          root === "buyer" &&
          row.buyer &&
          row.buyer !== "Atlas Hospitality Group"
        )
          return false;
        if (
          root === "sales" &&
          type === "buyers" &&
          row.rep !== "Daniel Brooks"
        )
          return false;
        if (
          root === "sales" &&
          type === "rfqs" &&
          (assigned === "me" || !params.get("status")) &&
          row.rep !== "Daniel Brooks"
        )
          return false;
        if (
          filterStatus &&
          String(row.status).toLowerCase() !== filterStatus.toLowerCase()
        )
          return false;
        return true;
      }),
    [rows, root, type, assigned, filterStatus, params],
  );
  const columns = def.columns.map(([key, label], i) => ({
    key,
    label,
    primary: i === 0,
  }));
  const permissions =
    {
      buyer: ["rfqs", "documents"],
      sales: ["quotations", "tasks"],
      manager: [],
      admin: [
        "buyers",
        "products",
        "categories",
        "pricing",
        "warehouses",
        "locations",
        "inventory",
        "reservations",
        "invoices",
        "creditNotes",
        "paymentTerms",
        "shipments",
        "purchaseOrders",
        "contracts",
        "users",
        "roles",
        "carriers",
        "credit",
      ],
    }[root] || [];
  const manageable = permissions.includes(type) && !!schema;
  const createPath =
    type === "rfqs" && root === "buyer"
      ? "/buyer/rfqs/new"
      : type === "quotations" && root === "sales"
        ? "/sales/quotations/new"
        : type === "products" && root === "admin"
          ? "/admin/products/new"
          : null;
  const save = async (record) => {
    const saved = saveRecord(type, record);
    setRows((current) => current.some((item) => item.id === saved.id) ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]);
    setModal(null);
    setMessage(`${schema.label} ${record.id ? "updated" : "created"} successfully.`);
  };
  const view = (row) =>
    basePath ? navigate(`${basePath}/${row.id}`) : setViewing(row);
  const exportRows = () => {
    const keys = def.columns.map(([key]) => key);
    const csv = [
      keys.join(","),
      ...scopedRows.map((row) =>
        keys
          .map((key) => `"${String(row[key] ?? "").replaceAll('"', '""')}"`)
          .join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("CSV export downloaded.");
  };
  const actionLabel = addLabel || addNames[type] || `Add ${schema?.label || title}`;
  const metricSets = {
    inventory: [
      ["Available", "16,346", Boxes, "green"],
      ["Reserved", "2,602", Clock3, "amber"],
      ["Allocated", "1,617", PackageCheck, "blue"],
      ["Backordered", "125", PackageX, "red"],
      ["Low Stock", "2", ShieldAlert, "amber"],
    ],
    credit: [
      ["Credit Limit", "$1.14M", CircleDollarSign, "blue"],
      ["Used", "$679.7K", Receipt, "violet"],
      ["Available", "$460.3K", PackageCheck, "green"],
      ["Overdue", "$31.2K", ShieldAlert, "red"],
    ],
    invoices: [
      ["Outstanding", "$212.9K", Receipt, "amber"],
      ["Overdue", "$18.8K", ShieldAlert, "red"],
      ["Paid This Month", "$1.92M", CircleDollarSign, "green"],
      ["Credit Exposure", "$3.1M", Boxes, "violet"],
    ],
    shipments: [
      ["Active Shipments", "2", Truck, "blue"],
      ["In Transit", "1", Truck, "violet"],
      ["Delivered", "1", PackageCheck, "green"],
      ["Delayed", "1", ShieldAlert, "red"],
    ],
  };
  const metrics = metricSets[type];
  return (
    <>
      <PageHeader
        title={title}
        description={
          description || `Manage and review ${title.toLowerCase()} records.`
        }
        actions={
          <>
            <button className="btn-secondary" onClick={exportRows}>
              <Download size={15} />
              Export CSV
            </button>
            {manageable && (
              <button
                className="btn-primary"
                onClick={() =>
                  createPath ? navigate(createPath) : setModal({})
                }
              >
                <Plus size={15} />
                {actionLabel}
              </button>
            )}
          </>
        }
      />
      {message && (
        <div className="mb-4">
          <Alert type="success" onClose={() => setMessage("")}>
            {message}
          </Alert>
        </div>
      )}
      {metrics && (
        <div
          className={`mb-5 grid gap-4 sm:grid-cols-2 ${metrics.length === 5 ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}
        >
          {metrics.map(([label, value, Icon, tone]) => (
            <InfoBox
              key={label}
              label={label}
              value={value}
              icon={Icon}
              tone={tone}
            />
          ))}
        </div>
      )}
      <DataTable
        rows={scopedRows}
        columns={columns}
        initialFilter={queryStatus || ""}
        caption={title}
        onView={view}
        onEdit={manageable ? setModal : undefined}
        onDelete={
          manageable &&
          !["activity", "notifications", "invoices"].includes(type)
            ? setSelected
            : undefined
        }
        emptyTitle={`No ${title.toLowerCase()}`}
        emptyText={
          filterStatus || queryStatus
            ? "No records match this view."
            : "There is no activity to display yet."
        }
      />
      <Modal
        open={!!viewing}
        title={`${title} details`}
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <dl className="grid gap-4 sm:grid-cols-2">
            {def.columns.map(([key, label]) => (
              <div key={key} className="rounded-md bg-slate-50 p-3">
                <dt className="text-xs font-medium text-slate-500">{label}</dt>
                <dd className="mt-1 break-words font-semibold text-slate-800">
                  {String(viewing[key] ?? "—")}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>
      <Modal
        open={!!modal}
        title={modal?.id ? `Edit ${title}` : actionLabel}
        onClose={() => setModal(null)}
      >
        {modal && schema && <SchemaForm schema={schema} initial={modal} onSubmit={save} onCancel={() => setModal(null)}/>}
      </Modal>
      <ConfirmDialog
        open={!!selected}
        danger
        title={`Delete ${title} record`}
        message={`Delete ${selected?.[def.columns[0][0]] || "this record"}? This change applies to local demo data.`}
        confirmText="Delete"
        onClose={() => setSelected(null)}
        onConfirm={() => {
          removeRecord(type, selected.id);
          setRows(rows.filter((x) => x.id !== selected.id));
          setMessage("Record deleted.");
        }}
      />
    </>
  );
}
