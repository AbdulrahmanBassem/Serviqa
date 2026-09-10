import { useState, useMemo } from "react";
import { Plus, Trash2, Edit2, Loader2, Search, Users } from "lucide-react";
import { useClients, useDeleteClient } from "../features/clients/api/clientHooks";
import { ClientModal } from "../features/clients/components/ClientModal";
import type { Client } from "../features/clients/types";
import styles from "../features/clients/components/Clients.module.css";

// Helper to extract initials from full name
const getInitials = (name: string) => {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Deterministic pastel gradients based on character codes
const getAvatarGradient = (name: string) => {
  const gradients = [
    "linear-gradient(135deg, #fca5a5, #ef4444)", // Red
    "linear-gradient(135deg, #fdba74, #f97316)", // Orange
    "linear-gradient(135deg, #fcd34d, #eab308)", // Yellow
    "linear-gradient(135deg, #86efac, #22c55e)", // Green
    "linear-gradient(135deg, #93c5fd, #3b82f6)", // Blue
    "linear-gradient(135deg, #c4b5fd, #8b5cf6)", // Purple
    "linear-gradient(135deg, #f9a8d4, #ec4899)", // Pink
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
      (client.email && client.email.toLowerCase().includes(query))
    );
  }, [clients, searchQuery]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {/* <h1 className={styles.title}>Clients</h1> */}
        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
            <Search size={16} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button onClick={() => handleOpenModal()} className={styles.addButton}>
            <Plus size={18} strokeWidth={2.5} /> Add Client
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
            Failed to load clients: {error instanceof Error ? error.message : "Unknown error"}
          </div>
        ) : clients?.length === 0 ? (
          <div className={styles.emptyState}>
            <Users size={48} color="var(--color-slate-300)" />
            <p>No clients found. Click "Add Client" to create one.</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No clients match your search query.</p>
          </div>
        ) : (
          <div className={styles.tableResponsiveWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Added</th>
                  <th style={{ width: "100px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div className={styles.clientNameCell}>
                        <div 
                          className={styles.avatar} 
                          style={{ background: getAvatarGradient(client.fullName) }}
                        >
                          {getInitials(client.fullName)}
                        </div>
                        <span className={styles.clientName}>{client.fullName}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>{client.phoneNumber}</td>
                    <td>{client.email || <span style={{ color: "var(--color-slate-400)" }}>—</span>}</td>
                    <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button onClick={() => handleOpenModal(client)} className={styles.actionBtn} title="Edit Client">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(client.id)} disabled={isDeleting} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete Client">
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

      <ClientModal isOpen={isModalOpen} onClose={handleCloseModal} client={editingClient} />
    </div>
  );
};