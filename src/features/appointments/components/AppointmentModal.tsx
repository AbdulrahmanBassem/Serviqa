import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useCreateAppointment, useUpdateAppointment } from "../api/appointmentHooks";
import { useClients } from "../../clients/api/clientHooks";
import { useVehicles } from "../../vehicles/api/vehicleHooks";
import type { Appointment, CreateAppointmentPayload } from "../types";
import styles from "./AppointmentModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
}

export const AppointmentModal = ({ isOpen, onClose, appointment }: Props) => {
  const { mutate: createApt, isPending: creating } = useCreateAppointment();
  const { mutate: updateApt, isPending: updating } = useUpdateAppointment();
  const { data: clients } = useClients();
  const { data: vehicles } = useVehicles();
  
  const [selectedClientId, setSelectedClientId] = useState<string>(appointment?.clientId ?? "");

  const isEditing = !!appointment;
  const isPending = creating || updating;
  const filteredVehicles = vehicles?.filter(v => v.clientId === selectedClientId) || [];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload: Partial<CreateAppointmentPayload> = {
      clientId: formData.get("clientId") as string,
      vehicleId: formData.get("vehicleId") as string,
      title: formData.get("title") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      status: "scheduled",
    };

    const notes = formData.get("notes") as string;
    if (notes.trim()) payload.notes = notes.trim();

    if (isEditing) {
      updateApt({ id: appointment.id, data: payload }, { onSuccess: onClose });
    } else {
      createApt(payload as CreateAppointmentPayload, { onSuccess: onClose });
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEditing ? "Edit Appointment" : "Schedule Appointment"}</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </div>

        <form key={appointment?.id || "new"} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Client *</label>
            <select name="clientId" required value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className={styles.input}>
              <option value="" disabled>Select client...</option>
              {clients?.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Vehicle *</label>
            <select name="vehicleId" required defaultValue={appointment?.vehicleId || ""} disabled={!selectedClientId} className={styles.input}>
              <option value="" disabled>Select vehicle...</option>
              {filteredVehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model}</option>)}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Service Title *</label>
            <input name="title" required defaultValue={appointment?.title} className={styles.input} placeholder="e.g. Diagnostic & Oil Change" />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Date *</label>
              <input name="date" type="date" required defaultValue={appointment?.date} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Time *</label>
              <input name="time" type="time" required defaultValue={appointment?.time} className={styles.input} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Notes (Optional)</label>
            <textarea name="notes" rows={3} defaultValue={appointment?.notes} className={styles.input} />
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={isPending} className={styles.submitBtn}>
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isEditing ? "Save Changes" : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};