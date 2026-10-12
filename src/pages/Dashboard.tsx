import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Kanban, 
  DollarSign, 
  AlertTriangle, 
  Loader2, 
  PackageOpen, 
  PlusCircle, 
  UserPlus, 
  Search, 
  Calendar, 
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Clock
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useClients } from "../features/clients/api/clientHooks";
import { useJobs } from "../features/jobs/api/jobHooks";
import { useDailyMetrics } from "../features/jobs/api/jobHooks";
import { useInventory } from "../features/inventory/api/inventoryHooks";
import { useShopProfile } from "../features/auth/api/shopHooks";
import styles from "./Dashboard.module.css";
import { useMemo, useState } from "react";

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'done': return { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' };
    case 'in-progress': return { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' };
    case 'waiting-parts': return { bg: '#fff7ed', color: '#9a3412', border: '#fed7aa' };
    default: return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
  }
};

const PIE_COLORS: Record<string, string> = {
  'todo': '#94a3b8',
  'in-progress': '#2563eb',
  'waiting-parts': '#f97316',
  'done': '#10b981'
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
  const { data: shopProfile } = useShopProfile();
  const { data: clients, isLoading: loadingClients } = useClients();
  const { data: jobs, isLoading: loadingJobs } = useJobs();
  const { data: inventory, isLoading: loadingInventory } = useInventory();
  
  const [timeRange, setTimeRange] = useState<number>(7);
  // Safe destructuring with fallback in case testing mocks omit useDailyMetrics
  const dailyMetricsResult = useDailyMetrics?.(timeRange) || { data: [], isLoading: false };
  const { data: metrics = [], isLoading: loadingMetrics = false } = dailyMetricsResult;

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
      
      const dayData = metrics?.find((m: { date: string }) => m.date === dateString);
      days.push({ name: label, total: dayData ? dayData.revenue : 0 });
    }
    return days;
  }, [metrics, timeRange]);

  const totalPeriodRevenue = useMemo(() => {
    return revenueData.reduce((acc, curr) => acc + curr.total, 0);
  }, [revenueData]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 size={40} className="animate-spin" color="var(--color-primary-600)" />
      </div>
    );
  }

  const totalClients = clients?.length || 0;
  const activeJobs = jobs?.filter(job => (job.status !== "done" && job.status !== "archived")) || [];
  const inProgressCount = activeJobs.filter(j => j.status === "in-progress").length;
  const waitingPartsCount = activeJobs.filter(j => j.status === "waiting-parts").length;
  const pendingRevenue = activeJobs.reduce((sum, job) => sum + (job.estimatedCost || 0), 0);
  const avgJobTicket = activeJobs.length > 0 ? (pendingRevenue / activeJobs.length) : 0;
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
    color: PIE_COLORS[key] || '#94a3b8'
  }));

  const totalPipelineJobs = Object.values(jobStatusCounts).reduce((a, b) => a + b, 0);
  const todayDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  const shopName = shopProfile?.shopName || "Serviqa Auto Care";

  return (
    <div className={styles.container}>
      {/* Hero Welcome & Quick Launch Bar */}
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.pulseDot} />
            <span>Active Workshop Bays Online</span>
          </div>
          <h1 className={styles.title}>{getGreeting()}, {shopProfile?.ownerName || "Master Mechanic"}!</h1>
          <p className={styles.subtitle}>
            {todayDate} — Welcome back to <strong>{shopName}</strong>. You have <strong>{activeJobs.length} active jobs</strong> currently on the workshop floor.
          </p>
        </div>
        
        <div className={styles.quickActions}>
          <button onClick={() => navigate('/jobs')} className={styles.actionBtnPrimary}>
            <PlusCircle size={16} />
            <span>New Repair Job</span>
          </button>
          <button onClick={() => navigate('/clients')} className={styles.actionBtn}>
            <UserPlus size={16} />
            <span>Add Client</span>
          </button>
          <button onClick={() => navigate('/calendar')} className={styles.actionBtn}>
            <Calendar size={16} />
            <span>Appointments</span>
          </button>
          <button onClick={() => navigate('/inventory')} className={styles.actionBtn}>
            <Search size={16} />
            <span>Search Parts</span>
          </button>
        </div>
      </div>

      {/* 4 Elevated Stat Metric Cards */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statCardPrimary}`} onClick={() => navigate('/jobs')}>
          <div className={styles.statTop}>
            {/* <div className={styles.statIconBadge}>
              <Kanban size={20} />
            </div> */}
            <div className={styles.statTrendPill}>
              <span>{inProgressCount} in progress</span>
            </div>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Active Jobs</span>
            <div className={styles.statValueRow}>
              <span className={styles.statValue}>{activeJobs.length}</span>
              {waitingPartsCount > 0 && (
                <span className={styles.statSubHighlight}>({waitingPartsCount} waiting parts)</span>
              )}
            </div>
          </div>
          <Kanban size={110} strokeWidth={1} className={styles.watermarkIcon} />
        </div>

        <div className={styles.statCard} onClick={() => navigate('/clients')}>
          <div className={styles.statTop}>
            {/* <div className={`${styles.statIconBadge} ${styles.badgeSlate}`}>
              <Users size={20} />
            </div> */}
            <div className={styles.statTrendPill}>
              <span>Client Fleet</span>
            </div>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Total Clients</span>
            <div className={styles.statValueRow}>
              <span className={styles.statValue}>{totalClients}</span>
            </div>
          </div>
          <Users size={110} strokeWidth={1} className={styles.watermarkIcon} />
        </div>

        <div className={styles.statCard} onClick={() => navigate('/jobs')}>
          <div className={styles.statTop}>
            {/* <div className={`${styles.statIconBadge} ${styles.badgeGreen}`}>
              <DollarSign size={20} />
            </div> */}
            <div className={`${styles.statTrendPill} ${styles.pillGreen}`}>
              <TrendingUp size={12} />
              <span>Est. Avg ${avgJobTicket.toFixed(0)}/job</span>
            </div>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Pending Revenue</span>
            <div className={styles.statValueRow}>
              <span className={styles.statValue}>${pendingRevenue.toFixed(2)}</span>
            </div>
          </div>
          <DollarSign size={110} strokeWidth={1} className={styles.watermarkIcon} />
        </div>

        <div className={`${styles.statCard} ${lowStockItems.length > 0 ? styles.statCardWarning : ""}`} onClick={() => navigate('/inventory')}>
          <div className={styles.statTop}>
            {/* <div className={`${styles.statIconBadge} ${styles.badgeAmber}`}>
              <AlertTriangle size={20} />
            </div> */}
            <div className={`${styles.statTrendPill} ${lowStockItems.length > 0 ? styles.pillAmber : ""}`}>
              <span>{lowStockItems.length > 0 ? "Requires restock" : "Stock optimal"}</span>
            </div>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Low Stock Alerts</span>
            <div className={styles.statValueRow}>
              <span className={styles.statValue}>{lowStockItems.length}</span>
              <span className={styles.statSubHighlight}>items below threshold</span>
            </div>
          </div>
          <AlertTriangle size={110} strokeWidth={1} className={styles.watermarkIcon} />
        </div>
      </div>

      {/* Full-Width Revenue Trend Chart with Segmented Controls */}
      <div className={styles.fullWidthChart}>
        <div className={styles.sectionHeader}>
          <div className={styles.chartTitleGroup}>
            <h2 className={styles.sectionTitle}>Shop Revenue Trend</h2>
            <div className={styles.periodTotalPill}>
              <span>Period Total:</span>
              <strong>${totalPeriodRevenue.toFixed(2)}</strong>
            </div>
          </div>
          
          {/* Segmented Control */}
          <div className={styles.segmentedControl}>
            <button 
              className={`${styles.segmentBtn} ${timeRange === 7 ? styles.segmentActive : ""}`}
              onClick={() => setTimeRange(7)}
            >
              7 Days
            </button>
            <button 
              className={`${styles.segmentBtn} ${timeRange === 14 ? styles.segmentActive : ""}`}
              onClick={() => setTimeRange(14)}
            >
              14 Days
            </button>
            <button 
              className={`${styles.segmentBtn} ${timeRange === 30 ? styles.segmentActive : ""}`}
              onClick={() => setTimeRange(30)}
            >
              30 Days
            </button>
          </div>
        </div>

        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.45}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.7)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                dy={8} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(37, 99, 235, 0.25)', strokeWidth: 2 }} />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#2563eb" 
                strokeWidth={3.5} 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                activeDot={{ r: 6, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3-Column Bottom Strategic Workspace Grid */}
      <div className={styles.sectionsGrid}>
        {/* 1. Pipeline Breakdown */}
        <div className={styles.section}>
          <div className={styles.sectionHeaderRow}>
            <h2 className={styles.sectionTitle}>Pipeline Distribution</h2>
            <span className={styles.headerCountBadge}>{totalPipelineJobs} Jobs</span>
          </div>

          <div className={styles.donutWrapper}>
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '10px', 
                    border: '1px solid var(--color-slate-200)', 
                    boxShadow: 'var(--shadow-md)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)'
                  }}
                  itemStyle={{ color: '#0f172a', fontWeight: 600, textTransform: 'capitalize' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Central Donut Counter */}
            <div className={styles.donutCenter}>
              <span className={styles.donutCenterValue}>{totalPipelineJobs}</span>
              <span className={styles.donutCenterLabel}>Total</span>
            </div>
          </div>

          <div className={styles.donutLegend}>
            {pieData.map(item => (
              <div key={item.name} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: item.color }} />
                <span className={styles.legendLabel}>{item.name}</span>
                <span className={styles.legendCount}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Recent Active Jobs */}
        <div className={styles.section}>
          <div className={styles.sectionHeaderRow}>
            <h2 className={styles.sectionTitle}>Active Repair Floor</h2>
            <button onClick={() => navigate('/jobs')} className={styles.viewAllLink}>
              <span>View All</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          {recentJobs.length === 0 ? (
            <div className={styles.emptyState}>
              <CheckCircle2 size={36} color="var(--color-success)" />
              <p>All vehicles serviced! Workshop floor is clear.</p>
            </div>
          ) : (
            <div className={styles.list}>
              {recentJobs.map(job => {
                const statusStyle = getStatusStyle(job.status);
                return (
                  <div 
                    key={job.id} 
                    className={styles.jobListItem}
                    onClick={() => navigate('/jobs')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.jobItemInfo}>
                      <span className={styles.jobTitle}>{job.title}</span>
                      <div className={styles.jobItemMeta}>
                        {job.estimatedCost ? (
                          <span className={styles.jobCostBadge}>${job.estimatedCost.toFixed(2)}</span>
                        ) : null}
                        <span className={styles.jobTimeAgo}>
                          <Clock size={12} />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <span 
                      className={styles.statusPill}
                      style={{ 
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        border: `1px solid ${statusStyle.border}`
                      }}
                    >
                      {job.status.replace("-", " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Low Stock Items */}
        <div className={styles.section}>
          <div className={styles.sectionHeaderRow}>
            <h2 className={styles.sectionTitle}>Low Stock Inventory</h2>
            <button onClick={() => navigate('/inventory')} className={styles.viewAllLink}>
              <span>Manage</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          {lowStockItems.length === 0 ? (
            <div className={styles.emptyState}>
              <PackageOpen size={36} color="var(--color-primary-500)" />
              <p>Parts inventory is fully stocked.</p>
            </div>
          ) : (
            <div className={styles.list}>
              {lowStockItems.slice(0, 5).map(item => (
                <div 
                  key={item.id} 
                  className={styles.inventoryListItem}
                  onClick={() => navigate('/inventory')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.inventoryItemInfo}>
                    <span className={styles.inventoryItemName}>{item.itemName}</span>
                    <span className={styles.inventoryItemPrice}>${(item.unitPrice ?? 0).toFixed(2)} ea</span>
                  </div>
                  
                  <span className={styles.stockAlertPill}>
                    {item.quantity === 0 ? "Out of Stock" : `${item.quantity} left`}
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