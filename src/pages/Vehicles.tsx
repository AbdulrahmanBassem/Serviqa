import { useState, useMemo, useCallback } from "react";
import { Plus, Trash2, Edit2, Loader2, Search, CarFront } from "lucide-react";
import { useVehicles, useDeleteVehicle } from "../features/vehicles/api/vehicleHooks";
import { useClients } from "../features/clients/api/clientHooks";
import { VehicleModal } from "../features/vehicles/components/VehicleModal";
import type { Vehicle } from "../features/vehicles/types";
import styles from "../features/vehicles/components/Vehicles.module.css";

const getVehicleInitials = (make: string, model: string) => {
  const m1 = make ? make.charAt(0) : "";
  const m2 = model ? model.charAt(0) : "";
  return (m1 + m2).toUpperCase() || "VH";
};

const getVehicleGradient = (plate: string) => {
  const gradients = [
    "linear-gradient(135deg, #f87171, #dc2626)", // Red
    "linear-gradient(135deg, #fb923c, #ea580c)", // Orange
    "linear-gradient(135deg, #fbbf24, #d97706)", // Yellow
    "linear-gradient(135deg, #34d399, #059669)", // Green
    "linear-gradient(135deg, #60a5fa, #2563eb)", // Blue
    "linear-gradient(135deg, #a78bfa, #7c3aed)", // Purple
    "linear-gradient(135deg, #94a3b8, #475569)", // Slate
  ];
  let hash = 0;
  for (let i = 0; i < plate.length; i++) {
    hash = plate.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

export const Vehicles = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: vehicles, isLoading: loadingVehicles, error: vehicleError } = useVehicles();
  const { data: clients, isLoading: loadingClients } = useClients();
  const { mutate: deleteVehicle, isPending: isDeleting } = useDeleteVehicle();

  const handleOpenModal = (vehicle?: Vehicle) => {
    setEditingVehicle(vehicle || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingVehicle(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      deleteVehicle(id);
    }
  };

  const isLoading = loadingVehicles || loadingClients;

  const getClientName = useCallback((clientId: string) => {
    const client = clients?.find((c) => c.id === clientId);
    return client ? client.fullName : "Unknown Client";
  }, [clients]);

  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];
    if (!searchQuery.trim()) return vehicles;
    
    const query = searchQuery.toLowerCase();
    return vehicles.filter(v => {
      const ownerName = getClientName(v.clientId).toLowerCase();
      return (
        v.make.toLowerCase().includes(query) ||
        v.model.toLowerCase().includes(query) ||
        v.plateNumber.toLowerCase().includes(query) ||
        (v.vin && v.vin.toLowerCase().includes(query)) ||
        ownerName.includes(query)
      );
    });
  }, [vehicles, getClientName, searchQuery]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {/* <h1 className={styles.title}>Vehicles</h1> */}
        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
            <Search size={16} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search make, plate, or owner..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button onClick={() => handleOpenModal()} className={styles.addButton}>
            <Plus size={18} strokeWidth={2.5} /> Add Vehicle
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.emptyState}>
            <Loader2 size={32} className="animate-spin" color="var(--color-primary-600)" />
          </div>
        ) : vehicleError ? (
          <div className={styles.emptyState} style={{ color: "var(--color-danger)" }}>
            Failed to load vehicles: {vehicleError instanceof Error ? vehicleError.message : "Unknown error"}
          </div>
        ) : vehicles?.length === 0 ? (
          <div className={styles.emptyState}>
            <CarFront size={48} color="var(--color-slate-300)" />
            <p>No vehicles found. Click "Add Vehicle" to register one.</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No vehicles match your search query.</p>
          </div>
        ) : (
          <div className={styles.tableResponsiveWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Owner</th>
                  <th>Year</th>
                  <th>Plate #</th>
                  <th>VIN</th>
                  <th style={{ width: "100px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>
                      <div className={styles.vehicleNameCell}>
                        <div 
                          className={styles.vehicleIcon} 
                          style={{ background: getVehicleGradient(vehicle.plateNumber) }}
                        >
                          {getVehicleInitials(vehicle.make, vehicle.model)}
                        </div>
                        <span className={styles.vehicleName}>{vehicle.make} {vehicle.model}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{getClientName(vehicle.clientId)}</td>
                    <td>{vehicle.year}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>{vehicle.plateNumber}</td>
                    <td>{vehicle.vin || <span style={{ color: "var(--color-slate-400)" }}>—</span>}</td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button onClick={() => handleOpenModal(vehicle)} className={styles.actionBtn} title="Edit Vehicle">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(vehicle.id)} disabled={isDeleting} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete Vehicle">
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

      <VehicleModal isOpen={isModalOpen} onClose={handleCloseModal} vehicle={editingVehicle} />
    </div>
  );
};