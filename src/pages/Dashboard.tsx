import { useNavigate } from "react-router-dom";
import { Users, Kanban, DollarSign, AlertTriangle, Loader2, ClipboardList, PackageOpen, PlusCircle, UserPlus, Search } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useClients } from "../features/clients/api/clientHooks";
import { useJobs } from "../features/jobs/api/jobHooks";
import { useDailyMetrics } from "../features/jobs/api/jobHooks";
import { useInventory } from "../features/inventory/api/inventoryHooks";
import styles from "./Dashboard.module.css";
import { useMemo, useState } from "react";

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'done': return { bg: '#dcfce7', color: '#166534' };
    case 'in-progress': return { bg: '#dbeafe', color: '#1e40af' };
    case 'waiting-parts': return { bg: '#ffedd5', color: '#9a3412' };
    default: return { bg: '#f1f5f9', color: '#475569' };
  }
};

const PIE_COLORS = {
  'todo': '#94a3b8',
  'in-progress': '#3b82f6',
  'waiting-parts': '#f97316',
  'done': '#22c55e'
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: number | string | null }>;
  label?: string | number;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <div className={styles.tooltipLabel}>{label}</div>
        <div className={styles.tooltipValue}>${Number(payload[0].value ?? 0).toFixed(2)}</div>
      </div>
    );
  }
  return null;
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { data: clients, isLoading: loadingClients } = useClients();
  const { data: jobs, isLoading: loadingJobs } = useJobs();
  const { data: inventory, isLoading: loadingInventory } = useInventory();
  
  const [timeRange, setTimeRange] = useState<number>(7);
  const { data: metrics, isLoading: loadingMetrics } = useDailyMetrics(timeRange);

  const isLoading = loadingClients || loadingJobs || loadingInventory || loadingMetrics;

  const revenueData = useMemo(() => {
    const days = [];
    for (let i = timeRange - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split("T")[0];
      const label = timeRange === 7 
        ? new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d)
        : `${d.getMonth() + 1}/${d.getDate()}`;
      
      const dayData = metrics?.find(m => m.date === dateString);
      days.push({ name: label, total: dayData ? dayData.revenue : 0 });
    }
    return days;
  }, [metrics, timeRange]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <Loader2 size={40} className="animate-spin" color="var(--color-primary-600)" />
      </div>
    );
  }

  const totalClients = clients?.length || 0;
  const activeJobs = jobs?.filter(job => (job.status !== "done" && job.status !== "archived")) || [];
  const pendingRevenue = activeJobs.reduce((sum, job) => sum + (job.estimatedCost || 0), 0);
  const lowStockItems = inventory?.filter(item => item.quantity <= 5) || [];
  const recentJobs = activeJobs.slice(0, 5);

  const jobStatusCounts = jobs?.reduce((acc, job) => {
    if (job.status === "archived") return acc;
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const pieData = Object.keys(jobStatusCounts).map(key => ({
    name: key.replace('-', ' '),
    value: jobStatusCounts[key],
    color: PIE_COLORS[key as keyof typeof PIE_COLORS] || '#cbd5e1'
  }));

  const todayDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <div className={styles.container}>
      <div className={styles.greetingWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>{getGreeting()}!</h1>
          <p className={styles.subtitle}>{todayDate} — Here is what is happening in your shop today.</p>
        </div>
        
        <div className={styles.quickActions}>
          <button onClick={() => navigate('/jobs')} className={styles.actionBtn}>
            <PlusCircle size={16} /><span>New Job</span>
          </button>
          <button onClick={() => navigate('/clients')} className={styles.actionBtn}>
            <UserPlus size={16} /><span>Add Client</span>
          </button>
          <button onClick={() => navigate('/inventory')} className={styles.actionBtn}>
            <Search size={16} /><span>Search Parts</span>
          </button>
        </div>
      </div>

      {/* Restored 4-Card Equal Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>Active Jobs</div>
          <div className={styles.statValue}>{activeJobs.length}</div>
          <Kanban size={100} strokeWidth={1} className={styles.watermarkIcon} />
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>Total Clients</div>
          <div className={styles.statValue}>{totalClients}</div>
          <Users size={100} strokeWidth={1} className={styles.watermarkIcon} />
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>Pending Revenue</div>
          <div className={styles.statValue}>${pendingRevenue.toFixed(2)}</div>
          <DollarSign size={100} strokeWidth={1} className={styles.watermarkIcon} />
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>Low Stock Alerts</div>
          <div className={styles.statValue}>{lowStockItems.length}</div>
          <AlertTriangle size={100} strokeWidth={1} className={styles.watermarkIcon} />
        </div>
      </div>

      {/* Redesigned Full-Width Chart */}
      <div className={styles.fullWidthChart}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Revenue Trend</h2>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className={styles.timeRangeSelect}
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
          </select>
        </div>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(59, 130, 246, 0.2)', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pipeline Chart moved to the 3-Column Bottom Grid */}
      <div className={styles.sectionsGrid}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Pipeline Breakdown</h2>
          <div className={styles.chartContainer} style={{ height: '240px', marginTop: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 600, textTransform: 'capitalize' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Active Jobs</h2>
          {recentJobs.length === 0 ? (
            <div className={styles.emptyState}>
              <ClipboardList size={32} strokeWidth={1.5} />
              <span>No active jobs at the moment.</span>
            </div>
          ) : (
            <div className={styles.list}>
              {recentJobs.map(job => {
                const statusStyle = getStatusStyle(job.status);
                return (
                  <div key={job.id} className={styles.listItem}>
                    <span style={{ fontWeight: "600", color: "var(--color-slate-900)" }}>{job.title}</span>
                    <span style={{ 
                      padding: "0.25rem 0.75rem", 
                      borderRadius: "var(--radius-full)", 
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      textTransform: "capitalize"
                    }}>
                      {job.status.replace("-", " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Low Stock Items</h2>
          {lowStockItems.length === 0 ? (
            <div className={styles.emptyState}>
              <PackageOpen size={32} strokeWidth={1.5} />
              <span>All inventory items are well stocked.</span>
            </div>
          ) : (
            <div className={styles.list}>
              {lowStockItems.map(item => (
                <div key={item.id} className={styles.listItem}>
                  <span style={{ fontWeight: "600", color: "var(--color-slate-900)" }}>{item.itemName}</span>
                  <span className={styles.lowStockBadge}>{item.quantity} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};