import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Loader2, 
  CheckCircle, 
  Download, 
  Plus, 
  Trash2, 
  ArrowLeft 
} from "lucide-react";
import html2pdf from "html2pdf.js";
import { useJobs, useCompleteAndPayJob } from "../api/jobHooks";
import { useClients } from "../../clients/api/clientHooks";
import { useVehicles } from "../../vehicles/api/vehicleHooks";
import { useInventory } from "../../inventory/api/inventoryHooks";
import { useShopProfile } from "../../auth/api/shopHooks";
import type { UsedPart } from "../types";
import styles from "./Invoice.module.css";

export const Invoice = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const { data: jobs, isLoading: loadingJobs } = useJobs();
  const { data: clients } = useClients();
  const { data: vehicles } = useVehicles();
  const { data: inventory } = useInventory();
  const { data: shopProfile } = useShopProfile();
  
  const { mutate: completeJob, isPending } = useCompleteAndPayJob();

  const job = jobs?.find(j => j.id === jobId);
  const client = clients?.find(c => c.id === job?.clientId);
  const vehicle = vehicles?.find(v => v.id === job?.vehicleId);

  // Invoice Builder State
  const [mileage, setMileage] = useState<number | "">("");
  const [serviceFee, setServiceFee] = useState<number>(job?.estimatedCost || 0);
  const [selectedParts, setSelectedParts] = useState<UsedPart[]>([]);
  
  // Part Selector State
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);

  const partsTotal = useMemo(() => {
    return selectedParts.reduce((sum, part) => sum + (part.quantity * part.unitPrice), 0);
  }, [selectedParts]);

  const grandTotal = partsTotal + (Number(serviceFee) || 0);

  if (loadingJobs) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <Loader2 size={36} className="animate-spin" color="var(--color-primary-600)" />
        <p style={{ color: "var(--color-slate-500)" }}>Loading repair order & invoice details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <h2>Repair Order Not Found</h2>
        <p style={{ color: "var(--color-slate-500)", marginBottom: "1.5rem" }}>
          The requested repair order could not be located in your database.
        </p>
        <button onClick={() => navigate("/jobs")} className={styles.backBtn}>
          <ArrowLeft size={16} /> Return to Kanban
        </button>
      </div>
    );
  }

  const handleAddPart = () => {
    if (!selectedItemId) return;
    const item = inventory?.find(i => i.id === selectedItemId);
    if (!item) return;

    // Check available stock
    const existing = selectedParts.find(p => p.itemId === item.id);
    const alreadySelected = existing ? existing.quantity : 0;
    const totalDesired = alreadySelected + selectedQty;

    if (totalDesired > item.quantity) {
      alert(`Cannot add ${selectedQty} units. Only ${item.quantity - alreadySelected} more units of "${item.itemName}" remain in inventory.`);
      return;
    }

    setSelectedParts(prev => {
      if (existing) {
        return prev.map(p => p.itemId === item.id ? { ...p, quantity: p.quantity + selectedQty } : p);
      }
      return [...prev, { itemId: item.id, itemName: item.itemName, quantity: selectedQty, unitPrice: item.unitPrice }];
    });
    
    setSelectedItemId("");
    setSelectedQty(1);
  };

  const handleRemovePart = (itemId: string) => {
    setSelectedParts(prev => prev.filter(p => p.itemId !== itemId));
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('invoice-print-area');
    if (!element) return;

    element.classList.add(styles.pdfMode);

    const opt = {
      margin: 0.4,
      filename: `Serviqa_Invoice_${job.id.substring(0, 8).toUpperCase()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } finally {
      element.classList.remove(styles.pdfMode);
    }
  };

  const handlePayment = () => {
    if (!mileage) {
      alert("Please enter the vehicle's odometer mileage before completing this invoice.");
      return;
    }
    
    completeJob(
      { 
        id: job.id, 
        amount: grandTotal, 
        mileage: Number(mileage), 
        usedParts: selectedParts 
      }, 
      { onSuccess: () => navigate("/jobs") }
    );
  };

  const todayStr = new Date().toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });

  return (
    <div className={styles.wrapper}>
      {/* Top Bar Navigation */}
      <div className={styles.topBar}>
        <button onClick={() => navigate("/jobs")} className={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Back to Kanban</span>
        </button>
      </div>

      <div className={styles.container} id="invoice-print-area">
        {/* Invoice Header with Dynamic Shop Profile */}
        <div className={styles.header}>
          <div className={styles.shopInfo}>
            <div className={styles.shopName}>
              {shopProfile?.shopName || "Serviqa Auto Care"}
            </div>
            <div className={styles.shopMeta}>
              {shopProfile?.ownerName && <span>Owner: {shopProfile.ownerName} • </span>}
              {shopProfile?.phoneNumber && <span>Tel: {shopProfile.phoneNumber} • </span>}
              <span>{shopProfile?.email || "service@serviqa.com"}</span>
            </div>
          </div>

          <div className={styles.invoiceMeta}>
            <span className={styles.invoicePill}>
              #INV-{job.id.substring(0, 8).toUpperCase()}
            </span>
            <span className={styles.invoiceDate}>
              Issued: {todayStr}
            </span>
          </div>
        </div>

        {/* Client & Vehicle Two-Column Info Card */}
        <div className={styles.infoGrid}>
          <div className={styles.infoCol}>
            <span className={styles.colHeading}>Customer Information</span>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Client Name:</span>
              <span className={styles.rowValue}>{client?.fullName || "Walk-in Client"}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Phone Number:</span>
              <span className={`${styles.rowValue} ${styles.mono}`}>{client?.phoneNumber || "—"}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Service Order:</span>
              <span className={styles.rowValue}>{job.title}</span>
            </div>
          </div>

          <div className={styles.infoCol}>
            <span className={styles.colHeading}>Vehicle Specifications</span>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Vehicle:</span>
              <span className={styles.rowValue}>
                {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Unassigned"}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>License Plate:</span>
              <span className={`${styles.rowValue} ${styles.mono}`}>
                {vehicle?.plateNumber || "—"}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Current Mileage:</span>
              <input 
                type="number" 
                value={mileage} 
                onChange={(e) => setMileage(e.target.value ? Number(e.target.value) : "")}
                placeholder="e.g. 52,400"
                className={styles.mileageInput}
                aria-label="Current Odometer Mileage"
              />
            </div>
          </div>
        </div>

        {/* Parts & Materials Breakdown */}
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Itemized Parts & Supplies</h3>
        </div>
        
        <div className={styles.partSelector}>
          <select 
            value={selectedItemId} 
            onChange={(e) => setSelectedItemId(e.target.value)}
            className={styles.partSelect}
            aria-label="Select replacement part"
          >
            <option value="">Select a part from inventory...</option>
            {inventory?.map(item => (
              <option key={item.id} value={item.id} disabled={item.quantity === 0}>
                {item.itemName} (${item.unitPrice.toFixed(2)} ea) — {item.quantity} in stock
              </option>
            ))}
          </select>

          <input 
            type="number" 
            min="1" 
            value={selectedQty} 
            onChange={(e) => setSelectedQty(Math.max(1, Number(e.target.value)))}
            className={styles.qtyInput}
            aria-label="Part quantity"
          />

          <button 
            onClick={handleAddPart} 
            disabled={!selectedItemId} 
            className={styles.addPartBtn}
          >
            <Plus size={16} />
            <span>Add Part</span>
          </button>
        </div>

        {selectedParts.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Part Description</th>
                <th style={{ width: "80px", textAlign: "center" }}>Qty</th>
                <th style={{ width: "120px", textAlign: "right" }}>Unit Price</th>
                <th style={{ width: "120px", textAlign: "right" }}>Line Total</th>
                <th style={{ width: "50px", textAlign: "right" }}></th>
              </tr>
            </thead>
            <tbody>
              {selectedParts.map((part) => (
                <tr key={part.itemId}>
                  <td style={{ fontWeight: 600 }}>{part.itemName}</td>
                  <td style={{ textAlign: "center" }} className={styles.mono}>{part.quantity}</td>
                  <td style={{ textAlign: "right" }} className={styles.mono}>${part.unitPrice.toFixed(2)}</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }} className={styles.mono}>
                    ${(part.quantity * part.unitPrice).toFixed(2)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button 
                      onClick={() => handleRemovePart(part.itemId)} 
                      className={styles.removeBtn}
                      title="Remove part"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--color-slate-400)", fontSize: "0.85rem", border: "1px dashed #e2e8f0", borderRadius: "var(--radius-lg)", marginBottom: "1.5rem" }}>
            No parts or fluids added. Add inventory materials using the selector above if applicable.
          </div>
        )}

        {/* Totals Summary */}
        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span>Parts & Fluids Total:</span>
            <span className={styles.mono}>${partsTotal.toFixed(2)}</span>
          </div>

          <div className={styles.totalRow}>
            <span>Service & Labor Fee:</span>
            <input 
              type="number" 
              value={serviceFee} 
              onChange={(e) => setServiceFee(Number(e.target.value))}
              className={styles.laborInput}
              aria-label="Service & Labor Fee"
            />
          </div>

          <div className={styles.grandTotal}>
            <span>Amount Due:</span>
            <span className={styles.grandTotalValue}>${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className={styles.actions}>
          <button onClick={handleDownloadPdf} className={`${styles.btn} ${styles.downloadBtn}`}>
            <Download size={18} />
            <span>Download PDF Receipt</span>
          </button>
          
          <button 
            onClick={handlePayment} 
            disabled={isPending} 
            className={`${styles.btn} ${styles.payBtn}`}
          >
            {isPending ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
            <span>Confirm Handover & Payment</span>
          </button>
        </div>
      </div>
    </div>
  );
};