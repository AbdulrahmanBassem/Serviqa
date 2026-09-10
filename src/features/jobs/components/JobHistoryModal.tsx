import { X, History, ArchiveRestore } from "lucide-react";
import { useJobs, useUnarchiveJob } from "../api/jobHooks"; // NEW IMPORT
import { useClients } from "../../clients/api/clientHooks";
import { useVehicles } from "../../vehicles/api/vehicleHooks";
import styles from "./JobHistoryModal.module.css";
import type { UsedPart } from "../types";

export const JobHistoryModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { data: jobs } = useJobs();
  const { data: clients } = useClients();
  const { data: vehicles } = useVehicles();
  const { mutate: unarchiveJob, isPending } = useUnarchiveJob(); // NEW HOOK

  if (!isOpen) return null;

  const archivedJobs = jobs?.filter(job => job.status === "archived") || [];

  const handleUnarchive = (jobId: string, estimatedCost: number | undefined, usedParts: UsedPart[] | undefined) => {
    if (window.confirm("Restore this job to 'To Do', refund the revenue, and restock parts?")) {
      unarchiveJob({ id: jobId, amount: estimatedCost || 0, usedParts });
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}><History size={24} color="var(--color-primary-600)" /> Job History</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-slate-400)' }}>
            <X size={24} />
          </button>
        </div>
        
        <div className={styles.tableContainer}>
          {archivedJobs.length === 0 ? (
            <div className={styles.emptyState}>No archived jobs found in history.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Vehicle</th>
                  <th>Service</th>
                  <th>Total</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {archivedJobs.map(job => {
                  const client = clients?.find(c => c.id === job.clientId);
                  const vehicle = vehicles?.find(v => v.id === job.vehicleId);
                  return (
                    <tr key={job.id}>
                      <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 500, color: "var(--color-slate-900)" }}>{client?.fullName || "Unknown"}</td>
                      <td>{vehicle ? `${vehicle.make} ${vehicle.model}` : "Unknown"}</td>
                      <td>{job.title}</td>
                      <td style={{ fontWeight: 600, color: "var(--color-primary-700)" }}>
                        ${job.estimatedCost?.toFixed(2) || "0.00"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button 
                          onClick={() => handleUnarchive(job.id, job.estimatedCost, job.usedParts)}
                          disabled={isPending}
                          className={styles.actionBtn}
                          title="Unarchive and Refund"
                        >
                          <ArchiveRestore size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};