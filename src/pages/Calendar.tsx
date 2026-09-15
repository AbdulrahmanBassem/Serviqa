import { useState, useMemo } from "react";
import { Plus, Calendar as  ArrowRight, Loader2 } from "lucide-react";
import { useAppointments, useConvertAppointmentToJob } from "../features/appointments/api/appointmentHooks";
import { useClients } from "../features/clients/api/clientHooks";
import { AppointmentModal } from "../features/appointments/components/AppointmentModal";
import type { Appointment } from "../features/appointments/types";
import styles from "./Calendar.module.css";

// Helper to get YYYY-MM-DD
const getLocalDateString = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const Calendar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: appointments, isLoading } = useAppointments();
  const { data: clients } = useClients();
  const { mutate: convertToJob, isPending: converting } = useConvertAppointmentToJob();

  const todayString = getLocalDateString(new Date());

  // Group appointments by date, and ensure the next 7 days always render empty columns if needed
  const timelineDays = useMemo(() => {
    const daysMap = new Map<string, Appointment[]>();
    const activeAppointments = appointments?.filter(a => a.status === "scheduled") || [];
    
    // Seed the next 7 days so the UI always has a weekly structure
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      daysMap.set(getLocalDateString(d), []);
    }

    // Populate with actual appointments
    activeAppointments.forEach(apt => {
      if (!daysMap.has(apt.date)) {
        daysMap.set(apt.date, []);
      }
      daysMap.get(apt.date)!.push(apt);
    });

    // Convert map to sorted array
    return Array.from(daysMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, apts]) => ({ date, apts }));
  }, [appointments]);

  if (isLoading) return <div style={{ padding: "3rem", textAlign: "center" }}><Loader2 className="animate-spin" /></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {/* <h1 className={styles.title}>Schedule & Appointments</h1> */}
        <button onClick={() => setIsModalOpen(true)} className={styles.addBtn}>
          <Plus size={18} /> New Appointment
        </button>
      </div>

      <div className={styles.timeline}>
        {timelineDays.map(({ date, apts }) => {
          const isToday = date === todayString;
          const displayDate = new Date(date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });

          return (
            <div key={date} className={styles.dayColumn}>
              <div className={styles.dayHeader}>
                {displayDate}
                {isToday && <span className={styles.isToday}>Today</span>}
              </div>

              {apts.length === 0 ? (
                <div style={{ color: "var(--color-slate-400)", fontSize: "0.85rem", textAlign: "center", marginTop: "1rem" }}>
                  No appointments
                </div>
              ) : (
                apts.map(apt => {
                  const client = clients?.find(c => c.id === apt.clientId);
                  const isReadyForKanban = apt.date <= todayString;

                  return (
                    <div key={apt.id} className={styles.card}>
                      <div className={styles.timeLabel}>{apt.time}</div>
                      <div className={styles.clientName}>{client?.fullName || "Unknown Client"}</div>
                      <div className={styles.serviceTitle}>{apt.title}</div>
                      
                      {isReadyForKanban && (
                        <button 
                          onClick={() => convertToJob(apt)} 
                          disabled={converting}
                          className={styles.convertBtn}
                        >
                          <ArrowRight size={16} /> Send to Kanban
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>

      <AppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};