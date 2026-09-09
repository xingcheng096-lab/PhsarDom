import { useState } from "react";
import { Minus, Plus, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import {
  Alert,
  Button,
  Card,
  DateInput,
  FileUpload,
  IconButton,
  SelectInput,
  Textarea,
  TextInput,
} from "../../components/ui";
import { buyers, products, rfqs, warehouses } from "../../data";
import { currency } from "../../utils/format";
import { saveRecord } from "../../services/mockStore";

export function RfqFormPage() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const quantity = Number(fd.get("quantity"));
    const next = {};
    if (!fd.get("product")) next.product = "Select a product";
    if (!quantity || quantity < 1) next.quantity = "Enter a valid quantity";
    if (selectedProduct && quantity < selectedProduct.moq) next.quantity = `Quantity must meet the MOQ of ${selectedProduct.moq}.`;
    if (!fd.get("delivery")) next.delivery = "Select a delivery date";
    if (!fd.get("location")) next.location = "Enter a shipping location";
    if (Object.keys(next).length) return setErrors(next);
    setSubmitting(true);
    const values = Object.fromEntries(fd);
    saveRecord("rfqs", { id: Date.now(), number: `RFQ-2026-${1050 + Math.floor(Date.now() % 100)}`, buyer: "Atlas Hospitality Group", product: values.product, quantity, targetPrice: Number(values.target || 0), delivery: values.delivery, location: values.location, message: values.message, rep: "Unassigned", created: new Date().toISOString().slice(0,10), status: "New" });
    setTimeout(() => navigate("/buyer/rfqs"), 450);
  };
  return (
    <>
      <PageHeader
        title="Create Request for Quote"
        description="Submit product, pricing, and delivery requirements for commercial review."
      />
      <form onSubmit={submit} className="space-y-5">
        <Card
          title="Product Requirements"
          subtitle="Specify the product and commercial quantity."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <SelectInput
              required
              error={errors.product}
              name="product"
              label="Product"
              value={selectedProduct?.name || ""}
              onChange={(event) => { setSelectedProduct(products.find((item) => item.name === event.target.value) || null); setErrors((current) => ({...current, product:""})); }}
            >
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p.id}>{p.name}</option>
              ))}
            </SelectInput>
            <TextInput
              required
              error={errors.quantity}
              name="quantity"
              label="Required quantity"
              type="number"
              min="1"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(event) => { setQuantity(event.target.value === "" ? "" : Number(event.target.value)); setErrors((current) => ({...current, quantity:""})); }}
            />
            <TextInput
              name="target"
              label="Target unit price (USD)"
              type="number"
              min="0"
              step="0.01"
              hint="Optional target for negotiation."
            />
            <DateInput
              required
              min="2026-09-10"
              error={errors.delivery}
              name="delivery"
              label="Required delivery date"
            />
          </div>
          {selectedProduct && <div className="mt-4 grid gap-3 rounded-lg border border-brand-100 bg-brand-50/60 p-4 sm:grid-cols-4"><span><small className="block text-slate-500">Selected product</small><strong className="text-xs">{selectedProduct.name}</strong></span><span><small className="block text-slate-500">MOQ</small><strong>{selectedProduct.moq}</strong></span><span><small className="block text-slate-500">Base price</small><strong>{currency(selectedProduct.price)}</strong></span><span><small className="block text-slate-500">Available stock</small><strong>{selectedProduct.stock.toLocaleString()}</strong></span></div>}
        </Card>
        <Card title="Fulfillment Details">
          <div className="grid gap-5 md:grid-cols-2">
            <TextInput
              required
              error={errors.location}
              name="location"
              label="Shipping location"
              placeholder="City, state, ZIP"
            />
            <SelectInput name="deliveryTerms" label="Preferred delivery terms">
              <option>Delivered Duty Paid</option>
              <option>FOB Destination</option>
              <option>Buyer Pickup</option>
            </SelectInput>
            <div className="md:col-span-2">
              <Textarea
                name="message"
                label="Message and requirements"
                hint="Include packaging, compliance, or partial-shipment requirements."
                placeholder="Add commercial requirements..."
              />
            </div>
            <div className="md:col-span-2">
              <FileUpload name="supportingFiles" label="Supporting documents" />
            </div>
          </div>
        </Card>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <Button type="submit" loading={submitting}>
            <Save size={15} />
            Submit RFQ
          </Button>
        </div>
      </form>
    </>
  );
}

