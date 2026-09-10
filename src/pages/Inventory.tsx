import { useState, useMemo } from "react";
import { Plus, Edit2, Trash2, Loader2, Search, Package } from "lucide-react";
import { useInventory, useDeleteInventoryItem } from "../features/inventory/api/inventoryHooks";
import { InventoryModal } from "../features/inventory/components/InventoryModal";
import type { InventoryItem } from "../features/inventory/types";
import styles from "../features/inventory/components/Inventory.module.css";

// Helper to extract a 2-letter abbreviation for the part icon
const getPartInitials = (name: string) => {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "PT";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

// Deterministic cool-toned gradients for inventory items
const getPartGradient = (name: string) => {
  const gradients = [
    "linear-gradient(135deg, #94a3b8, #64748b)", // Slate
    "linear-gradient(135deg, #9ca3af, #4b5563)", // Gray
    "linear-gradient(135deg, #a78bfa, #7c3aed)", // Violet
    "linear-gradient(135deg, #60a5fa, #2563eb)", // Blue
    "linear-gradient(135deg, #38bdf8, #0284c7)", // Sky
    "linear-gradient(135deg, #2dd4bf, #0d9488)", // Teal
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

export const Inventory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: items, isLoading, error } = useInventory();
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteInventoryItem();

  const handleOpenModal = (item?: InventoryItem) => {
    setEditingItem(item || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteItem(id);
    }
  };

  // Filter items based on name, SKU, or supplier
  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.itemName.toLowerCase().includes(query) ||
      (item.sku && item.sku.toLowerCase().includes(query)) ||
      (item.supplier && item.supplier.toLowerCase().includes(query))
    );
  }, [items, searchQuery]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {/* <h1 className={styles.title}>Inventory</h1> */}
        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
            <Search size={16} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search parts, SKU, or supplier..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button onClick={() => handleOpenModal()} className={styles.addButton}>
            <Plus size={18} strokeWidth={2.5} /> Add Item
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.emptyState}>
            <Loader2 size={32} className="animate-spin" color="var(--color-primary-600)" />
          </div>
        ) : error ? (
          <div className={styles.emptyState} style={{ color: "var(--color-danger)" }}>
            Failed to load inventory: {error instanceof Error ? error.message : "Unknown error"}
          </div>
        ) : items?.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={48} color="var(--color-slate-300)" />
            <p>No inventory found. Click "Add Item" to stock your shop.</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No items match your search query.</p>
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
                  <th style={{ width: "100px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className={styles.itemNameCell}>
                        <div 
                          className={styles.itemIcon} 
                          style={{ background: getPartGradient(item.itemName) }}
                        >
                          {getPartInitials(item.itemName)}
                        </div>
                        <span className={styles.itemName}>{item.itemName}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>{item.sku || <span style={{ color: "var(--color-slate-400)" }}>—</span>}</td>
                    <td>{item.supplier || <span style={{ color: "var(--color-slate-400)" }}>—</span>}</td>
                    <td>
                      {item.quantity <= 5 ? (
                        <span className={styles.lowStockBadge}>{item.quantity} Low</span>
                      ) : (
                        <span>{item.quantity}</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 500 }}>${item.unitPrice.toFixed(2)}</td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button onClick={() => handleOpenModal(item)} className={styles.actionBtn} title="Edit Item">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} disabled={isDeleting} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete Item">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <InventoryModal isOpen={isModalOpen} onClose={handleCloseModal} item={editingItem} />
    </div>
  );
};