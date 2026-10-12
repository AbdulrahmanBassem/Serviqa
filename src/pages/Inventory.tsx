import { useState, useMemo } from "react";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  Search, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  Layers, 
  Minus, 
  Copy, 
  Check, 
  AlertCircle
} from "lucide-react";
import { 
  useInventory, 
  useDeleteInventoryItem, 
  useUpdateInventoryItem 
} from "../features/inventory/api/inventoryHooks";
import { InventoryModal } from "../features/inventory/components/InventoryModal";
import { DataCard } from "../components/DataCard/DataCard";
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
    "linear-gradient(135deg, #2563eb, #1d4ed8)", // Mechanic Blue
    "linear-gradient(135deg, #059669, #047857)", // Emerald
    "linear-gradient(135deg, #d97706, #b45309)", // Amber
    "linear-gradient(135deg, #7c3aed, #6d28d9)", // Violet
    "linear-gradient(135deg, #0891b2, #0e7490)", // Cyan
    "linear-gradient(135deg, #475569, #334155)", // Slate
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

type StockFilter = "all" | "low" | "out" | "healthy";

export const Inventory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<StockFilter>("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { data: items, isLoading, error } = useInventory();
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteInventoryItem();
  const { mutate: updateItem } = useUpdateInventoryItem();

  const handleOpenModal = (item?: InventoryItem) => {
    setEditingItem(item || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this inventory part?")) {
      deleteItem(id);
    }
  };

  const handleAdjustQuantity = (item: InventoryItem, delta: number) => {
    const newQty = Math.max(0, item.quantity + delta);
    if (newQty !== item.quantity) {
      updateItem({ id: item.id, data: { quantity: newQty } });
    }
  };

  const handleCopy = (text: string, key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 1800);
  };

  // Executive Metrics
  const totalItemsCount = items?.length || 0;
  
  const totalValuation = useMemo(() => {
    if (!items) return 0;
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [items]);

  const lowStockCount = useMemo(() => {
    if (!items) return 0;
    return items.filter(item => item.quantity > 0 && item.quantity <= 5).length;
  }, [items]);

  const outOfStockCount = useMemo(() => {
    if (!items) return 0;
    return items.filter(item => item.quantity === 0).length;
  }, [items]);

  // Filter items based on query & selected stock tab
  const filteredItems = useMemo(() => {
    if (!items) return [];
    
    return items.filter(item => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || (
        item.itemName.toLowerCase().includes(query) ||
        (item.sku && item.sku.toLowerCase().includes(query)) ||
        (item.supplier && item.supplier.toLowerCase().includes(query))
      );

      if (!matchesSearch) return false;

      if (activeFilter === "low") {
        return item.quantity > 0 && item.quantity <= 5;
      }
      if (activeFilter === "out") {
        return item.quantity === 0;
      }
      if (activeFilter === "healthy") {
        return item.quantity > 5;
      }
      return true;
    });
  }, [items, searchQuery, activeFilter]);

  return (
    <div className={styles.container}>
      {/* Executive Inventory Metrics Strip */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={`${styles.metricIconBadge} ${styles.metricBadgeBlue}`}>
            <Layers size={22} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>Total Catalog</span>
            <span className={styles.metricValue}>{totalItemsCount}</span>
            <span className={styles.metricSubtext}>Unique parts & supplies</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconBadge} ${styles.metricBadgeEmerald}`}>
            <DollarSign size={22} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>Total Stock Valuation</span>
            <span className={styles.metricValue}>${totalValuation.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className={styles.metricSubtext}>Combined shelf value</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconBadge} ${styles.metricBadgeAmber}`}>
            <AlertTriangle size={22} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>Low Stock Alerts</span>
            <span className={styles.metricValue}>{lowStockCount}</span>
            <span className={styles.metricSubtext}>5 or fewer units left</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconBadge} ${styles.metricBadgeRed}`}>
            <Package size={22} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>Out of Stock</span>
            <span className={styles.metricValue}>{outOfStockCount}</span>
            <span className={styles.metricSubtext}>Critical replenishment needed</span>
          </div>
        </div>
      </div>

      {/* Header with Segmented Filter Tabs and Search */}
      <div className={styles.header}>
        <div className={styles.filterTabs} role="tablist" aria-label="Stock Level Filter">
          <button 
            role="tab"
            aria-selected={activeFilter === "all"}
            className={`${styles.filterTab} ${activeFilter === "all" ? styles.filterTabActive : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            <span>All Parts</span>
            <span className={styles.tabBadge}>{items?.length || 0}</span>
          </button>
          
          <button 
            role="tab"
            aria-selected={activeFilter === "low"}
            className={`${styles.filterTab} ${activeFilter === "low" ? styles.filterTabActive : ""}`}
            onClick={() => setActiveFilter("low")}
          >
            <span>Low Stock</span>
            <span className={styles.tabBadge}>{lowStockCount}</span>
          </button>

          <button 
            role="tab"
            aria-selected={activeFilter === "out"}
            className={`${styles.filterTab} ${activeFilter === "out" ? styles.filterTabActive : ""}`}
            onClick={() => setActiveFilter("out")}
          >
            <span>Out of Stock</span>
            <span className={styles.tabBadge}>{outOfStockCount}</span>
          </button>

          <button 
            role="tab"
            aria-selected={activeFilter === "healthy"}
            className={`${styles.filterTab} ${activeFilter === "healthy" ? styles.filterTabActive : ""}`}
            onClick={() => setActiveFilter("healthy")}
          >
            <span>Adequate</span>
            <span className={styles.tabBadge}>{(items?.length || 0) - lowStockCount - outOfStockCount}</span>
          </button>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
            <Search size={16} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search parts, SKU, supplier..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Search parts"
            />
          </div>
          <button onClick={() => handleOpenModal()} className={styles.addButton}>
            <Plus size={18} strokeWidth={2.5} /> Add Item
          </button>
        </div>
      </div>

      {/* Search Meta Info */}
      <div className={styles.searchMeta}>
        <span>
          Showing <strong>{filteredItems.length}</strong> of <strong>{items?.length || 0}</strong> catalog items
        </span>
        {searchQuery && (
          <span>Filtered by &ldquo;{searchQuery}&rdquo;</span>
        )}
      </div>

      {/* Table Content */}
      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.emptyState}>
            <Loader2 size={36} className="animate-spin" color="var(--color-primary-600)" />
            <p>Loading inventory catalogue...</p>
          </div>
        ) : error ? (
          <div className={styles.emptyState} style={{ color: "var(--color-danger)" }}>
            <AlertCircle size={36} />
            <p>Failed to load inventory: {error instanceof Error ? error.message : "Unknown error"}</p>
          </div>
        ) : items?.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={48} color="var(--color-slate-300)" />
            <p style={{ fontWeight: 600, color: "var(--color-slate-700)" }}>No inventory items registered</p>
            <p style={{ fontSize: "0.875rem" }}>Stock your auto repair shop with parts, fluids, and supplies.</p>
            <button onClick={() => handleOpenModal()} className={styles.addButton} style={{ marginTop: "0.5rem" }}>
              <Plus size={16} /> Add First Part
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.emptyState}>
            <Search size={36} color="var(--color-slate-300)" />
            <p style={{ fontWeight: 600, color: "var(--color-slate-700)" }}>No matching parts found</p>
            <p style={{ fontSize: "0.875rem" }}>Check your search query or switch your filter tab.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className={`${styles.tableResponsiveWrapper} ${styles.desktopView}`}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Part Name</th>
                    <th>SKU / Part #</th>
                    <th>Supplier</th>
                    <th>In Stock (Quick Adjust)</th>
                    <th>Unit Cost</th>
                    <th>Total Value</th>
                    <th style={{ width: "100px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const isSkuCopied = copiedKey === `sku-${item.id}`;
                    const lineValuation = item.quantity * item.unitPrice;

                    return (
                      <tr key={item.id}>
                        <td>
                          <div className={styles.itemNameCell}>
                            <div 
                              className={styles.itemIcon} 
                              style={{ background: getPartGradient(item.itemName) }}
                            >
                              {getPartInitials(item.itemName)}
                            </div>
                            <div className={styles.itemDetails}>
                              <span className={styles.itemName}>{item.itemName}</span>
                              <span className={styles.itemSubtext}>
                                Added {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          {item.sku ? (
                            <button 
                              className={styles.skuBadge}
                              onClick={(e) => handleCopy(item.sku!, `sku-${item.id}`, e)}
                              title="Click to copy SKU"
                            >
                              <span>{item.sku}</span>
                              {isSkuCopied ? <Check size={11} color="#10b981" /> : <Copy size={11} style={{ opacity: 0.5 }} />}
                            </button>
                          ) : (
                            <span style={{ color: "var(--color-slate-400)", fontSize: "0.85rem" }}>—</span>
                          )}
                        </td>

                        <td style={{ fontWeight: 500, color: "var(--color-slate-700)" }}>
                          {item.supplier || <span style={{ color: "var(--color-slate-400)" }}>—</span>}
                        </td>

                        <td>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <div className={styles.stockControl}>
                              <button 
                                className={styles.adjustBtn} 
                                onClick={() => handleAdjustQuantity(item, -1)}
                                disabled={item.quantity <= 0}
                                title="Reduce stock by 1"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={12} />
                              </button>
                              <span className={styles.stockCount}>{item.quantity}</span>
                              <button 
                                className={styles.adjustBtn} 
                                onClick={() => handleAdjustQuantity(item, 1)}
                                title="Increase stock by 1"
                                aria-label="Increase quantity"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            {item.quantity === 0 && (
                              <span className={styles.stockPillOut}>Out</span>
                            )}
                            {item.quantity > 0 && item.quantity <= 5 && (
                              <span className={styles.stockPillLow}>Low</span>
                            )}
                          </div>
                        </td>

                        <td>
                          <span className={styles.priceText}>${item.unitPrice.toFixed(2)}</span>
                        </td>

                        <td>
                          <span className={styles.totalValText}>${lineValuation.toFixed(2)}</span>
                        </td>

                        <td>
                          <div className={styles.actionGroup}>
                            <button 
                              onClick={() => handleOpenModal(item)} 
                              className={styles.actionBtn} 
                              title="Edit Part"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)} 
                              disabled={isDeleting} 
                              className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                              title="Delete Part"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className={styles.mobileView}>
              {filteredItems.map((item) => (
                <DataCard
                  key={item.id}
                  title={item.itemName}
                  subtitle={item.sku ? `SKU: ${item.sku}` : "No SKU"}
                  iconInitials={getPartInitials(item.itemName)}
                  iconGradient={getPartGradient(item.itemName)}
                  iconShape="square"
                  details={[
                    { 
                      label: "Stock Qty", 
                      value: (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontWeight: 700 }}>{item.quantity}</span>
                          {item.quantity === 0 && <span className={styles.stockPillOut}>Out</span>}
                          {item.quantity > 0 && item.quantity <= 5 && <span className={styles.stockPillLow}>Low</span>}
                        </div>
                      ) 
                    },
                    { label: "Unit Price", value: `$${item.unitPrice.toFixed(2)}` },
                    { label: "Total Value", value: `$${(item.quantity * item.unitPrice).toFixed(2)}` },
                    { label: "Supplier", value: item.supplier || "—" }
                  ]}
                  actions={
                    <>
                      <div className={styles.stockControl}>
                        <button 
                          className={styles.adjustBtn} 
                          onClick={() => handleAdjustQuantity(item, -1)}
                          disabled={item.quantity <= 0}
                          title="Reduce stock"
                        >
                          <Minus size={14} />
                        </button>
                        <span className={styles.stockCount}>{item.quantity}</span>
                        <button 
                          className={styles.adjustBtn} 
                          onClick={() => handleAdjustQuantity(item, 1)}
                          title="Increase stock"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button onClick={() => handleOpenModal(item)} className={styles.actionBtn} title="Edit Item">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} disabled={isDeleting} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete Item">
                        <Trash2 size={18} />
                      </button>
                    </>
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>

      <InventoryModal isOpen={isModalOpen} onClose={handleCloseModal} item={editingItem} />
    </div>
  );
};