export function QuotationFormPage() {
  const navigate = useNavigate();
  const [pricing, setPricing] = useState({
    quantity: 100,
    unitPrice: 89.5,
    discount: 5,
    shipping: 480,
  });
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const subtotal =
    pricing.quantity * pricing.unitPrice * (1 - pricing.discount / 100);
  const update = (key) => (e) =>
    setPricing({ ...pricing, [key]: Math.max(0, Number(e.target.value)) });
  const saveDraft = (form) => { const values=Object.fromEntries(new FormData(form)); saveRecord("quotations", { id:Date.now(), number:`QT-2026-${840 + Math.floor(Date.now()%100)}`, buyer:values.buyer, rfq:values.rfq?.split(" - ")[0], amount:subtotal*1.08+pricing.shipping, discount:pricing.discount, expiry:values.validity, status:"Draft" }); setNotice("Quotation draft saved."); };
  return (
    <>
      <PageHeader
        title="Create Quotation"
        description="Prepare negotiated pricing, delivery, and payment terms for a buyer RFQ."
      />
      {notice && (
        <div className="mb-4">
          <Alert type="success" onClose={() => setNotice("")}>
            {notice}
          </Alert>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (submitting) return;
          setSubmitting(true);
          const values=Object.fromEntries(new FormData(e.currentTarget));
          saveRecord("quotations", { id:Date.now(), number:`QT-2026-${840 + Math.floor(Date.now()%100)}`, buyer:values.buyer, rfq:values.rfq?.split(" - ")[0], product:values.product, quantity:pricing.quantity, unitPrice:pricing.unitPrice, amount:subtotal*1.08+pricing.shipping, discount:pricing.discount, terms:values.paymentTerms, deliveryTerms:values.deliveryTerms, expiry:values.validity, internalNotes:values.internalNotes, status:"Sent" });
          setTimeout(()=>navigate("/sales/quotations"),450);
        }}
        className="space-y-5"
      >
        <Card
          title="Buyer & RFQ"
          subtitle="Link the quote to an assigned commercial request."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <SelectInput required name="buyer" label="Buyer">
              <option value="">Select buyer</option>
              {buyers.map((b) => (
                <option key={b.id}>{b.business}</option>
              ))}
            </SelectInput>
            <SelectInput required name="rfq" label="RFQ">
              <option value="">Select request</option>
              {rfqs.map((r) => (
                <option key={r.id}>
                  {r.number} - {r.product}
                </option>
              ))}
            </SelectInput>
          </div>
        </Card>
        <Card title="Pricing">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <SelectInput required name="product" label="Product">
              {products.map((p) => (
                <option key={p.id}>{p.name}</option>
              ))}
            </SelectInput>
            <TextInput
              required
              name="quantity"
              label="Quantity"
              type="number"
              min="1"
              value={pricing.quantity}
              onChange={update("quantity")}
            />
            <TextInput
              required
              name="unitPrice"
              label="Unit price (USD)"
              type="number"
              min="0.01"
              step="0.01"
              value={pricing.unitPrice}
              onChange={update("unitPrice")}
            />
            <TextInput
              name="discount"
              label="Discount (%)"
              type="number"
              min="0"
              max="100"
              value={pricing.discount}
              onChange={update("discount")}
            />
          </div>
          <div className="mt-5 grid gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-4">
            <span>
              <small className="block text-slate-500">Subtotal</small>
              <strong>{currency(subtotal)}</strong>
            </span>
            <span>
              <small className="block text-slate-500">Tax (8%)</small>
              <strong>{currency(subtotal * 0.08)}</strong>
            </span>
            <span>
              <small className="block text-slate-500">Shipping</small>
              <strong>{currency(pricing.shipping)}</strong>
            </span>
            <span>
              <small className="block text-slate-500">Quote total</small>
              <strong className="text-brand-800">
                {currency(subtotal * 1.08 + pricing.shipping)}
              </strong>
            </span>
          </div>
        </Card>
        <Card title="Commercial Terms">
          <div className="grid gap-5 md:grid-cols-2">
            <SelectInput name="paymentTerms" label="Payment terms">
              <option>Net-30</option>
              <option>Net-60</option>
              <option>Net-90</option>
            </SelectInput>
            <TextInput
              name="deliveryTerms"
              label="Delivery terms"
              placeholder="FOB destination, freight included"
            />
            <DateInput
              required
              name="validity"
              label="Validity date"
              min="2026-09-10"
            />
            <Textarea
              name="internalNotes"
              label="Internal notes"
              placeholder="Visible to staff only"
            />
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-2 border-t pt-4">
            <button type="button" onClick={(event)=>saveDraft(event.currentTarget.form)} className="btn-secondary">
              Save draft
            </button>
            <Button type="submit" loading={submitting}>Create and send quotation</Button>
          </div>
        </Card>
      </form>
    </>
  );
}

