import { useState } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { useCreateJob, useUpdateJob } from "../api/jobHooks";
import { useClients } from "../../clients/api/clientHooks";
import { useVehicles } from "../../vehicles/api/vehicleHooks";
import type { CreateJobPayload, Job } from "../types";
import styles from "./JobModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  job?: Job | null;
}

export const JobModal = ({ isOpen, onClose, job }: Props) => {
  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();
  
  const { data: clients } = useClients();
  const { data: vehicles } = useVehicles();
  
  const [selectedClientId, setSelectedClientId] = useState<string>(job?.clientId ?? "");

  const isEditing = !!job;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  // Filter vehicles so you can only assign a car that belongs to the selected client
  const filteredVehicles = vehicles?.filter(v => v.clientId === selectedClientId) || [];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload: Partial<CreateJobPayload> = {
      clientId: formData.get("clientId") as string,
      vehicleId: formData.get("vehicleId") as string,
      title: formData.get("title") as string,
      status: formData.get("status") as CreateJobPayload["status"],
    };

    const description = formData.get("description") as string;
    const estimatedCost = formData.get("estimatedCost") as string;
    
    if (description.trim()) payload.description = description.trim();
    if (estimatedCost) payload.estimatedCost = parseFloat(estimatedCost);

    if (isEditing) {
      updateMutation.mutate({ id: job.id, data: payload }, { onSuccess: onClose });
    } else {
      createMutation.mutate(payload as CreateJobPayload, { onSuccess: onClose });
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEditing ? "Edit Job" : "Create New Job"}</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </div>
        
        {error && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", backgroundColor: "#fef2f2", color: "var(--color-danger)", padding: "0.75rem", borderRadius: "var(--radius-md)", marginBottom: "1rem" }}>
            <AlertCircle size={16} /><span>{error.message}</span>
          </div>
        )}

        <form key={job?.id || "new"} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="clientId" className={styles.label}>Client *</label>
            <select id="clientId" name="clientId" required value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className={styles.input}>
              <option value="" disabled>Select a client...</option>
              {clients?.map(client => (
                <option key={client.id} value={client.id}>{client.fullName}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="vehicleId" className={styles.label}>Vehicle *</label>
            <select id="vehicleId" name="vehicleId" required defaultValue={job?.vehicleId || ""} disabled={!selectedClientId} className={styles.input}>
              <option value="" disabled>Select a vehicle...</option>
              {filteredVehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model} ({vehicle.plateNumber})</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>Job Title *</label>
            <input name="title" type="text" required defaultValue={job?.title} className={styles.input} placeholder="e.g. Brake Pad Replacement" />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status" className={styles.label}>Initial Status *</label>
            <select id="status" name="status" required defaultValue={job?.status || "todo"} className={styles.input}>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="waiting-parts">Waiting on Parts</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Estimated Cost ($)</label>
            <input name="estimatedCost" type="number" step="0.01" defaultValue={job?.estimatedCost} className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Mechanic Notes</label>
            <textarea name="description" rows={3} defaultValue={job?.description} className={styles.input} />
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={isPending} className={styles.submitBtn}>
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isEditing ? "Save Changes" : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};