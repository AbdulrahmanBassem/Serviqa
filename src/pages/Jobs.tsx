import { useState } from "react";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { useJobs, useUpdateJobStatus, useDeleteJob } from "../features/jobs/api/jobHooks";
import { useClients } from "../features/clients/api/clientHooks";
import { useVehicles } from "../features/vehicles/api/vehicleHooks";
import { JobModal } from "../features/jobs/components/JobModal";
import type { Job, JobStatus } from "../features/jobs/types";
import styles from "../features/jobs/components/Jobs.module.css";

const COLUMNS: { id: JobStatus; label: string }[] = [
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "waiting-parts", label: "Waiting on Parts" },
  { id: "done", label: "Done" },
];

export const Jobs = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const { data: jobs, isLoading: loadingJobs } = useJobs();
  const { data: clients } = useClients();
  const { data: vehicles } = useVehicles();
  const { mutate: updateStatus } = useUpdateJobStatus();
  const { mutate: deleteJob } = useDeleteJob();

  const handleOpenModal = (job?: Job) => {
    setEditingJob(job || null);
    setIsModalOpen(true);
  };

  const getClientName = (id: string) => clients?.find(c => c.id === id)?.fullName || "Unknown";
  const getVehicleName = (id: string) => {
    const v = vehicles?.find(v => v.id === id);
    return v ? `${v.make} ${v.model}` : "Unknown";
  };

  if (loadingJobs) return <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}><Loader2 size={32} className="animate-spin" color="var(--color-primary-600)" /></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Active Jobs</h1>
        <button onClick={() => handleOpenModal()} className={styles.addButton}>
          <Plus size={20} /> Create Job
        </button>
      </div>

      <div className={styles.board}>
        {COLUMNS.map(column => {
          const columnJobs = jobs?.filter(job => job.status === column.id) || [];
          
          return (
            <div key={column.id} className={styles.column}>
              <div className={styles.columnHeader}>
                {column.label} <span>{columnJobs.length}</span>
              </div>
              
              {columnJobs.map(job => (
                <div key={job.id} className={styles.card}>
                  <div className={styles.cardTitle}>{job.title}</div>
                  <div className={styles.cardTags}>
                    <span>👤 {getClientName(job.clientId)}</span>
                    <span>🚗 {getVehicleName(job.vehicleId)}</span>
                  </div>
                  <div className={styles.cardActions}>
                    <select 
                      className={styles.statusSelect} 
                      value={job.status} 
                      onChange={(e) => updateStatus({ id: job.id, status: e.target.value as JobStatus })}
                    >
                      {COLUMNS.map(col => <option key={col.id} value={col.id}>{col.label}</option>)}
                    </select>
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      <button onClick={() => handleOpenModal(job)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-slate-400)" }}><Edit2 size={14} /></button>
                      <button onClick={() => { if(window.confirm("Delete job?")) deleteJob(job.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-danger)" }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <JobModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingJob(null); }} job={editingJob} />
    </div>
  );
};