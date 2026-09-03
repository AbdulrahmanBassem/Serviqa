import { useState } from "react";
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { useClients, useDeleteClient } from "../features/clients/api/clientHooks";
import { ClientModal } from "../features/clients/components/ClientModal";
import type { Client } from "../features/clients/types";
import styles from "../features/clients/components/Clients.module.css";

export const Clients = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Clients</h1>
        <button onClick={() => handleOpenModal()} className={styles.addButton}>
          <Plus size={20} /> Add Client
        </button>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.emptyState}>
            <Loader2 size={32} className="animate-spin" style={{ margin: "0 auto", color: "var(--color-primary-600)" }} />
          </div>
        ) : error ? (
          <div className={styles.emptyState} style={{ color: "var(--color-danger)" }}>
            Failed to load clients: {error instanceof Error ? error.message : "Unknown error"}
          </div>
        ) : clients?.length === 0 ? (
          <div className={styles.emptyState}>
            No clients found. Click "Add Client" to create one.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Added</th>
                <th style={{ width: "100px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients?.map((client) => (
                <tr key={client.id}>
                  <td style={{ fontWeight: "500" }}>{client.fullName}</td>
                  <td>{client.phoneNumber}</td>
                  <td>{client.email || "—"}</td>
                  <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: "right" }}>
                    <button 
                      onClick={() => handleOpenModal(client)}
                      className={styles.actionBtn}
                      title="Edit Client"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(client.id)}
                      disabled={isDeleting}
                      className={styles.actionBtn}
                      title="Delete Client"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ClientModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        client={editingClient} 
      />
    </div>
  );
};