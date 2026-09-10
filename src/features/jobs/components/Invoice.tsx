import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, Download, Plus, Trash2 } from "lucide-react";
import html2pdf from "html2pdf.js";
import { useJobs, useCompleteAndPayJob } from "../api/jobHooks";
import { useClients } from "../../clients/api/clientHooks";
import { useVehicles } from "../../vehicles/api/vehicleHooks";
import { useInventory } from "../../inventory/api/inventoryHooks";
import type { UsedPart } from "../types";
import styles from "./Invoice.module.css";

export const Invoice = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const { data: jobs, isLoading: loadingJobs } = useJobs();
  const { data: clients } = useClients();
  const { data: vehicles } = useVehicles();
  const { data: inventory } = useInventory();
  
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

  if (loadingJobs) return <div style={{ textAlign: "center", padding: "3rem" }}><Loader2 className="animate-spin" /></div>;
  if (!job) return <div style={{ textAlign: "center", padding: "3rem" }}>Job not found.</div>;

  const handleAddPart = () => {
    if (!selectedItemId) return;
    const item = inventory?.find(i => i.id === selectedItemId);
    if (!item) return;

    setSelectedParts(prev => {
      const existing = prev.find(p => p.itemId === item.id);
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

    // 1. Apply the flattening styles
    element.classList.add(styles.pdfMode);

    const opt = {
      margin: 0.5,
      filename: `Invoice_${job?.id.substring(0, 8) || 'receipt'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };

    try {
      // 2. Await the PDF generation
      await html2pdf().set(opt).from(element).save();
    } finally {
      // 3. Remove the flattening styles immediately after (even if it fails)
      element.classList.remove(styles.pdfMode);
    }
  };

  const handlePayment = () => {
    if (!mileage) {
      alert("Please enter the current vehicle mileage before completing the job.");
      return;
    }
    
    completeJob(
      { 
        id: job.id, 
        amount: grandTotal, 
        mileage: Number(mileage), 
        usedParts: selectedParts 
      }, 
      { onSuccess: () => navigate("/dashboard") }
    );
  };

  return (
    <div className={styles.container}>
      <div id="invoice-print-area">
        <div className={styles.header}>
          <h1 className={styles.title}>Serviqa Auto Repair</h1>
          <p>Official Invoice & Handover Receipt</p>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.row}>
            <span>Client</span>
            <span>{client?.fullName || "Unknown"}</span>
          </div>
          <div className={styles.row}>
            <span>Vehicle</span>
            <span>{vehicle?.make} {vehicle?.model} ({vehicle?.plateNumber})</span>
          </div>
          <div className={styles.row}>
            <span>Service</span>
            <span>{job.title}</span>
          </div>
          <div className={styles.row}>
            <span>Current Mileage</span>
            <input 
              type="number" 
              value={mileage} 
              onChange={(e) => setMileage(e.target.value ? Number(e.target.value) : "")}
              placeholder="e.g., 45000"
              className={styles.input}
            />
          </div>
        </div>

        <h3 className={styles.sectionTitle}>Parts & Materials</h3>
        
        <div className={styles.partSelector}>
          <select 
            value={selectedItemId} 
            onChange={(e) => setSelectedItemId(e.target.value)}
            className={styles.input}
            style={{ flex: 2 }}
          >
            <option value="">Select a part from inventory...</option>
            {inventory?.map(item => (
              <option key={item.id} value={item.id}>
                {item.itemName} (${item.unitPrice.toFixed(2)} ea) - {item.quantity} in stock
              </option>
            ))}
          </select>
          <input 
            type="number" 
            min="1" 
            value={selectedQty} 
            onChange={(e) => setSelectedQty(Number(e.target.value))}
            className={styles.input}
            style={{ flex: 1 }}
          />
          <button onClick={handleAddPart} disabled={!selectedItemId} className={styles.btn} style={{ background: "var(--color-primary-100)", color: "var(--color-primary-700)", padding: "0.5rem" }}>
            <Plus size={20} /> Add
          </button>
        </div>

        {selectedParts.length > 0 && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Part Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th className={styles.removeBtn}></th>
              </tr>
            </thead>
            <tbody>
              {selectedParts.map((part) => (
                <tr key={part.itemId}>
                  <td>{part.itemName}</td>
                  <td>{part.quantity}</td>
                  <td>${part.unitPrice.toFixed(2)}</td>
                  <td>${(part.quantity * part.unitPrice).toFixed(2)}</td>
                  <td>
                    <button onClick={() => handleRemovePart(part.itemId)} className={styles.removeBtn}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span>Parts Total:</span>
            <span>${partsTotal.toFixed(2)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Service Labor Fee:</span>
            <input 
              type="number" 
              value={serviceFee} 
              onChange={(e) => setServiceFee(Number(e.target.value))}
              className={styles.input}
              style={{ width: "120px", textAlign: "right" }}
            />
          </div>
          <div className={styles.grandTotal}>
            <span>Total Amount Due:</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button onClick={handleDownloadPdf} className={`${styles.btn} ${styles.downloadBtn}`}>
          <Download size={20} /> Download PDF
        </button>
        <button onClick={handlePayment} disabled={isPending} className={`${styles.btn} ${styles.payBtn}`}>
          {isPending ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
          Confirm & Collect
        </button>
      </div>
    </div>
  );
};