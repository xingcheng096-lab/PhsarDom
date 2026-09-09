import { useState } from "react";
import { Check, Eye, MessageSquare, X } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import {
  Alert,
  ConfirmDialog,
  EmptyState,
  Modal,
  StatusBadge,
  Textarea,
} from "../../components/ui";
import { quotations } from "../../data";
import { currency } from "../../utils/format";

export default function ApprovalsPage({ kind = "All" }) {
  const [rows, setRows] = useState(
    quotations.map((quote, index) => ({
      ...quote,
      type:
        index % 3 === 0 ? "Pricing" : index % 3 === 1 ? "Quotation" : "Credit",
      requester: index % 2 ? "Sophia Turner" : "Daniel Brooks",
      status: index === 3 ? "Approved" : "Pending",
    })),
  );
  const [decision, setDecision] = useState(null);
  const [view, setView] = useState("Pending");
  const [detail, setDetail] = useState(null);
  const [notice, setNotice] = useState("");
  const filtered = rows.filter(
    (row) =>
      (kind === "All" || row.type === kind) &&
      (view === "Pending"
        ? row.status === "Pending"
        : row.status !== "Pending"),
  );
  const confirm = (reason = "") => {
    const nextStatus = decision.action === "Approve" ? "Approved" : decision.action === "Reject" ? "Rejected" : "Revision Requested";
    setRows(
      rows.map((row) =>
        row.id === decision.row.id
          ? {
              ...row,
              status: nextStatus,
              reason,
            }
          : row,
      ),
    );
    setNotice(`${decision.row.number} updated to ${nextStatus}.`);
    setDecision(null);
  };
  return (
    <>
      <PageHeader
        title={`${kind} Approvals`}
        description="Review pricing exceptions, quotation terms, and buyer credit decisions."
      />
      {notice && (
        <div className="mb-4">
          <Alert type="success" onClose={() => setNotice("")}>
            {notice}
          </Alert>
        </div>
      )}
      <div className="mb-4 flex gap-1 border-b">
        <button
          onClick={() => setView("Pending")}
          className={`px-4 py-2.5 text-xs font-semibold ${view === "Pending" ? "border-b-2 border-brand-600 text-brand-700" : "text-slate-500"}`}
        >
          Pending Queue
        </button>
        <button
          onClick={() => setView("History")}
          className={`px-4 py-2.5 text-xs font-semibold ${view === "History" ? "border-b-2 border-brand-600 text-brand-700" : "text-slate-500"}`}
        >
          Decision History
        </button>
      </div>
      {filtered.length ? (
        <div className="space-y-3">
          {filtered.map((row) => (
            <section
              key={row.id}
              className="surface-card transition duration-200 hover:-translate-y-px hover:shadow-md"
            >
              <div className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong>{row.number}</strong>
                    <StatusBadge status={row.status} />
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                      {row.type}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {row.buyer}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Requested by {row.requester} · Value {currency(row.amount)}{" "}
                    · Discount {row.discount}%
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setDetail(row)} className="btn-ghost">
                    <Eye size={15} />
                    Review details
                  </button>
                  {row.status === "Pending" && (
                    <>
                      <button
                        onClick={() => setDecision({ row, action: "Approve" })}
                        className="btn-success"
                      >
                        <Check size={15} />
                        Approve
                      </button>
                      <button
                        onClick={() => setDecision({ row, action: "Revision" })}
                        className="btn-secondary"
                      >
                        <MessageSquare size={15} />
                        Request Revision
                      </button>
                      <button
                        onClick={() => setDecision({ row, action: "Reject" })}
                        className="btn-danger"
                      >
                        <X size={15} />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="surface-card">
          <EmptyState
            title={
              view === "Pending"
                ? "You're all caught up"
                : "No decision history"
            }
            text={
              view === "Pending"
                ? "There are no approval requests in this queue."
                : "Completed decisions will appear here."
            }
          />
        </div>
      )}
      <Modal
        open={!!detail}
        title={`Approval Review · ${detail?.number}`}
        onClose={() => setDetail(null)}
      >
        <dl className="grid gap-4 sm:grid-cols-2">
          {detail &&
            [
              ["Buyer", detail.buyer],
              ["Request Type", detail.type],
              ["Quote Value", currency(detail.amount)],
              ["Requested Discount", `${detail.discount}%`],
              ["Requested By", detail.requester],
              ["Expiry", detail.expiry],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="mt-1 font-semibold">{value}</dd>
              </div>
            ))}
        </dl>
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
          Projected gross margin remains above the 24% approval threshold. Buyer
          credit utilization is 65% with no overdue balance.
        </div>
      </Modal>
      <ConfirmDialog
        open={decision?.action === "Approve"}
        title={`Approve ${decision?.row.number}`}
        message={`Approve this ${decision?.row.type.toLowerCase()} request for ${decision?.row.buyer}?`}
        confirmText="Approve"
        onClose={() => setDecision(null)}
        onConfirm={() => confirm()}
      />
      <Modal
        open={!!decision && decision.action !== "Approve"}
        title={`${decision?.action === "Reject" ? "Reject" : "Request revision for"} ${decision?.row.number}`}
        onClose={() => setDecision(null)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            confirm(new FormData(e.currentTarget).get("reason"));
          }}
        >
          <Textarea
            required
            name="reason"
            label="Decision reason"
            placeholder="Document the reason and required next steps..."
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDecision(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              className={
                decision?.action === "Reject" ? "btn-danger" : "btn-primary"
              }
            >
              Submit decision
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
