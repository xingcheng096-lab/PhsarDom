import { useEffect, useId, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Inbox,
  Loader2,
  RefreshCw,
  UploadCloud,
  X,
} from "lucide-react";

export function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
  bodyClassName = "p-4 sm:p-5",
}) {
  const Element = title ? "section" : "div";
  return (
    <Element
      className={`surface-card transition-shadow duration-200 hover:shadow-md ${className}`}
    >
      {(title || subtitle || action) && (
        <div className="flex min-h-14 items-start justify-between gap-4 border-b border-slate-200/80 px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-semibold tracking-[-.01em] text-slate-900">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </Element>
  );
}

const intentGroups = {
  success: [
    "approved",
    "active",
    "accepted",
    "paid",
    "delivered",
    "healthy",
    "in stock",
    "completed",
    "verified",
    "low",
    "received",
    "put away",
    "picked",
    "packed",
    "ready to ship",
    "shipped",
    "resolved",
    "released",
    "issued",
    "applied",
    "adjusted",
    "counted",
    "matched",
    "allocated",
    "good",
    "on time",
  ],
  warning: [
    "pending",
    "pending approval",
    "review",
    "under review",
    "partially paid",
    "partially shipped",
    "partially delivered",
    "expiring",
    "low stock",
    "medium",
    "assigned",
    "arrived",
    "inspecting",
    "shortage",
    "partial",
    "planned",
    "discrepancy",
    "scheduled",
    "in review",
    "recount",
    "revision requested",
  ],
  info: [
    "processing",
    "quoted",
    "sent",
    "issued",
    "dispatched",
    "in transit",
    "negotiating",
    "new",
    "open",
    "in progress",
    "unread",
    "waiting",
    "picking",
    "packing",
    "expected",
    "reorder",
    "released",
  ],
  danger: [
    "rejected",
    "suspended",
    "overdue",
    "delayed",
    "backordered",
    "cancelled",
    "terminated",
    "high",
    "void",
    "failed delivery",
    "missing pod",
    "damaged",
    "blocked",
    "expired",
  ],
  neutral: ["draft", "expired", "archived", "read", "maintenance", "waived"],
};
const badgeClasses = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  neutral: "border-slate-200 bg-slate-100 text-slate-600",
};
export function StatusBadge({ status = "Unknown" }) {
  const normalized = String(status).toLowerCase();
  const intent =
    Object.entries(intentGroups).find(([, values]) =>
      values.includes(normalized),
    )?.[0] || "neutral";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-5 ${badgeClasses[intent]}`}
    >
      {status}
    </span>
  );
}
export function Avatar({ name = "User", size = "md" }) {
  const initials = name
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      aria-label={name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-brand-700 font-bold text-white ring-2 ring-white/10 ${size === "sm" ? "h-8 w-8 text-[11px]" : "h-10 w-10 text-xs"}`}
    >
      {initials}
    </span>
  );
}

export function Button({
  variant = "primary",
  loading = false,
  type = "button",
  children,
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn-${variant} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
export function IconButton({ label, children, className = "", type = "button", ...props }) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`icon-btn ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
export function Alert({ type = "info", children, onClose }) {
  const ok = type === "success";
  return (
    <div
      role={ok ? "status" : "alert"}
      aria-live="polite"
      className={`flex items-center gap-3 rounded-md border p-3 text-sm ${ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-blue-200 bg-blue-50 text-blue-800"}`}
    >
      {ok ? (
        <CheckCircle2 aria-hidden size={18} />
      ) : (
        <AlertCircle aria-hidden size={18} />
      )}
      <span className="flex-1">{children}</span>
      {onClose && (
        <IconButton
          label="Dismiss message"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X size={15} />
        </IconButton>
      )}
    </div>
  );
}
export function LoadingState() {
  return (
    <div
      role="status"
      className="flex min-h-40 items-center justify-center gap-2 text-slate-500"
    >
      <Loader2 className="animate-spin" size={20} /> Loading data...
    </div>
  );
}
export function Skeleton({ rows = 4 }) {
  return (
    <div role="status" aria-label="Loading content" className="space-y-3 p-4">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="h-10 animate-pulse rounded-md bg-slate-100"
          style={{ width: `${100 - i * 6}%` }}
        />
      ))}
    </div>
  );
}
export function EmptyState({
  title = "No records found",
  text = "Try changing your search or filters.",
  action,
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center px-5 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Inbox size={23} className="text-slate-400" />
      </span>
      <h3 className="mt-3 font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
export function ErrorState({ onRetry }) {
  return (
    <div
      role="alert"
      className="flex min-h-52 flex-col items-center justify-center text-center"
    >
      <AlertCircle size={28} className="text-red-500" />
      <h3 className="mt-3 font-semibold">Unable to load data</h3>
      <p className="mt-1 text-xs text-slate-500">
        Please try the request again.
      </p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          <RefreshCw size={14} />
          Retry
        </Button>
      )}
    </div>
  );
}

