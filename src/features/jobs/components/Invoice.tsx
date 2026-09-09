import { useParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle } from "lucide-react";
import { useJobs, useCompleteAndPayJob } from "../api/jobHooks";
import { useClients } from "../../clients/api/clientHooks";
import { useVehicles } from "../../vehicles/api/vehicleHooks";
import styles from "./Invoice.module.css";

export const Invoice = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  const { data: jobs, isLoading: loadingJobs } = useJobs();
  const { data: clients } = useClients();
  const { data: vehicles } = useVehicles();
  const { mutate: completeJob, isPending } = useCompleteAndPayJob();

  const job = jobs?.find(j => j.id === jobId);
  const client = clients?.find(c => c.id === job?.clientId);
  const vehicle = vehicles?.find(v => v.id === job?.vehicleId);

  if (loadingJobs) return <div style={{ textAlign: "center", padding: "3rem" }}>Loading...</div>;
  if (!job) return <div style={{ textAlign: "center", padding: "3rem" }}>Job not found.</div>;

  const handlePayment = () => {
    const amount = job.estimatedCost || 0;
    completeJob({ id: job.id, amount }, {
      onSuccess: () => navigate("/dashboard") // Go back to dashboard to see updated charts
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Serviqa Auto Repair</h1>
        <p>Official Invoice & Handover Receipt</p>
      </div>

      <div className={styles.row}>
        <span>Client:</span>
        <span style={{ fontWeight: 600 }}>{client?.fullName || "Unknown"}</span>
      </div>
      <div className={styles.row}>
        <span>Vehicle:</span>
        <span style={{ fontWeight: 600 }}>{vehicle?.make} {vehicle?.model} ({vehicle?.plateNumber})</span>
      </div>
      <div className={styles.row}>
        <span>Service:</span>
        <span style={{ fontWeight: 600 }}>{job.title}</span>
      </div>
      
      {job.description && (
        <div style={{ marginTop: "1rem", color: "var(--color-slate-500)", fontSize: "0.875rem" }}>
          Notes: {job.description}
        </div>
      )}

      <div className={styles.totalRow}>
        <span>Total Amount Due</span>
        <span>${(job.estimatedCost || 0).toFixed(2)}</span>
      </div>

      <button onClick={handlePayment} disabled={isPending} className={styles.payBtn}>
        {isPending ? <Loader2 className="animate-spin" /> : <CheckCircle />}
        Confirm Payment & Handover
      </button>
    </div>
  );
};