import { X, Loader2, AlertCircle } from "lucide-react";
import { useCreateVehicle, useUpdateVehicle } from "../api/vehicleHooks";
import { useClients } from "../../clients/api/clientHooks";
import type { CreateVehiclePayload, Vehicle } from "../types";
import styles from "./VehicleModal.module.css"; // Note: ensure you copy the CSS file here!

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
}

export const VehicleModal = ({ isOpen, onClose, vehicle }: Props) => {
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const { data: clients } = useClients(); // Fetch clients for the dropdown

  const isEditing = !!vehicle;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload: Partial<CreateVehiclePayload> = {
      clientId: formData.get("clientId") as string,
      make: formData.get("make") as string,
      model: formData.get("model") as string,
      year: parseInt(formData.get("year") as string, 10),
      plateNumber: formData.get("plateNumber") as string,
    };

    const vin = formData.get("vin") as string;
    if (vin.trim()) payload.vin = vin.trim(); // Prevent saving undefined

    if (isEditing) {
      updateMutation.mutate({ id: vehicle.id, data: payload }, { onSuccess: onClose });
    } else {
      createMutation.mutate(payload as CreateVehiclePayload, { onSuccess: onClose });
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEditing ? "Edit Vehicle" : "Add New Vehicle"}</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </div>
        
        {error && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", backgroundColor: "#fef2f2", color: "var(--color-danger)", padding: "0.75rem", borderRadius: "var(--radius-md)", marginBottom: "1rem", fontSize: "var(--text-sm)" }}>
            <AlertCircle size={16} /><span>{error.message}</span>
          </div>
        )}

        <form key={vehicle?.id || "new"} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Owner / Client *</label>
            <select name="clientId" required defaultValue={vehicle?.clientId} className={styles.input}>
              <option value="" disabled>Select a client...</option>
              {clients?.map(client => (
                <option key={client.id} value={client.id}>{client.fullName} ({client.phoneNumber})</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Make *</label>
              <input name="make" type="text" required defaultValue={vehicle?.make} className={styles.input} placeholder="e.g. Toyota" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Model *</label>
              <input name="model" type="text" required defaultValue={vehicle?.model} className={styles.input} placeholder="e.g. Camry" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Year *</label>
              <input name="year" type="number" required defaultValue={vehicle?.year} min="1900" max={new Date().getFullYear() + 1} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Plate Number *</label>
              <input name="plateNumber" type="text" required defaultValue={vehicle?.plateNumber} className={styles.input} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>VIN (Optional)</label>
            <input name="vin" type="text" defaultValue={vehicle?.vin} className={styles.input} />
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={isPending} className={styles.submitBtn}>
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isEditing ? "Save Changes" : "Save Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};