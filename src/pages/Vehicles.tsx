import { useState } from "react";
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { useVehicles, useDeleteVehicle } from "../features/vehicles/api/vehicleHooks";
import { useClients } from "../features/clients/api/clientHooks";
import { VehicleModal } from "../features/vehicles/components/VehicleModal";
import type { Vehicle } from "../features/vehicles/types";
import styles from "../features/vehicles/components/Vehicles.module.css";

export const Vehicles = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  
  const { data: vehicles, isLoading: loadingVehicles, error: vehicleError } = useVehicles();
  const { data: clients, isLoading: loadingClients } = useClients(); // Used to map the owner's name
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
    if (window.confirm("Are you sure you want to delete this vehicle?")) deleteVehicle(id);
  };

  const isLoading = loadingVehicles || loadingClients;

  // Helper to find the client's name based on their ID
  const getClientName = (clientId: string) => {
    const client = clients?.find(c => c.id === clientId);
    return client ? client.fullName : "Unknown Client";
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Vehicles</h1>
        <button onClick={() => handleOpenModal()} className={styles.addButton}>
          <Plus size={20} /> Add Vehicle
        </button>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.emptyState}>
            <Loader2 size={32} className="animate-spin" style={{ margin: "0 auto", color: "var(--color-primary-600)" }} />
          </div>
        ) : vehicleError ? (
          <div className={styles.emptyState} style={{ color: "var(--color-danger)" }}>
            Failed to load vehicles: {vehicleError instanceof Error ? vehicleError.message : "Unknown error"}
          </div>
        ) : vehicles?.length === 0 ? (
          <div className={styles.emptyState}>
            No vehicles found. Click "Add Vehicle" to register one.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Owner</th>
                <th>Make & Model</th>
                <th>Year</th>
                <th>Plate #</th>
                <th>VIN</th>
                <th style={{ width: "100px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles?.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td style={{ fontWeight: "500" }}>{getClientName(vehicle.clientId)}</td>
                  <td>{vehicle.make} {vehicle.model}</td>
                  <td>{vehicle.year}</td>
                  <td>{vehicle.plateNumber}</td>
                  <td>{vehicle.vin || "—"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button onClick={() => handleOpenModal(vehicle)} className={styles.actionBtn} title="Edit">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(vehicle.id)} disabled={isDeleting} className={styles.actionBtn} title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <VehicleModal isOpen={isModalOpen} onClose={handleCloseModal} vehicle={editingVehicle} />
    </div>
  );
};