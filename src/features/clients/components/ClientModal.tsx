import { X, Loader2, AlertCircle } from "lucide-react";
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
          <h2 className={styles.title}>{isEditing ? "Edit Client" : "Add New Client"}</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>
        
        {error && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", backgroundColor: "#fef2f2", color: "var(--color-danger)", padding: "0.75rem", borderRadius: "var(--radius-md)", marginBottom: "1rem", fontSize: "var(--text-sm)" }}>
            <AlertCircle size={16} />
            <span>{error.message}</span>
          </div>
        )}

        <form key={client?.id || "new"} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Full Name *</label>
            <input name="fullName" type="text" required defaultValue={client?.fullName} className={styles.input} />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Phone Number *</label>
            <input name="phoneNumber" type="tel" required defaultValue={client?.phoneNumber} className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <input name="email" type="email" defaultValue={client?.email} className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Notes</label>
            <textarea name="notes" rows={3} defaultValue={client?.notes} className={styles.input} />
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