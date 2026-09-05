import { X, Loader2, AlertCircle } from "lucide-react";
import { useCreateInventoryItem, useUpdateInventoryItem } from "../api/inventoryHooks";
import type { CreateInventoryPayload, InventoryItem } from "../types";
import styles from "./InventoryModal.module.css"; 

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item?: InventoryItem | null;
}

export const InventoryModal = ({ isOpen, onClose, item }: Props) => {
  const createMutation = useCreateInventoryItem();
  const updateMutation = useUpdateInventoryItem();

  const isEditing = !!item;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload: Partial<CreateInventoryPayload> = {
      itemName: formData.get("itemName") as string,
      quantity: parseInt(formData.get("quantity") as string, 10),
      unitPrice: parseFloat(formData.get("unitPrice") as string),
    };

    const sku = formData.get("sku") as string;
    const supplier = formData.get("supplier") as string;

    if (sku.trim()) payload.sku = sku.trim();
    if (supplier.trim()) payload.supplier = supplier.trim();

    if (isEditing) {
      updateMutation.mutate({ id: item.id, data: payload }, { onSuccess: onClose });
    } else {
      createMutation.mutate(payload as CreateInventoryPayload, { onSuccess: onClose });
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEditing ? "Edit Item" : "Add Inventory Item"}</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </div>
        
        {error && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", backgroundColor: "#fef2f2", color: "var(--color-danger)", padding: "0.75rem", borderRadius: "var(--radius-md)", marginBottom: "1rem" }}>
            <AlertCircle size={16} /><span>{error.message}</span>
          </div>
        )}

        <form key={item?.id || "new"} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Item Name *</label>
            <input name="itemName" type="text" required defaultValue={item?.itemName} className={styles.input} placeholder="e.g. Synthetic Oil 5W-30" />
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Quantity in Stock *</label>
              <input name="quantity" type="number" required defaultValue={item?.quantity} min="0" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Unit Price ($) *</label>
              <input name="unitPrice" type="number" step="0.01" required defaultValue={item?.unitPrice} min="0" className={styles.input} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>SKU / Part Number (Optional)</label>
            <input name="sku" type="text" defaultValue={item?.sku} className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Supplier / Vendor (Optional)</label>
            <input name="supplier" type="text" defaultValue={item?.supplier} className={styles.input} />
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={isPending} className={styles.submitBtn}>
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isEditing ? "Save Changes" : "Save Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};