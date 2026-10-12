import { useState, useMemo, useCallback } from "react";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2, 
  Search, 
  CarFront, 
  Wrench, 
  Phone, 
  Copy, 
  Check, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Users
} from "lucide-react";
import { useVehicles, useDeleteVehicle } from "../features/vehicles/api/vehicleHooks";
import { useClients } from "../features/clients/api/clientHooks";
import { useJobs } from "../features/jobs/api/jobHooks";
import { VehicleModal } from "../features/vehicles/components/VehicleModal";
import { JobModal } from "../features/jobs/components/JobModal";
import type { Vehicle } from "../features/vehicles/types";
import styles from "../features/vehicles/components/Vehicles.module.css";
import { DataCard } from "../components/DataCard/DataCard";

const getVehicleInitials = (make: string, model: string) => {
  const m1 = make ? make.charAt(0) : "";
  const m2 = model ? model.charAt(0) : "";
  return (m1 + m2).toUpperCase() || "VH";
};

const getVehicleGradient = (plate: string) => {
  const gradients = [
    "linear-gradient(135deg, #2563eb, #1d4ed8)", // Mechanic Blue
    "linear-gradient(135deg, #059669, #047857)", // Emerald
    "linear-gradient(135deg, #d97706, #b45309)", // Amber
    "linear-gradient(135deg, #7c3aed, #6d28d9)", // Purple
    "linear-gradient(135deg, #dc2626, #b91c1c)", // Red
    "linear-gradient(135deg, #0891b2, #0e7490)", // Cyan
    "linear-gradient(135deg, #475569, #334155)", // Slate
  ];
  let hash = 0;
  for (let i = 0; i < plate.length; i++) {
    hash = plate.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

type VehicleFilter = "all" | "in-service" | "ready";

export const Vehicles = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<VehicleFilter>("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [jobModalVehicle, setJobModalVehicle] = useState<Vehicle | null>(null);

  const { data: vehicles, isLoading: loadingVehicles, error: vehicleError } = useVehicles();
  const { data: clients, isLoading: loadingClients } = useClients();
  const { data: jobs, isLoading: loadingJobs } = useJobs();
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
    if (window.confirm("Are you sure you want to delete this vehicle? Any historical repair logs referencing it may be affected.")) {
      deleteVehicle(id);
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

  const isLoading = loadingVehicles || loadingClients || loadingJobs;

  const getClient = useCallback((clientId: string) => {
    return clients?.find((c) => c.id === clientId);
  }, [clients]);

  // Relational jobs per vehicle
  const getVehicleJobs = useCallback((vehicleId: string) => {
    return jobs?.filter(j => j.vehicleId === vehicleId) || [];
  }, [jobs]);

  // Metric stats
  const totalVehiclesCount = vehicles?.length || 0;
  
  const vehiclesInService = useMemo(() => {
    if (!vehicles || !jobs) return 0;
    return vehicles.filter(v => {
      const vJobs = jobs.filter(j => j.vehicleId === v.id);
      return vJobs.some(j => j.status !== "done");
    }).length;
  }, [vehicles, jobs]);

  const totalCompletedJobs = useMemo(() => {
    if (!jobs) return 0;
    return jobs.filter(j => j.status === "done").length;
  }, [jobs]);

  const uniqueOwnersCount = useMemo(() => {
    if (!vehicles) return 0;
    return new Set(vehicles.map(v => v.clientId)).size;
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];
    
    return vehicles.filter(v => {
      const client = getClient(v.clientId);
      const ownerName = client?.fullName.toLowerCase() || "";
      const query = searchQuery.toLowerCase().trim();
      
      const matchesSearch = !query || (
        v.make.toLowerCase().includes(query) ||
        v.model.toLowerCase().includes(query) ||
        v.plateNumber.toLowerCase().includes(query) ||
        (v.vin && v.vin.toLowerCase().includes(query)) ||
        ownerName.includes(query)
      );

      if (!matchesSearch) return false;

      const vJobs = getVehicleJobs(v.id);
      const hasActiveJob = vJobs.some(j => j.status !== "done");

      if (activeFilter === "in-service") {
        return hasActiveJob;
      }
      if (activeFilter === "ready") {
        return !hasActiveJob;
      }
      return true;
    });
  }, [vehicles, searchQuery, activeFilter, getClient, getVehicleJobs]);

  return (
    <div className={styles.container}>
      {/* Fleet Executive Metrics Strip */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={`${styles.metricIconBadge} ${styles.metricBadgeBlue}`}>
            <CarFront size={22} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>Total Fleet</span>
            <span className={styles.metricValue}>{totalVehiclesCount}</span>
            <span className={styles.metricSubtext}>Registered customer cars</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconBadge} ${styles.metricBadgeAmber}`}>
            <Wrench size={22} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>In Workshop Now</span>
            <span className={styles.metricValue}>{vehiclesInService}</span>
            <span className={styles.metricSubtext}>Active jobs underway</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconBadge} ${styles.metricBadgeEmerald}`}>
            <CheckCircle2 size={22} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>Completed Services</span>
            <span className={styles.metricValue}>{totalCompletedJobs}</span>
            <span className={styles.metricSubtext}>Historical repair orders</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconBadge} ${styles.metricBadgePurple}`}>
            <Users size={22} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>Vehicle Owners</span>
            <span className={styles.metricValue}>{uniqueOwnersCount}</span>
            <span className={styles.metricSubtext}>Unique customer accounts</span>
          </div>
        </div>
      </div>

      {/* Header with Filter Segmented Tabs and Search */}
      <div className={styles.header}>
        <div className={styles.filterTabs} role="tablist" aria-label="Vehicle Status Filter">
          <button 
            role="tab"
            aria-selected={activeFilter === "all"}
            className={`${styles.filterTab} ${activeFilter === "all" ? styles.filterTabActive : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            <span>All Fleet</span>
            <span className={styles.tabBadge}>{vehicles?.length || 0}</span>
          </button>
          
          <button 
            role="tab"
            aria-selected={activeFilter === "in-service"}
            className={`${styles.filterTab} ${activeFilter === "in-service" ? styles.filterTabActive : ""}`}
            onClick={() => setActiveFilter("in-service")}
          >
            <span>In Service</span>
            <span className={styles.tabBadge}>{vehiclesInService}</span>
          </button>

          <button 
            role="tab"
            aria-selected={activeFilter === "ready"}
            className={`${styles.filterTab} ${activeFilter === "ready" ? styles.filterTabActive : ""}`}
            onClick={() => setActiveFilter("ready")}
          >
            <span>Available / Ready</span>
            <span className={styles.tabBadge}>{(vehicles?.length || 0) - vehiclesInService}</span>
          </button>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
            <Search size={16} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search make, model, plate, VIN..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Search vehicles"
            />
          </div>
          <button onClick={() => handleOpenModal()} className={styles.addButton}>
            <Plus size={18} strokeWidth={2.5} /> Add Vehicle
          </button>
        </div>
      </div>

      {/* Search Meta Count */}
      <div className={styles.searchMeta}>
        <span>
          Showing <strong>{filteredVehicles.length}</strong> of <strong>{vehicles?.length || 0}</strong> vehicles
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
            <p>Loading vehicle fleet records...</p>
          </div>
        ) : vehicleError ? (
          <div className={styles.emptyState} style={{ color: "var(--color-danger)" }}>
            <AlertCircle size={36} />
            <p>Failed to load vehicles: {vehicleError instanceof Error ? vehicleError.message : "Unknown error"}</p>
          </div>
        ) : vehicles?.length === 0 ? (
          <div className={styles.emptyState}>
            <CarFront size={48} color="var(--color-slate-300)" />
            <p style={{ fontWeight: 600, color: "var(--color-slate-700)" }}>No vehicles registered yet</p>
            <p style={{ fontSize: "0.875rem" }}>Register your first customer vehicle to track repairs and maintenance.</p>
            <button onClick={() => handleOpenModal()} className={styles.addButton} style={{ marginTop: "0.5rem" }}>
              <Plus size={16} /> Register First Vehicle
            </button>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className={styles.emptyState}>
            <Search size={36} color="var(--color-slate-300)" />
            <p style={{ fontWeight: 600, color: "var(--color-slate-700)" }}>No matching vehicles found</p>
            <p style={{ fontSize: "0.875rem" }}>Try checking your spelling or adjusting your filter selection.</p>
          </div>
        ) : (
          <>
            <div className={`${styles.tableResponsiveWrapper} ${styles.desktopView}`}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>License Plate</th>
                    <th>Owner Contact</th>
                    <th>Current Workshop Status</th>
                    <th>VIN</th>
                    <th style={{ width: "160px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((vehicle) => {
                    const client = getClient(vehicle.clientId);
                    const vJobs = getVehicleJobs(vehicle.id);
                    const activeJob = vJobs.find(j => j.status !== "done");
                    const completedCount = vJobs.filter(j => j.status === "done").length;
                    const isPlateCopied = copiedKey === `plate-${vehicle.id}`;
                    const isVinCopied = copiedKey === `vin-${vehicle.id}`;

                    return (
                      <tr key={vehicle.id}>
                        <td>
                          <div className={styles.vehicleNameCell}>
                            <div 
                              className={styles.vehicleIcon} 
                              style={{ background: getVehicleGradient(vehicle.plateNumber) }}
                            >
                              {getVehicleInitials(vehicle.make, vehicle.model)}
                            </div>
                            <div className={styles.vehicleDetails}>
                              <span className={styles.vehicleName}>{vehicle.make} {vehicle.model}</span>
                              <span className={styles.vehicleYear}>{vehicle.year} Model</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <button 
                            className={`${styles.plateBadge} ${isPlateCopied ? styles.plateBadgeCopied : ""}`}
                            onClick={(e) => handleCopy(vehicle.plateNumber, `plate-${vehicle.id}`, e)}
                            title="Click to copy license plate"
                          >
                            <span>{vehicle.plateNumber}</span>
                            {isPlateCopied ? <Check size={12} /> : <Copy size={12} style={{ opacity: 0.6 }} />}
                          </button>
                        </td>

                        <td>
                          <div className={styles.ownerCell}>
                            <span className={styles.ownerName}>{client ? client.fullName : "Unknown Client"}</span>
                            {client?.phoneNumber ? (
                              <a href={`tel:${client.phoneNumber}`} className={styles.phoneLink} title="Call owner">
                                <Phone size={12} />
                                <span>{client.phoneNumber}</span>
                              </a>
                            ) : (
                              <span style={{ fontSize: "0.75rem", color: "var(--color-slate-400)" }}>No phone</span>
                            )}
                          </div>
                        </td>

                        <td>
                          {activeJob ? (
                            <div>
                              <span className={`${styles.serviceBadge} ${
                                activeJob.status === "in-progress" ? styles.serviceBadgeProgress :
                                activeJob.status === "waiting-parts" ? styles.serviceBadgeWaiting :
                                styles.serviceBadgeTodo
                              }`}>
                                {activeJob.status === "in-progress" && <Clock size={12} />}
                                {activeJob.status === "waiting-parts" && <AlertCircle size={12} />}
                                {activeJob.title}
                              </span>
                              <div className={styles.historyCount}>
                                {completedCount} past {completedCount === 1 ? "repair" : "repairs"}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span className={styles.noServiceBadge}>
                                <CheckCircle2 size={13} color="#10b981" />
                                <span>Ready / Idle</span>
                              </span>
                              <div className={styles.historyCount}>
                                {completedCount} past {completedCount === 1 ? "repair" : "repairs"}
                              </div>
                            </div>
                          )}
                        </td>

                        <td>
                          {vehicle.vin ? (
                            <button 
                              className={styles.vinCell}
                              onClick={(e) => handleCopy(vehicle.vin!, `vin-${vehicle.id}`, e)}
                              title="Click to copy VIN"
                              style={{ background: "none", border: "none" }}
                            >
                              <span>{vehicle.vin}</span>
                              {isVinCopied ? <Check size={12} color="#10b981" /> : <Copy size={11} style={{ opacity: 0.5 }} />}
                            </button>
                          ) : (
                            <span style={{ color: "var(--color-slate-400)", fontSize: "0.85rem" }}>—</span>
                          )}
                        </td>

                        <td>
                          <div className={styles.actionGroup}>
                            <button 
                              onClick={() => setJobModalVehicle(vehicle)} 
                              className={styles.bookJobBtn}
                              title="Create repair job for this vehicle"
                            >
                              <Wrench size={13} />
                              <span>New Job</span>
                            </button>
                            <button 
                              onClick={() => handleOpenModal(vehicle)} 
                              className={styles.actionBtn} 
                              title="Edit Vehicle"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(vehicle.id)} 
                              disabled={isDeleting} 
                              className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                              title="Delete Vehicle"
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

            {/* Mobile View with DataCards */}
            <div className={styles.mobileView}>
              {filteredVehicles.map((vehicle) => {
                const client = getClient(vehicle.clientId);
                const vJobs = getVehicleJobs(vehicle.id);
                const activeJob = vJobs.find(j => j.status !== "done");

                return (
                  <DataCard
                    key={vehicle.id}
                    title={`${vehicle.make} ${vehicle.model}`}
                    subtitle={`Owner: ${client ? client.fullName : "Unknown"}`}
                    iconInitials={getVehicleInitials(vehicle.make, vehicle.model)}
                    iconGradient={getVehicleGradient(vehicle.plateNumber)}
                    iconShape="square"
                    details={[
                      { label: "Year", value: vehicle.year },
                      { label: "Plate #", value: vehicle.plateNumber },
                      { 
                        label: "Workshop Status", 
                        value: activeJob ? `${activeJob.title} (${activeJob.status})` : "Ready / No Active Job" 
                      },
                      { label: "VIN", value: vehicle.vin || "—" }
                    ]}
                    actions={
                      <>
                        <button 
                          onClick={() => setJobModalVehicle(vehicle)} 
                          className={styles.bookJobBtn}
                          title="Create repair job"
                        >
                          <Wrench size={14} />
                          <span>Book Job</span>
                        </button>
                        <button onClick={() => handleOpenModal(vehicle)} className={styles.actionBtn} title="Edit Vehicle">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(vehicle.id)} disabled={isDeleting} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete Vehicle">
                          <Trash2 size={18} />
                        </button>
                      </>
                    }
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Vehicle Edit/Add Modal */}
      <VehicleModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        vehicle={editingVehicle} 
      />

      {/* 1-Click Job Creation Modal with Vehicle & Client Pre-Selected */}
      <JobModal 
        isOpen={!!jobModalVehicle} 
        onClose={() => setJobModalVehicle(null)} 
        initialClientId={jobModalVehicle?.clientId}
        initialVehicleId={jobModalVehicle?.id}
      />
    </div>
  );
};