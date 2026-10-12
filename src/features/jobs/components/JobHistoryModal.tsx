import { X, History, ArchiveRestore, Inbox } from "lucide-react";
import { useJobs, useUnarchiveJob } from "../api/jobHooks";
import { useClients } from "../../clients/api/clientHooks";
import { useVehicles } from "../../vehicles/api/vehicleHooks";
import styles from "./JobHistoryModal.module.css";
import type { UsedPart } from "../types";

export const JobHistoryModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { data: jobs } = useJobs();
  const { data: clients } = useClients();
  const { data: vehicles } = useVehicles();
  const { mutate: unarchiveJob, isPending } = useUnarchiveJob();

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
          <div className={styles.headerTitleGroup}>
            <div className={styles.headerIconBadge}>
              <History size={22} />
            </div>
            <div className={styles.titleArea}>
              <h2 className={styles.title}>Archived Repair Orders</h2>
              <span className={styles.subtitle}>
                Historical invoices, settled jobs, and reversible archive logs ({archivedJobs.length} records)
              </span>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeBtn} title="Close modal" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        
        <div className={styles.tableContainer}>
          {archivedJobs.length === 0 ? (
            <div className={styles.emptyState}>
              <Inbox size={42} style={{ opacity: 0.3 }} />
              <span style={{ fontWeight: 600, color: "var(--color-slate-600)" }}>No archived repair orders found</span>
              <span style={{ fontSize: "0.8rem" }}>Completed and settled invoices will appear here.</span>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Completed Date</th>
                  <th>Client</th>
                  <th>Vehicle</th>
                  <th>Service Performed</th>
                  <th>Total Billed</th>
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
                      <td style={{ fontWeight: 600, color: "var(--color-slate-900)" }}>{client?.fullName || "Walk-in"}</td>
                      <td>{vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber})` : "—"}</td>
                      <td style={{ fontWeight: 500 }}>{job.title}</td>
                      <td className={styles.mono}>
                        ${(job.estimatedCost ?? 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button 
                          onClick={() => handleUnarchive(job.id, job.estimatedCost, job.usedParts)}
                          disabled={isPending}
                          className={styles.actionBtn}
                          title="Restore job to Kanban & restock inventory"
                        >
                          <ArchiveRestore size={14} />
                          <span>Restore</span>
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