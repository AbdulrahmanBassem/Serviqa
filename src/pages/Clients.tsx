import { useState, useMemo } from "react";
import { Plus, Trash2, Edit2, Loader2, Search, Users, Car, Phone, Mail, Wrench } from "lucide-react";
import { useClients, useDeleteClient } from "../features/clients/api/clientHooks";
import { useVehicles } from "../features/vehicles/api/vehicleHooks";
import { useJobs } from "../features/jobs/api/jobHooks";
import { ClientModal } from "../features/clients/components/ClientModal";
import { DataCard } from "../components/DataCard/DataCard";
import type { Client } from "../features/clients/types";
import styles from "../features/clients/components/Clients.module.css";

// Helper to extract initials from full name
const getInitials = (name: string) => {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "CL";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Deterministic gradients based on character codes
const getAvatarGradient = (name: string) => {
  const gradients = [
    "linear-gradient(135deg, #f87171, #ef4444)", // Red
    "linear-gradient(135deg, #fb923c, #f97316)", // Orange
    "linear-gradient(135deg, #fbbf24, #eab308)", // Yellow
    "linear-gradient(135deg, #4ade80, #22c55e)", // Green
    "linear-gradient(135deg, #60a5fa, #3b82f6)", // Blue
    "linear-gradient(135deg, #a78bfa, #8b5cf6)", // Purple
    "linear-gradient(135deg, #f472b6, #ec4899)", // Pink
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

export const Clients = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: clients, isLoading, error } = useClients();
  const { data: vehicles } = useVehicles();
  const { data: jobs } = useJobs();
  const { mutate: deleteClient, isPending: isDeleting } = useDeleteClient();

  const handleOpenModal = (client?: Client) => {
    setEditingClient(client || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingClient(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      deleteClient(id);
    }
  };

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    if (!searchQuery.trim()) return clients;
    
    const query = searchQuery.toLowerCase();
    return clients.filter(client => 
      client.fullName.toLowerCase().includes(query) ||
      client.phoneNumber.includes(query) ||
      (client.email && client.email.toLowerCase().includes(query)) ||
      (client.notes && client.notes.toLowerCase().includes(query))
    );
  }, [clients, searchQuery]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.searchContainer}>
            <Search size={15} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by client name, phone, or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Search clients"
            />
          </div>
          {clients && (
            <span className={styles.clientCountText}>
              Showing <strong>{filteredClients.length}</strong> of {clients.length} clients
            </span>
          )}
        </div>

        <button onClick={() => handleOpenModal()} className={styles.addButton}>
          <Plus size={18} strokeWidth={2.5} />
          <span>Add New Client</span>
        </button>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.emptyState}>
            <Loader2 size={36} className="animate-spin" color="var(--color-primary-600)" />
          </div>
        ) : error ? (
          <div className={styles.emptyState} style={{ color: "var(--color-danger)" }}>
            Failed to load clients: {error instanceof Error ? error.message : "Unknown error"}
          </div>
        ) : clients?.length === 0 ? (
          <div className={styles.emptyState}>
            <Users size={48} color="var(--color-slate-300)" />
            <p>No clients registered yet. Click "Add New Client" to create your first client profile.</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No clients match "{searchQuery}".</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className={`${styles.tableResponsiveWrapper} ${styles.desktopView}`}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Contact Info</th>
                    <th>Registered Vehicles</th>
                    <th>Active Repair</th>
                    <th>Member Since</th>
                    <th style={{ width: "90px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => {
                    const clientVehicles = vehicles?.filter(v => v.clientId === client.id) || [];
                    const activeJob = jobs?.find(j => j.clientId === client.id && j.status !== "done" && j.status !== "archived");

                    return (
                      <tr key={client.id}>
                        <td>
                          <div className={styles.clientNameCell}>
                            <div 
                              className={styles.avatar} 
                              style={{ background: getAvatarGradient(client.fullName) }}
                            >
                              {getInitials(client.fullName)}
                            </div>
                            <div className={styles.nameDetails}>
                              <span className={styles.clientName}>{client.fullName}</span>
                              {client.notes && (
                                <span className={styles.clientNotesPreview}>{client.notes}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className={styles.contactDetails}>
                            <a href={`tel:${client.phoneNumber}`} className={styles.contactLink} title="Call Client">
                              <Phone size={13} />
                              <span className={styles.phoneText}>{client.phoneNumber}</span>
                            </a>
                            {client.email ? (
                              <a href={`mailto:${client.email}`} className={styles.emailLink} title="Email Client">
                                <Mail size={13} />
                                <span>{client.email}</span>
                              </a>
                            ) : (
                              <span className={styles.noEmailText}>No email</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className={styles.vehiclesBadgeCell}>
                            {clientVehicles.length > 0 ? (
                              <span className={styles.vehicleCountPill}>
                                <Car size={13} />
                                <span>{clientVehicles.length} {clientVehicles.length === 1 ? "Vehicle" : "Vehicles"}</span>
                              </span>
                            ) : (
                              <span className={styles.noVehiclesText}>0 Vehicles</span>
                            )}
                          </div>
                        </td>
                        <td>
                          {activeJob ? (
                            <span className={styles.activeJobPill} title={`Status: ${activeJob.status}`}>
                              <Wrench size={12} />
                              <span>{activeJob.title}</span>
                            </span>
                          ) : (
                            <span className={styles.idleText}>Idle</span>
                          )}
                        </td>
                        <td className={styles.dateCell}>{new Date(client.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className={styles.actionGroup}>
                            <button onClick={() => handleOpenModal(client)} className={styles.actionBtn} title="Edit Client" aria-label="Edit client">
                              <Edit2 size={15} />
                            </button>
                            <button onClick={() => handleDelete(client.id)} disabled={isDeleting} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete Client" aria-label="Delete client">
                              <Trash2 size={15} />
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
              {filteredClients.map((client) => {
                const clientVehicles = vehicles?.filter(v => v.clientId === client.id) || [];
                const activeJob = jobs?.find(j => j.clientId === client.id && j.status !== "done" && j.status !== "archived");

                return (
                  <DataCard
                    key={client.id}
                    title={client.fullName}
                    subtitle={client.email || "No email on file"}
                    iconInitials={getInitials(client.fullName)}
                    iconGradient={getAvatarGradient(client.fullName)}
                    iconShape="circle"
                    details={[
                      { label: "Phone", value: <a href={`tel:${client.phoneNumber}`} style={{ color: "var(--color-primary-600)", textDecoration: "none", fontWeight: 600 }}>{client.phoneNumber}</a> },
                      { label: "Fleet", value: `${clientVehicles.length} registered` },
                      { label: "Status", value: activeJob ? <span style={{ color: "var(--color-primary-600)", fontWeight: 600 }}>In Repair</span> : "Clear" },
                      { label: "Joined", value: new Date(client.createdAt).toLocaleDateString() }
                    ]}
                    actions={
                      <>
                        <button onClick={() => handleOpenModal(client)} className={styles.actionBtn} aria-label="Edit client">
                          <Edit2 size={17} />
                        </button>
                        <button onClick={() => handleDelete(client.id)} disabled={isDeleting} className={`${styles.actionBtn} ${styles.deleteBtn}`} aria-label="Delete client">
                          <Trash2 size={17} />
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

      <ClientModal isOpen={isModalOpen} onClose={handleCloseModal} client={editingClient} />
    </div>
  );
};