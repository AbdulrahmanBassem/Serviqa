import { useState } from "react";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import {
  useInventory,
  useDeleteInventoryItem,
} from "../features/inventory/api/inventoryHooks";
import { InventoryModal } from "../features/inventory/components/InventoryModal";
import type { InventoryItem } from "../features/inventory/types";
import styles from "../features/inventory/components/Inventory.module.css";

export const Inventory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const { data: items, isLoading, error } = useInventory();
  const { mutate: deleteItem, isPending: isDeleting } =
    useDeleteInventoryItem();

  const handleOpenModal = (item?: InventoryItem) => {
    setEditingItem(item || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?"))
      deleteItem(id);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Inventory</h1>
        <button onClick={() => handleOpenModal()} className={styles.addButton}>
          <Plus size={20} /> Add Item
        </button>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.emptyState}>
            <Loader2
              size={32}
              className="animate-spin"
              style={{ margin: "0 auto", color: "var(--color-primary-600)" }}
            />
          </div>
        ) : error ? (
          <div
            className={styles.emptyState}
            style={{ color: "var(--color-danger)" }}
          >
            Failed to load inventory:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
        ) : items?.length === 0 ? (
          <div className={styles.emptyState}>
            No inventory found. Click "Add Item" to stock your shop.
          </div>
        ) : (
          <div className={styles.tableResponsiveWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>SKU / Part #</th>
                  <th>Supplier</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th style={{ width: "100px", textAlign: "right" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {items?.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: "500" }}>{item.itemName}</td>
                    <td>{item.sku || "—"}</td>
                    <td>{item.supplier || "—"}</td>
                    <td>
                      <span
                        style={{
                          color:
                            item.quantity <= 5
                              ? "var(--color-danger)"
                              : "inherit",
                          fontWeight: item.quantity <= 5 ? "bold" : "normal",
                        }}
                      >
                        {item.quantity} {item.quantity <= 5 && " (Low)"}
                      </span>
                    </td>
                    <td>${item.unitPrice.toFixed(2)}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => handleOpenModal(item)}
                        className={styles.actionBtn}
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting}
                        className={styles.actionBtn}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <InventoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        item={editingItem}
      />
    </div>
  );
};
