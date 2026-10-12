import { X, Loader2, AlertCircle, UserPlus, UserCheck } from "lucide-react";
import { useCreateClient, useUpdateClient } from "../api/clientHooks";
import type { CreateClientPayload, Client } from "../types";
import styles from "./ClientModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null; 
}

export const ClientModal = ({ isOpen, onClose, client }: Props) => {
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const isEditing = !!client;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload: Partial<CreateClientPayload> = {
      fullName: formData.get("fullName") as string,
      phoneNumber: formData.get("phoneNumber") as string,
    };

    const email = formData.get("email") as string;
    const notes = formData.get("notes") as string;

    if (email.trim()) payload.email = email.trim();
    if (notes.trim()) payload.notes = notes.trim();

    if (isEditing) {
      updateMutation.mutate({ id: client.id, data: payload }, { onSuccess: () => onClose() });
    } else {
      createMutation.mutate(payload as CreateClientPayload, { onSuccess: () => onClose() });
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.headerIconBadge}>
              {isEditing ? <UserCheck size={22} /> : <UserPlus size={22} />}
            </div>
            <div className={styles.titleArea}>
              <h2 className={styles.title}>{isEditing ? "Edit Client" : "Register Client"}</h2>
              <span className={styles.subtitle}>
                {isEditing ? "Update customer profile & contact details" : "Add a customer to track repairs and vehicles"}
              </span>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeBtn} title="Close modal" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        
        {error && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", backgroundColor: "#fef2f2", color: "var(--color-danger)", padding: "0.75rem 1rem", borderRadius: "var(--radius-lg)", marginBottom: "1.25rem", fontSize: "var(--text-sm)", border: "1px solid #fecaca" }}>
            <AlertCircle size={16} />
            <span>{error.message}</span>
          </div>
        )}

        <form key={client?.id || "new"} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="fullName" className={styles.label}>Full Name *</label>
            <input 
              id="fullName" 
              name="fullName" 
              type="text" 
              required 
              defaultValue={client?.fullName} 
              className={styles.input} 
              placeholder="e.g. Michael Vance"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="phoneNumber" className={styles.label}>Phone Number *</label>
            <input 
              id="phoneNumber" 
              name="phoneNumber" 
              type="tel" 
              required 
              defaultValue={client?.phoneNumber} 
              className={styles.input} 
              placeholder="e.g. +1 (555) 019-2834"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              defaultValue={client?.email} 
              className={styles.input} 
              placeholder="e.g. michael.vance@example.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notes" className={styles.label}>Notes</label>
            <textarea 
              id="notes" 
              name="notes" 
              rows={3} 
              defaultValue={client?.notes} 
              className={styles.input} 
              placeholder="Special customer preferences, fleet account notes..."
            />
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={isPending} className={styles.submitBtn}>
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isEditing ? "Save Changes" : "Save Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};