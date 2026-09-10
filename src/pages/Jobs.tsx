import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, Loader2, User, Car, Receipt, History } from "lucide-react";
import { 
  DndContext, 
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor, 
  KeyboardSensor, 
  useSensor, 
  useSensors,
  useDroppable,
  useDraggable,
  DragOverlay
} from "@dnd-kit/core";
import { useJobs, useUpdateJobStatus, useDeleteJob } from "../features/jobs/api/jobHooks";
import { useClients } from "../features/clients/api/clientHooks";
import { useVehicles } from "../features/vehicles/api/vehicleHooks";
import { JobModal } from "../features/jobs/components/JobModal";
import { JobHistoryModal } from "../features/jobs/components/JobHistoryModal";
import type { Job, JobStatus } from "../features/jobs/types";
import styles from "../features/jobs/components/Jobs.module.css";

const COLUMNS: { id: JobStatus; label: string }[] = [
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "waiting-parts", label: "Waiting on Parts" },
  { id: "done", label: "Done" },
];

// Reusable Droppable Column
const KanbanColumn = ({ id, label, count, children }: { id: string, label: string, count: number, children: React.ReactNode }) => {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={styles.column}>
      <div className={styles.columnHeader}>
        {label} <span className={styles.columnCount}>{count}</span>
      </div>
      {children}
    </div>
  );
};

// Reusable Draggable Card
type KanbanCardProps = {
  job: Job;
  clientName: string;
  vehicleName: string;
  onEdit?: (job: Job) => void;
  onDelete?: (id: string) => void;
  onHandover?: (id: string) => void;
  isOverlay?: boolean;
};

const KanbanCard = ({ job, clientName, vehicleName, onEdit, onDelete, onHandover, isOverlay }: KanbanCardProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ 
    id: isOverlay ? `overlay-${job.id}` : job.id 
  });

  const style = {
    opacity: isDragging && !isOverlay ? 0.3 : 1,
    cursor: isOverlay ? 'grabbing' : 'pointer',
  };

  return (
    <div 
      ref={isOverlay ? undefined : setNodeRef} 
      style={style} 
      {...(isOverlay ? {} : listeners)} 
      {...(isOverlay ? {} : attributes)} 
      className={styles.card}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>{job.title}</div>
      </div>
      
      <div className={styles.cardTags}>
        <div className={styles.tag}><User size={14} /> {clientName}</div>
        <div className={styles.tag}><Car size={14} /> {vehicleName}</div>
      </div>

      <div className={styles.cardFooter}>
        {job.estimatedCost ? (
          <span className={styles.costBadge}>${job.estimatedCost.toFixed(2)}</span>
        ) : <span />}
        
        <div className={styles.cardActions} onPointerDown={(e) => e.stopPropagation()}>
          <button onClick={() => onEdit?.(job)} title="Edit Job"><Edit2 size={16} /></button>
          <button onClick={() => onDelete?.(job.id)} className={styles.deleteBtn} title="Delete Job"><Trash2 size={16} /></button>
        </div>
      </div>

      {job.status === "done" && !isOverlay && (
        <button 
          className={styles.handoverBtn} 
          onPointerDown={(e) => e.stopPropagation()} 
          onClick={() => onHandover?.(job.id)}
        >
          <Receipt size={16} /> Handover & Invoice
        </button>
      )}
    </div>
  );
};

export const Jobs = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const { data: jobs, isLoading: loadingJobs } = useJobs();
  const { data: clients } = useClients();
  const { data: vehicles } = useVehicles();
  const { mutate: updateStatus } = useUpdateJobStatus();
  const { mutate: deleteJob } = useDeleteJob();

  // W3C ARIA compliant keyboard & pointer drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleOpenModal = (job?: Job) => {
    setEditingJob(job || null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this job?")) deleteJob(id);
  };

  const handleHandover = (id: string) => {
    navigate(`/invoice/${id}`);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const jobId = active.id as string;
    const newStatus = over.id as JobStatus;
    const job = jobs?.find(j => j.id === jobId);

    if (job && job.status !== newStatus) {
      updateStatus({ id: jobId, status: newStatus });
    }
  };

  if (loadingJobs) return <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}><Loader2 size={32} className="animate-spin" color="var(--color-primary-600)" /></div>;

  const activeJob = activeId ? jobs?.find(j => j.id === activeId) : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {/* <h1 className={styles.title}>Active Jobs</h1> */}
        <div className={styles.headerActions}>
          <button onClick={() => setIsHistoryOpen(true)} className={styles.secondaryBtn}>
            <History size={18} /> History
          </button>
          <button onClick={() => handleOpenModal()} className={styles.addButton}>
            <Plus size={20} /> New Job
          </button>
        </div>
      </div>

      <DndContext 
        sensors={sensors} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.board}>
          {COLUMNS.map(column => {
            const columnJobs = jobs?.filter(job => job.status === column.id && job.status !== "archived") || [];
            return (
              <KanbanColumn key={column.id} id={column.id} label={column.label} count={columnJobs.length}>
                {columnJobs.map(job => (
                  <KanbanCard 
                    key={job.id} 
                    job={job} 
                    clientName={clients?.find(c => c.id === job.clientId)?.fullName || "Unknown"}
                    vehicleName={(() => {
                      const v = vehicles?.find(v => v.id === job.vehicleId);
                      return v ? `${v.make} ${v.model}` : "Unknown";
                    })()}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                    onHandover={handleHandover}
                  />
                ))}
              </KanbanColumn>
            );
          })}
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeJob ? (
            <KanbanCard 
              job={activeJob} 
              clientName={clients?.find(c => c.id === activeJob.clientId)?.fullName || "Unknown"}
              vehicleName={(() => {
                const v = vehicles?.find(v => v.id === activeJob.vehicleId);
                return v ? `${v.make} ${v.model}` : "Unknown";
              })()}
              isOverlay 
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <JobModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingJob(null); }} job={editingJob} />
      <JobHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />  
    </div>
  );
};