export function ProductFormPage() {
  const [tiers, setTiers] = useState([
    { id: crypto.randomUUID(), min: 50, max: 99, price: 5 },
    { id: crypto.randomUUID(), min: 100, max: 499, price: 4.5 },
  ]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [specifications,setSpecifications]=useState([{id:crypto.randomUUID(),key:"",value:""}]);
  const navigate = useNavigate();
  const updateTier = (id, key, value) =>
    setTiers(
      tiers.map((tier) =>
        tier.id === id ? { ...tier, [key]: Number(value) } : tier,
      ),
    );
  const submit = (e) => {
    e.preventDefault();
    const sorted=[...tiers].sort((a,b)=>a.min-b.min); const invalid =
      !tiers.length ||
      tiers.some(
        (tier, index) =>
          tier.min < 1 ||
          tier.price <= 0 ||
          (tier.max && tier.max <= tier.min) ||
          (index > 0 && tier.min <= (sorted[index - 1].max || Infinity)) ||
          (index > 0 && tier.price > sorted[index - 1].price),
      );
    if (invalid)
      return setError(
        "Pricing tiers must use valid, non-overlapping quantity ranges and positive prices.",
      );
    setSubmitting(true);
    const values=Object.fromEntries(new FormData(e.currentTarget));
    saveRecord("products", { id:Date.now(), name:values.name, sku:values.sku, category:values.category, description:values.description, status:values.status, price:Number(values.basePrice), moq:Number(values.moq), unit:values.unit, stock:Number(values.stock), warehouse:values.warehouse, bin:values.bin, reorderPoint:Number(values.reorderPoint||0), image:products[0].image, tiers:sorted.map(({id,...tier})=>tier), specifications:specifications.filter((item)=>item.key&&item.value) });
    setTimeout(()=>navigate("/admin/products"),450);
  };
  const saveDraft=(form)=>{const values=Object.fromEntries(new FormData(form));saveRecord("products",{id:Date.now(),name:values.name||"Untitled Product",sku:values.sku||`DRAFT-${Date.now()}`,category:values.category,description:values.description,status:"Draft",price:Number(values.basePrice||0),moq:Number(values.moq||1),unit:values.unit||"unit",stock:Number(values.stock||0),image:products[0].image,tiers:tiers.map(({id,...tier})=>tier)});setError("");navigate("/admin/products")};
  return (
    <>
      <PageHeader
        title="Create Product"
        description="Add a wholesale catalog item with MOQ, inventory, and volume pricing."
      />
      {error && (
        <div className="mb-4">
          <Alert onClose={() => setError("")}>{error}</Alert>
        </div>
      )}
      <form onSubmit={submit} className="space-y-5">
        <Card title="Basic Information">
          <div className="grid gap-5 md:grid-cols-2">
            <TextInput required name="name" label="Product name" />
            <TextInput required name="sku" label="SKU" />
            <SelectInput required name="category" label="Category">
              {[...new Set(products.map((p) => p.category))].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </SelectInput>
            <TextInput
              required
              name="unit"
              label="Unit of measure"
              placeholder="unit, case, carton"
            />
            <div className="md:col-span-2">
              <Textarea name="description" label="Description" />
            </div>
          </div>
        </Card>
        <Card title="MOQ & Base Pricing">
          <div className="grid gap-5 md:grid-cols-3">
            <TextInput
              required
              name="moq"
              label="Minimum order quantity"
              type="number"
              min="1"
            />
            <TextInput
              required
              name="basePrice"
              label="Base price (USD)"
              type="number"
              min="0.01"
              step=".01"
            />
            <SelectInput name="status" label="Catalog status">
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Backordered</option>
              <option>Draft</option>
              <option>Archived</option>
            </SelectInput>
          </div>
        </Card>
        <Card
          title="Tier Pricing"
          subtitle="Ranges must be sequential and non-overlapping."
        >
          <div className="space-y-3">
            {tiers.map((tier) => (
              <div
                className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
                key={tier.id}
              >
                <TextInput
                  required
                  label="Minimum quantity"
                  type="number"
                  min="1"
                  value={tier.min}
                  onChange={(e) => updateTier(tier.id, "min", e.target.value)}
                />
                <TextInput
                  label="Maximum quantity"
                  type="number"
                  min={tier.min}
                  value={tier.max}
                  onChange={(e) => updateTier(tier.id, "max", e.target.value)}
                />
                <TextInput
                  required
                  label="Unit price (USD)"
                  type="number"
                  min="0.01"
                  step=".01"
                  value={tier.price}
                  onChange={(e) => updateTier(tier.id, "price", e.target.value)}
                />
                <IconButton
                  label="Remove pricing tier"
                  className="border border-red-200 text-red-700 hover:bg-red-50"
                  type="button"
                  onClick={() =>
                    setTiers(tiers.filter((item) => item.id !== tier.id))
                  }
                >
                  <Minus size={16} />
                </IconButton>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn-secondary mt-4"
            onClick={() =>
              setTiers([
                ...tiers,
                { id: crypto.randomUUID(), min: "", max: "", price: "" },
              ])
            }
          >
            <Plus size={15} />
            Add pricing tier
          </button>
        </Card>
        <Card title="Inventory">
          <div className="grid gap-5 md:grid-cols-2">
            <TextInput
              required
              name="stock"
              label="Opening stock quantity"
              type="number"
              min="0"
            />
            <SelectInput name="warehouse" label="Warehouse">
              {warehouses.map((x) => (
                <option key={x.id}>{x.name}</option>
              ))}
            </SelectInput>
            <TextInput
              name="reorderPoint"
              label="Reorder point"
              type="number"
              min="0"
            />
            <TextInput name="bin" label="Default bin" placeholder="A1-10" />
          </div>
        </Card>
        <Card title="Product Media">
          <FileUpload
            name="productFiles"
            label="Product images and documents"
          />
        </Card>
        <Card title="Specifications" subtitle="Add structured product attributes for procurement review.">
          <div className="space-y-3">{specifications.map((item)=><div key={item.id} className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]"><TextInput label="Specification" value={item.key} onChange={(e)=>setSpecifications(specifications.map((spec)=>spec.id===item.id?{...spec,key:e.target.value}:spec))} placeholder="Example: Material"/><TextInput label="Value" value={item.value} onChange={(e)=>setSpecifications(specifications.map((spec)=>spec.id===item.id?{...spec,value:e.target.value}:spec))} placeholder="Example: Stainless steel"/><IconButton label="Remove specification" className="border border-red-200 text-red-700" onClick={()=>setSpecifications(specifications.filter((spec)=>spec.id!==item.id))}><Minus size={16}/></IconButton></div>)}</div><button type="button" className="btn-secondary mt-4" onClick={()=>setSpecifications([...specifications,{id:crypto.randomUUID(),key:"",value:""}])}><Plus size={15}/>Add specification</button>
        </Card>
          <div className="sticky bottom-3 z-20 flex flex-wrap justify-end gap-2 rounded-lg border border-slate-200 bg-white/95 p-3 shadow-float backdrop-blur">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="button" onClick={(event)=>saveDraft(event.currentTarget.form)} className="btn-secondary">Save Draft</button>
            <Button type="submit" loading={submitting}>Create Product</Button>
          </div>
      </form>
    </>
  );
}