function useOverlay(open, onClose) {
  const panelRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const key = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", key);
      previous?.focus?.();
    };
  }, [open, onClose]);
  return panelRef;
}
export function Modal({ open, title, children, onClose, footer, size = "lg" }) {
  const ref = useOverlay(open, onClose);
  const titleId = useId();
  if (!open) return null;
  const widths = { sm: "max-w-md", lg: "max-w-xl", xl: "max-w-4xl" };
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-[1px]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`popover-enter flex max-h-[92vh] w-full flex-col overflow-hidden rounded-xl border border-white/20 bg-white shadow-float ${widths[size]}`}
      >
        <div className="flex shrink-0 items-center justify-between border-b px-5 py-4">
          <h3 id={titleId} className="font-semibold text-slate-900">
            {title}
          </h3>
          <IconButton
            label="Close dialog"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X size={18} />
          </IconButton>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t bg-slate-50 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
export function ConfirmDialog({
  open,
  title = "Confirm action",
  message,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  danger = false,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-6 text-slate-600">{message}</p>
    </Modal>
  );
}
export function Drawer({ open, title, children, onClose }) {
  const ref = useOverlay(open, onClose);
  const titleId = useId();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80]">
      <button
        aria-label="Close drawer"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-slate-950/50"
      />
      <aside
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-float"
      >
        <div className="flex items-center justify-between border-b p-4">
          <h3 id={titleId} className="font-semibold">
            {title}
          </h3>
          <IconButton label="Close drawer" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}

function FieldShell({ label, required, hint, error, id, children }) {
  return (
    <label className="block" htmlFor={id}>
      <span className="form-label">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </span>
      {children}
      {hint && !error && (
        <span id={`${id}-hint`} className="mt-1.5 block text-xs text-slate-500">{hint}</span>
      )}
      {error && (
        <span
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 block text-xs text-red-600"
        >
          {error}
        </span>
      )}
    </label>
  );
}
export function TextInput({
  label,
  error,
  hint,
  id: givenId,
  required,
  ...props
}) {
  const auto = useId();
  const id = givenId || auto;
  return (
    <FieldShell
      label={label}
      required={required}
      hint={hint}
      error={error}
      id={id}
    >
      <input
        id={id}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`form-control ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : ""}`}
        {...props}
      />
    </FieldShell>
  );
}
export function SelectInput({
  label,
  children,
  error,
  hint,
  id: givenId,
  required,
  ...props
}) {
  const auto = useId();
  const id = givenId || auto;
  return (
    <FieldShell
      label={label}
      required={required}
      hint={hint}
      error={error}
      id={id}
    >
      <select
        id={id}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`form-control ${error ? "border-red-400" : ""}`}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}
export function Textarea({
  label,
  error,
  hint,
  id: givenId,
  required,
  ...props
}) {
  const auto = useId();
  const id = givenId || auto;
  return (
    <FieldShell
      label={label}
      required={required}
      hint={hint}
      error={error}
      id={id}
    >
      <textarea
        id={id}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className="form-control min-h-24 resize-y"
        {...props}
      />
    </FieldShell>
  );
}
export function DateInput(props) {
  return <TextInput type="date" {...props} />;
}
export function Checkbox({ label, ...props }) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center gap-2.5 text-sm">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
export function FileUpload({
  label = "Upload documents",
  name = "files",
  required = false,
  multiple = true,
  accept = ".pdf,image/png,image/jpeg",
  maxSize = 10,
}) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const inputId = useId();
  return (
    <label className="block" htmlFor={inputId}>
      <span className="form-label">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </span>
      <span className="flex cursor-pointer flex-col items-center rounded-lg border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center transition hover:border-brand-400 hover:bg-brand-50/40">
        <UploadCloud className="mb-2 text-slate-400" />
        <span className="font-semibold text-brand-700">Choose files</span>
        <span id={`${inputId}-hint`} className="text-xs text-slate-500">PDF, PNG, JPG up to {maxSize}MB</span>
        <input
          id={inputId}
          name={name}
          required={required}
          type="file"
          accept={accept}
          aria-describedby={error ? `${inputId}-error` : `${inputId}-hint`}
          className="sr-only"
          multiple={multiple}
          onChange={(e) => {
            const selected = [...e.target.files];
            const invalid = selected.find((file) => file.size > maxSize * 1024 * 1024);
            if (invalid) {
              e.target.value = "";
              setFiles([]);
              setError(`${invalid.name} exceeds the ${maxSize}MB limit.`);
              return;
            }
            setError("");
            setFiles(selected);
          }}
        />
      </span>
      {files.length > 0 && (
        <span className="mt-2 block text-xs text-slate-600">
          {files.map((file) => file.name).join(", ")}
        </span>
      )}
      {error && <span id={`${inputId}-error`} role="alert" className="mt-2 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
