import { X, Loader2, AlertCircle, CarFront } from "lucide-react";
import { useCreateVehicle, useUpdateVehicle } from "../api/vehicleHooks";
import { useClients } from "../../clients/api/clientHooks";
import type { CreateVehiclePayload, Vehicle } from "../types";
import styles from "./VehicleModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
}

export const VehicleModal = ({ isOpen, onClose, vehicle }: Props) => {
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const { data: clients } = useClients();

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
    if (vin.trim()) payload.vin = vin.trim();

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
          <div className={styles.headerTitleGroup}>
            <div className={styles.headerIconBadge}>
              <CarFront size={22} />
            </div>
            <div className={styles.titleArea}>
              <h2 className={styles.title}>{isEditing ? "Edit Vehicle" : "Register Vehicle"}</h2>
              <span className={styles.subtitle}>
                {isEditing ? "Update vehicle specifications & ownership" : "Add customer car to shop maintenance fleet"}
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

        <form key={vehicle?.id || "new"} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="clientId" className={styles.label}>Owner / Client *</label>
            <select 
              id="clientId"
              name="clientId" 
              required 
              defaultValue={vehicle?.clientId} 
              className={styles.input}
            >
              <option value="" disabled>Select a registered client...</option>
              {clients?.map(client => (
                <option key={client.id} value={client.id}>
                  {client.fullName} ({client.phoneNumber})
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="make" className={styles.label}>Make *</label>
              <input 
                id="make"
                name="make" 
                type="text" 
                required 
                defaultValue={vehicle?.make} 
                className={styles.input} 
                placeholder="e.g. Toyota, BMW" 
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="model" className={styles.label}>Model *</label>
              <input 
                id="model"
                name="model" 
                type="text" 
                required 
                defaultValue={vehicle?.model} 
                className={styles.input} 
                placeholder="e.g. Camry, 330i" 
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="year" className={styles.label}>Year *</label>
              <input 
                id="year"
                name="year" 
                type="number" 
                required 
                defaultValue={vehicle?.year || new Date().getFullYear()} 
                min="1950" 
                max={new Date().getFullYear() + 2} 
                className={styles.input} 
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="plateNumber" className={styles.label}>Plate Number *</label>
              <input 
                id="plateNumber"
                name="plateNumber" 
                type="text" 
                required 
                defaultValue={vehicle?.plateNumber} 
                className={styles.input} 
                placeholder="e.g. ABC-1234"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="vin" className={styles.label}>VIN (Vehicle Identification Number)</label>
            <input 
              id="vin"
              name="vin" 
              type="text" 
              defaultValue={vehicle?.vin} 
              className={styles.input} 
              placeholder="17-character VIN (optional)"
            />
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={isPending} className={styles.submitBtn}>
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isEditing ? "Save Changes" : "Register Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};