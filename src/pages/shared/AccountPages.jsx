import { useState } from "react";
import { Check, Mail, Save, ShieldCheck, UserRound } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import {
  Alert,
  Card,
  Checkbox,
  SelectInput,
  TextInput,
} from "../../components/ui";

export function ProfilePage({ staff = false }) {
  const [saved, setSaved] = useState(false);
  return (
    <>
      <PageHeader
        title={staff ? "My Profile" : "Business Profile"}
        description="Manage account information and communication details."
      />
      {saved && (
        <div className="mb-4">
          <Alert type="success" onClose={() => setSaved(false)}>
            Profile changes saved.
          </Alert>
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card
          title={staff ? "Personal Information" : "Company Information"}
          className="lg:col-span-2"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSaved(true);
            }}
            className="grid gap-5 sm:grid-cols-2"
          >
            <TextInput
              name="name"
              required
              label={staff ? "Full name" : "Legal business name"}
              defaultValue={staff ? "Daniel Brooks" : "Atlas Hospitality Group"}
            />
            <TextInput
              name="email"
              required
              autoComplete="email"
              label="Email"
              type="email"
              defaultValue={
                staff
                  ? "daniel@phsardom.com"
                  : "maya@atlashospitality.com"
              }
            />
            <TextInput
              name="phone"
              autoComplete="tel"
              label="Phone"
              defaultValue="+1 312 555 0142"
            />
            <SelectInput
              name="category"
              label={staff ? "Department" : "Industry"}
            >
              <option>{staff ? "Sales" : "Hospitality"}</option>
            </SelectInput>
            <div className="sm:col-span-2">
              <TextInput
                name="address"
                label="Address"
                defaultValue="455 North Michigan Avenue, Chicago, IL 60611"
              />
            </div>
            <button className="btn-primary sm:col-span-2 sm:justify-self-end">
              <Save size={15} />
              Save changes
            </button>
          </form>
        </Card>
        <div className="space-y-5">
          {staff ? (
            <>
              <Card title="Role & Access">
                <div className="text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <UserRound size={27} />
                  </span>
                  <strong className="mt-3 block">Account Executive</strong>
                  <small>Sales Department · Active</small>
                </div>
              </Card>
              <Card title="Contact Preferences">
                <p className="text-xs leading-5 text-slate-500">
                  Business notifications are sent to your work email.
                </p>
                <a
                  href="mailto:support@phsardom.com"
                  className="btn-secondary mt-4 w-full"
                >
                  <Mail size={14} />
                  Contact support
                </a>
              </Card>
            </>
          ) : (
            <>
              <Card title="Verification Status">
                <div className="text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <ShieldCheck size={28} />
                  </span>
                  <strong className="mt-3 block">Verified Account</strong>
                  <small>Verified January 14, 2026</small>
                </div>
              </Card>
              <Card title="Account Manager">
                <strong>Daniel Brooks</strong>
                <p className="mt-1 text-xs text-slate-500">
                  Senior Account Executive
                </p>
                <a
                  href="mailto:daniel@phsardom.com"
                  className="btn-secondary mt-4 w-full"
                >
                  <Mail size={14} />
                  Contact account manager
                </a>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export function SettingsPage() {
  const [saved, setSaved] = useState(false);
  return (
    <>
      <PageHeader
        title="System Settings"
        description="Configure enterprise defaults, policies, and notifications."
      />
      {saved && (
        <div className="mb-4">
          <Alert type="success" onClose={() => setSaved(false)}>
            System settings saved.
          </Alert>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
        }}
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Organization">
            <div className="space-y-4">
              <TextInput
                name="organization"
                label="Organization name"
                defaultValue="PhsarDom"
              />
              <TextInput
                name="supportEmail"
                label="Support email"
                type="email"
                defaultValue="support@phsardom.com"
              />
              <SelectInput name="currency" label="Default currency">
                <option>USD - US Dollar</option>
              </SelectInput>
            </div>
          </Card>
          <Card title="Commercial Defaults">
            <div className="space-y-4">
              <SelectInput name="terms" label="Default payment terms">
                <option>Net-30</option>
                <option>Net-60</option>
                <option>Net-90</option>
              </SelectInput>
              <TextInput
                name="validity"
                label="Default quote validity (days)"
                type="number"
                min="1"
                max="365"
                defaultValue="14"
              />
              <Checkbox
                name="approval"
                label="Require manager approval for pricing exceptions"
                defaultChecked
              />
            </div>
          </Card>
          <Card title="Notifications">
            <div className="space-y-2">
              <Checkbox name="notifyBuyers" label="New buyer registrations" defaultChecked />
              <Checkbox name="notifyStock" label="Low inventory alerts" defaultChecked />
              <Checkbox name="notifyOverdue" label="Overdue invoice alerts" defaultChecked />
              <Checkbox name="notifyRenewals" label="Contract renewal alerts" defaultChecked />
            </div>
          </Card>
          <Card title="Security">
            <div className="space-y-2">
              <Checkbox
                name="requireMfa"
                label="Require multi-factor authentication for staff"
                defaultChecked
              />
              <Checkbox name="recordActivity" label="Record administrative activity" defaultChecked />
              <SelectInput label="Session timeout">
                <option>30 minutes</option>
                <option>60 minutes</option>
              </SelectInput>
            </div>
          </Card>
        </div>
        <button className="btn-primary mt-5">
          <Save size={15} />
          Save settings
        </button>
      </form>
    </>
  );
}

export function PermissionsPage() {
  const initial = [
    ["Products", "Full", "Manage", "Manage", "View"],
    ["RFQs", "Full", "Manage", "Manage", "Own"],
    ["Quotes", "Full", "Approve", "Manage", "Own"],
    ["Purchase Orders", "Full", "Approve", "Manage", "Own"],
    ["Invoices", "Full", "Manage", "View", "Own"],
    ["Activity Logs", "Full", "None", "None", "None"],
  ];
  const [rows, setRows] = useState(initial);
  const [saved, setSaved] = useState(false);
  const update = (rowIndex, colIndex, value) =>
    setRows(
      rows.map((row, i) =>
        i === rowIndex
          ? row.map((cell, j) => (j === colIndex ? value : cell))
          : row,
      ),
    );
  return (
    <>
      <PageHeader
        title="Permission Matrix"
        description="Configure module-level access by formal application role."
        actions={
          <button className="btn-primary" onClick={() => setSaved(true)}>
            <Save size={15} />
            Save permissions
          </button>
        }
      />
      {saved && (
        <div className="mb-4">
          <Alert type="success" onClose={() => setSaved(false)}>
            Permission matrix saved.
          </Alert>
        </div>
      )}
      <Card bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                {[
                  "Module",
                  "Super Admin",
                  "Sales Manager",
                  "Account Executive",
                  "Verified Buyer",
                ].map((x) => (
                  <th className="table-cell" key={x}>
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={row[0]} className="hover:bg-slate-50">
                  <td className="table-cell font-semibold">{row[0]}</td>
                  {row.slice(1).map((value, index) => (
                    <td className="table-cell" key={index}>
                      {index === 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <Check size={14} />
                          Full
                        </span>
                      ) : (
                        <select
                          aria-label={`${row[0]} ${["Manager", "Sales", "Buyer"][index]}`}
                          value={value}
                          onChange={(e) =>
                            update(rowIndex, index + 1, e.target.value)
                          }
                          className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs"
                        >
                          <option>Manage</option>
                          <option>Approve</option>
                          <option>View</option>
                          <option>Own</option>
                          <option>None</option>
                        </select>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
