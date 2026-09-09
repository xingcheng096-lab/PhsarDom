import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import BrandLogo from "../../components/common/BrandLogo";
import {
  Alert,
  Button,
  Checkbox,
  FileUpload,
  SelectInput,
  TextInput,
} from "../../components/ui";
import { saveRecord } from "../../services/mockStore";

function AuthShell({ title, subtitle, children }) {
  return (
    <main className="flex min-h-screen bg-[#f5f7fa]">
      <aside className="relative hidden w-[42%] overflow-hidden bg-[#121b24] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(40,120,189,.3),transparent_38%)]" />
        <Link to="/" className="relative inline-flex self-start" aria-label="PhsarDom home">
          <BrandLogo variant="auth" />
        </Link>
        <div className="relative max-w-lg">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">
            B2B Wholesale Marketplace &amp; Management Platform
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
            Procurement built around your business.
          </h2>
          <div className="mt-8 space-y-4 text-sm text-slate-300">
            {[
              "Negotiated wholesale and volume pricing",
              "Managed RFQ-to-purchase-order workflows",
              "Integrated credit, invoices, and logistics",
            ].map((x) => (
              <p className="flex items-center gap-3" key={x}>
                <CheckCircle2 size={18} className="text-cyan-300" />
                {x}
              </p>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-slate-500">
          Trusted commercial supply management
        </p>
      </aside>
      <section className="flex flex-1 items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-5 flex justify-center lg:hidden" aria-label="PhsarDom home">
            <BrandLogo variant="full" className="w-32" />
          </Link>
          <Link
            to="/"
            className="mb-7 flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-brand-700"
          >
            <ArrowLeft size={14} />
            Return to marketplace
          </Link>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-brand-600">
              Welcome to PhsarDom
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              {title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting,setSubmitting]=useState(false);
  const submit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (!data.get("email") || !data.get("password"))
      return setError("Enter both your business email and password.");
    if(submitting)return;setSubmitting(true);setTimeout(()=>navigate("/buyer/dashboard"),400);
  };
  return (
    <AuthShell
      title="Sign in to your account"
      subtitle="Access your wholesale workspace."
    >
      <form className="mt-6 space-y-4" onSubmit={submit}>
        {error && <Alert>{error}</Alert>}
        <TextInput
          name="email"
          required
          autoComplete="email"
          label="Business email"
          type="email"
          placeholder="name@company.com"
        />
        <TextInput
          name="password"
          required
          autoComplete="current-password"
          label="Password"
          type="password"
          placeholder="Enter your password"
        />
        <div className="flex justify-between">
          <Checkbox name="remember" label="Remember me" />
          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-brand-600"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={submitting} className="w-full py-2.5">
          <LockKeyhole size={15} /> Sign in
        </Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-[10px] uppercase text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        Demo role access
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {[
          ["Buyer", "/buyer/dashboard"],
          ["Account Executive", "/sales/dashboard"],
          ["Sales Manager", "/manager/dashboard"],
          ["Super Admin", "/admin/dashboard"],
        ].map(([r, p]) => (
          <button onClick={() => navigate(p)} className="btn-secondary" key={r}>
            Login as {r}
          </button>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-slate-500">
        New organization?{" "}
        <Link to="/register" className="font-semibold text-brand-600">
          Register your business
        </Link>
      </p>
    </AuthShell>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting,setSubmitting]=useState(false);
  const [data, setData] = useState({
    business: "",
    industry: "Retail",
    taxId: "",
    email: "",
    contact: "",
    password: "",
    address: "",
    phone: "",
    spend: "$10,000 - $50,000",
  });
  const update = (key) => (e) => setData({ ...data, [key]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    if (step === 1) setStep(2);
    else { if(submitting)return;setSubmitting(true);saveRecord("buyers",{id:Date.now(),business:data.business,contact:data.contact,email:data.email,industry:data.industry,creditLimit:0,status:"Pending",rep:"Unassigned",registered:new Date().toISOString().slice(0,10),phone:data.phone,address:data.address,taxId:data.taxId});setTimeout(()=>navigate("/pending-approval"),450); }
  };
  return (
    <AuthShell
      title="Register your business"
      subtitle={`Step ${step} of 2 · ${step === 1 ? "Company information" : "Verification details"}`}
    >
      <div className="mt-5 flex gap-2" aria-label="Registration progress">
        <span className="h-1 flex-1 rounded bg-brand-600" />
        <span
          className={`h-1 flex-1 rounded ${step === 2 ? "bg-brand-600" : "bg-slate-200"}`}
        />
      </div>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        {step === 1 ? (
          <>
            <TextInput
              required
              name="business"
              label="Legal business name"
              value={data.business}
              onChange={update("business")}
              placeholder="Company LLC"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectInput
                name="industry"
                label="Industry"
                value={data.industry}
                onChange={update("industry")}
              >
                <option>Retail</option>
                <option>Hospitality</option>
                <option>Construction</option>
                <option>Healthcare</option>
                <option>Logistics</option>
              </SelectInput>
              <TextInput
                required
                name="taxId"
                label="Tax ID"
                value={data.taxId}
                onChange={update("taxId")}
                placeholder="XX-XXXXXXX"
              />
            </div>
            <TextInput
              required
              name="email"
              label="Business email"
              type="email"
              value={data.email}
              onChange={update("email")}
              placeholder="purchasing@company.com"
            />
            <TextInput
              required
              name="contact"
              label="Contact name"
              value={data.contact}
              onChange={update("contact")}
              placeholder="Full name"
            />
            <TextInput
              required
              name="password"
              label="Password"
              type="password"
              minLength="8"
              hint="Use at least 8 characters."
              value={data.password}
              onChange={update("password")}
            />
          </>
        ) : (
          <>
            <TextInput
              required
              name="address"
              label="Business address"
              value={data.address}
              onChange={update("address")}
              placeholder="Street, city, state, ZIP"
            />
            <TextInput
              required
              name="phone"
              label="Phone"
              value={data.phone}
              onChange={update("phone")}
              placeholder="+1 555 000 0000"
            />
            <SelectInput
              name="spend"
              label="Estimated monthly purchasing"
              value={data.spend}
              onChange={update("spend")}
            >
              <option>$10,000 - $50,000</option>
              <option>$50,000 - $250,000</option>
              <option>$250,000+</option>
            </SelectInput>
            <FileUpload
              required
              name="verificationFiles"
              label="Business license and tax documents"
            />
            <Checkbox
              required
              label={
                <span>
                  I agree to the{" "}
                  <Link className="font-semibold text-brand-700" to="/terms">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link className="font-semibold text-brand-700" to="/privacy">
                    Privacy Policy
                  </Link>
                </span>
              }
            />
          </>
        )}
        <div className="flex gap-2">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-secondary flex-1"
            >
              Back
            </button>
          )}
          <Button type="submit" loading={submitting} className="flex-1">
            {step === 1 ? "Continue" : "Submit for verification"}
          </Button>
        </div>
      </form>
      <p className="mt-5 text-center text-xs">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-brand-700">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
export function PendingApprovalPage() {
  return (
    <AuthShell
      title="Verification in progress"
      subtitle="Your business application has been received."
    >
      <div className="mt-7 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Clock3 size={38} />
        </span>
        <p className="mt-5 text-sm leading-6 text-slate-600">
          Our verification team is reviewing your company information and
          documents. Most applications are completed within 1-2 business days.
        </p>
        <div className="mt-5 rounded bg-slate-50 p-4 text-left text-xs">
          <strong>Application reference</strong>
          <span className="float-right font-mono">REG-2026-00582</span>
        </div>
        <Link to="/" className="btn-secondary mt-6 w-full">
          Return to marketplace
        </Link>
      </div>
    </AuthShell>
  );
}
export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your account email and we will send recovery instructions."
    >
      {sent ? (
        <div className="mt-6">
          <Alert type="success">
            Recovery instructions were sent. Check your email inbox.
          </Alert>
          <Link to="/login" className="btn-primary mt-5 w-full">
            Return to sign in
          </Link>
        </div>
      ) : (
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <TextInput
            required
            name="email"
            autoComplete="email"
            label="Business email"
            type="email"
            placeholder="name@company.com"
          />
          <button className="btn-primary w-full">
            <Mail size={15} /> Send recovery link
          </button>
          <Link className="btn-secondary w-full" to="/login">
            Back to sign in
          </Link>
        </form>
      )}
    </AuthShell>
  );
}
