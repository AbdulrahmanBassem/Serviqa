import { useState, useMemo } from "react";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  ArrowRight, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Car, 
  Phone, 
  CheckCircle2, 
  Wrench,
  CalendarCheck
} from "lucide-react";
import { useAppointments, useConvertAppointmentToJob } from "../features/appointments/api/appointmentHooks";
import { useClients } from "../features/clients/api/clientHooks";
import { useVehicles } from "../features/vehicles/api/vehicleHooks";
import { AppointmentModal } from "../features/appointments/components/AppointmentModal";
import styles from "./Calendar.module.css";

// Helper to get YYYY-MM-DD
const getLocalDateString = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Start of current week (Monday or current day offset)
const getStartOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const Calendar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState<string | undefined>(undefined);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = this week, -1 = last week, 1 = next week
  
  const { data: appointments, isLoading } = useAppointments();
  const { data: clients } = useClients();
  const { data: vehicles } = useVehicles();
  const { mutate: convertToJob, isPending: converting } = useConvertAppointmentToJob();

  const todayString = useMemo(() => getLocalDateString(new Date()), []);

  // Compute the 7 dates for the selected week
  const weekDates = useMemo(() => {
    const baseMonday = getStartOfWeek(new Date());
    baseMonday.setDate(baseMonday.getDate() + (weekOffset * 7));

    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseMonday);
      d.setDate(baseMonday.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [weekOffset]);

  const weekRangeLabel = useMemo(() => {
    if (weekDates.length < 7) return "";
    const start = weekDates[0];
    const end = weekDates[6];
    const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endStr = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${startStr} – ${endStr}`;
  }, [weekDates]);

  // Appointments grouped by date
  const timelineDays = useMemo(() => {
    const activeAppointments = appointments || [];

    return weekDates.map(dateObj => {
      const dateStr = getLocalDateString(dateObj);
      const dayApts = activeAppointments
        .filter(a => a.date === dateStr)
        .sort((a, b) => a.time.localeCompare(b.time));

      return {
        dateStr,
        dateObj,
        apts: dayApts,
      };
    });
  }, [appointments, weekDates]);

  // Summary Metrics
  const totalScheduled = useMemo(() => {
    return appointments?.filter(a => a.status === "scheduled").length || 0;
  }, [appointments]);

  const todayCount = useMemo(() => {
    return appointments?.filter(a => a.date === todayString && a.status === "scheduled").length || 0;
  }, [appointments, todayString]);

  const convertedCount = useMemo(() => {
    return appointments?.filter(a => a.status === "converted").length || 0;
  }, [appointments]);

  const handleOpenNewModal = (dateStr?: string) => {
    setModalInitialDate(dateStr);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalInitialDate(undefined);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <Loader2 size={36} className="animate-spin" color="var(--color-primary-600)" />
        <p style={{ color: "var(--color-slate-500)", fontWeight: 500 }}>Loading appointment calendar...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Metrics Summary Strip */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={`${styles.metricIconBadge} ${styles.metricBadgeBlue}`}>
            <CalendarIcon size={22} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>Active Bookings</span>
            <span className={styles.metricValue}>{totalScheduled}</span>
            <span className={styles.metricSubtext}>Pending client drop-offs</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconBadge} ${styles.metricBadgeEmerald}`}>
            <CalendarCheck size={22} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>Today's Schedule</span>
            <span className={styles.metricValue}>{todayCount}</span>
            <span className={styles.metricSubtext}>Arrivals expected today</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconBadge} ${styles.metricBadgePurple}`}>
            <Wrench size={22} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>Dispatched to Kanban</span>
            <span className={styles.metricValue}>{convertedCount}</span>
            <span className={styles.metricSubtext}>Converted to repair orders</span>
          </div>
        </div>
      </div>

      {/* Header with Week Navigation and Add Button */}
      <div className={styles.header}>
        <div className={styles.navControls}>
          <button 
            onClick={() => setWeekOffset(prev => prev - 1)} 
            className={styles.navBtn}
            title="Previous Week"
            aria-label="Previous Week"
          >
            <ChevronLeft size={16} />
          </button>
          
          <button 
            onClick={() => setWeekOffset(0)} 
            className={styles.todayBtn}
          >
            Current Week
          </button>
          
          <button 
            onClick={() => setWeekOffset(prev => prev + 1)} 
            className={styles.navBtn}
            title="Next Week"
            aria-label="Next Week"
          >
            <ChevronRight size={16} />
          </button>

          <span className={styles.weekRangeLabel}>{weekRangeLabel}</span>
        </div>

        <div className={styles.headerActions}>
          <button onClick={() => handleOpenNewModal()} className={styles.addBtn}>
            <Plus size={18} strokeWidth={2.5} /> Schedule Appointment
          </button>
        </div>
      </div>

      {/* 7-Day Timeline Grid */}
      <div className={styles.timeline}>
        {timelineDays.map(({ dateStr, dateObj, apts }) => {
          const isToday = dateStr === todayString;
          const weekdayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
          const monthDay = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

          return (
            <div 
              key={dateStr} 
              className={`${styles.dayColumn} ${isToday ? styles.dayColumnToday : ""}`}
            >
              <div className={styles.dayHeader}>
                <div className={styles.dayTitleGroup}>
                  <span className={styles.dayWeekday}>{weekdayName}</span>
                  <span className={styles.dayDate}>{monthDay}</span>
                </div>

                <div className={styles.dayActions}>
                  {isToday && <span className={styles.isTodayBadge}>Today</span>}
                  <button 
                    onClick={() => handleOpenNewModal(dateStr)} 
                    className={styles.quickAddDayBtn}
                    title={`Schedule for ${monthDay}`}
                    aria-label={`Schedule for ${monthDay}`}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className={styles.cardList}>
                {apts.length === 0 ? (
                  <div className={styles.emptyDay}>
                    <CalendarIcon size={24} style={{ opacity: 0.4 }} />
                    <span>No bookings</span>
                  </div>
                ) : (
                  apts.map(apt => {
                    const client = clients?.find(c => c.id === apt.clientId);
                    const vehicle = vehicles?.find(v => v.id === apt.vehicleId);
                    const isConverted = apt.status === "converted";
                    const isReadyForKanban = !isConverted && apt.date <= todayString;

                    return (
                      <div 
                        key={apt.id} 
                        className={`${styles.card} ${isConverted ? styles.cardConverted : ""}`}
                      >
                        <div className={styles.cardTopRow}>
                          <span className={styles.timePill}>
                            <Clock size={11} />
                            <span>{apt.time}</span>
                          </span>

                          {vehicle && (
                            <span className={styles.vehiclePill}>
                              <Car size={11} />
                              <span>{vehicle.plateNumber}</span>
                            </span>
                          )}
                        </div>

                        <div className={styles.serviceTitle}>{apt.title}</div>

                        <div className={styles.clientInfo}>
                          <span className={styles.clientName}>{client?.fullName || "Unknown Client"}</span>
                          {client?.phoneNumber && (
                            <a href={`tel:${client.phoneNumber}`} className={styles.phoneLink}>
                              <Phone size={10} />
                              <span>{client.phoneNumber}</span>
                            </a>
                          )}
                        </div>

                        {vehicle && (
                          <div style={{ fontSize: "0.75rem", color: "var(--color-slate-500)" }}>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </div>
                        )}

                        {isConverted ? (
                          <span className={styles.convertedBadge}>
                            <CheckCircle2 size={12} />
                            <span>Dispatched to Kanban</span>
                          </span>
                        ) : isReadyForKanban ? (
                          <button 
                            onClick={() => convertToJob(apt)} 
                            disabled={converting}
                            className={styles.convertBtn}
                            title="Convert appointment into active repair job on Kanban"
                          >
                            <ArrowRight size={14} /> Send to Kanban
                          </button>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        initialDate={modalInitialDate}
      />
    </div>
  );
};