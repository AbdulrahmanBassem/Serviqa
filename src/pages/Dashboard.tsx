import { Users, Kanban, DollarSign, AlertTriangle, Loader2 } from "lucide-react";
// import { useAuth } from "../features/auth/context/AuthContext";
import { useClients } from "../features/clients/api/clientHooks";
import { useJobs } from "../features/jobs/api/jobHooks";
import { useInventory } from "../features/inventory/api/inventoryHooks";
import styles from "./Dashboard.module.css";

export const Dashboard = () => {
  // const { user } = useAuth();
  const { data: clients, isLoading: loadingClients } = useClients();
  const { data: jobs, isLoading: loadingJobs } = useJobs();
  const { data: inventory, isLoading: loadingInventory } = useInventory();

  const isLoading = loadingClients || loadingJobs || loadingInventory;

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <Loader2 size={40} className="animate-spin" color="var(--color-primary-600)" />
      </div>
    );
  }

  // Calculations
  const totalClients = clients?.length || 0;
  
  const activeJobs = jobs?.filter(job => job.status !== "done") || [];
  
  const pendingRevenue = activeJobs.reduce((sum, job) => sum + (job.estimatedCost || 0), 0);
  
  const lowStockItems = inventory?.filter(item => item.quantity <= 5) || [];
  const recentJobs = activeJobs.slice(0, 5); // Show latest 5 active jobs

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back!</h1>
        <p className={styles.subtitle}>Here is what is happening in your shop today.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span>Active Jobs</span>
            <div className={`${styles.iconWrapper} ${styles.iconBlue}`}>
              <Kanban size={20} />
            </div>
          </div>
          <div className={styles.statValue}>{activeJobs.length}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span>Total Clients</span>
            <div className={`${styles.iconWrapper} ${styles.iconGreen}`}>
              <Users size={20} />
            </div>
          </div>
          <div className={styles.statValue}>{totalClients}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span>Pending Revenue</span>
            <div className={`${styles.iconWrapper} ${styles.iconOrange}`}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className={styles.statValue}>${pendingRevenue.toFixed(2)}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span>Low Stock Alerts</span>
            <div className={`${styles.iconWrapper} ${styles.iconRed}`}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className={styles.statValue}>{lowStockItems.length}</div>
        </div>
      </div>

      <div className={styles.sectionsGrid}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Active Jobs</h2>
          {recentJobs.length === 0 ? (
            <div className={styles.emptyState}>No active jobs at the moment.</div>
          ) : (
            <div className={styles.list}>
              {recentJobs.map(job => (
                <div key={job.id} className={styles.listItem}>
                  <span style={{ fontWeight: "500", color: "var(--color-slate-900)" }}>{job.title}</span>
                  <span style={{ 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "var(--radius-sm)", 
                    backgroundColor: "var(--color-slate-200)",
                    textTransform: "capitalize"
                  }}>
                    {job.status.replace("-", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Low Stock Items</h2>
          {lowStockItems.length === 0 ? (
            <div className={styles.emptyState}>All inventory items are well stocked.</div>
          ) : (
            <div className={styles.list}>
              {lowStockItems.map(item => (
                <div key={item.id} className={styles.listItem}>
                  <span style={{ fontWeight: "500", color: "var(--color-slate-900)" }}>{item.itemName}</span>
                  <span style={{ color: "var(--color-danger)", fontWeight: "bold" }}>
                    {item.quantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};