import { X, Loader2, AlertCircle, Package } from "lucide-react";
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
          <div className={styles.headerTitleGroup}>
            <div className={styles.headerIconBadge}>
              <Package size={22} />
            </div>
            <div className={styles.titleArea}>
              <h2 className={styles.title}>{isEditing ? "Edit Inventory Part" : "Catalog New Part"}</h2>
              <span className={styles.subtitle}>
                {isEditing ? "Adjust stock quantities, prices, or vendor info" : "Add replacement part or consumable to inventory"}
              </span>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeBtn} title="Close modal" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        
        {error && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", backgroundColor: "#fef2f2", color: "var(--color-danger)", padding: "0.75rem 1rem", borderRadius: "var(--radius-lg)", marginBottom: "1.25rem", border: "1px solid #fecaca", fontSize: "var(--text-sm)" }}>
            <AlertCircle size={16} /><span>{error.message}</span>
          </div>
        )}

        <form key={item?.id || "new"} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="itemName" className={styles.label}>Part Description / Item Name *</label>
            <input 
              id="itemName"
              name="itemName" 
              type="text" 
              required 
              defaultValue={item?.itemName} 
              className={styles.input} 
              placeholder="e.g. Synthetic Motor Oil 5W-30 (1 Qt)" 
            />
          </div>
          
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="quantity" className={styles.label}>Initial Stock Count *</label>
              <input 
                id="quantity"
                name="quantity" 
                type="number" 
                required 
                defaultValue={item?.quantity ?? 0} 
                min="0" 
                className={styles.input} 
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="unitPrice" className={styles.label}>Unit Price ($) *</label>
              <input 
                id="unitPrice"
                name="unitPrice" 
                type="number" 
                step="0.01" 
                required 
                defaultValue={item?.unitPrice ?? 0} 
                min="0" 
                className={styles.input} 
                placeholder="0.00"
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="sku" className={styles.label}>SKU / Part # (Optional)</label>
              <input 
                id="sku"
                name="sku" 
                type="text" 
                defaultValue={item?.sku} 
                className={styles.input} 
                placeholder="e.g. OIL-5W30-SYN"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="supplier" className={styles.label}>Supplier / Vendor (Optional)</label>
              <input 
                id="supplier"
                name="supplier" 
                type="text" 
                defaultValue={item?.supplier} 
                className={styles.input} 
                placeholder="e.g. AutoZone, Napa"
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={isPending} className={styles.submitBtn}>
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isEditing ? "Save Changes" : "Save Part"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};