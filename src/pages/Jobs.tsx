import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  User, 
  Car, 
  Receipt, 
  History, 
  Search, 
  ArrowRight
} from "lucide-react";
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

const COLUMNS: { id: JobStatus; label: string; accentColor: string; description: string }[] = [
  { id: "todo", label: "To Do", accentColor: "#64748b", description: "Checked-in vehicles awaiting triage" },
  { id: "in-progress", label: "In Progress", accentColor: "#2563eb", description: "Under active repair or diagnostic" },
  { id: "waiting-parts", label: "Waiting on Parts", accentColor: "#f97316", description: "On hold for supplier shipments" },
  { id: "done", label: "Done", accentColor: "#10b981", description: "Work complete • Ready for pickup & billing" },
];

// Reusable Droppable Column
const KanbanColumn = ({ 
  id, 
  label, 
  count, 
  accentColor,
  onQuickAdd,
  children 
}: { 
  id: JobStatus; 
  label: string; 
  count: number; 
  accentColor: string;
  onQuickAdd: (status: JobStatus) => void;
  children: React.ReactNode 
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div 
      ref={setNodeRef} 
      className={`${styles.column} ${isOver ? styles.columnOver : ""}`}
    >
      <div className={styles.columnHeader}>
        <div className={styles.columnTitleGroup}>
          <span className={styles.columnAccentDot} style={{ backgroundColor: accentColor }} />
          <h3 className={styles.columnTitle}>{label}</h3>
          <span className={styles.columnCount}>{count}</span>
        </div>
        <button 
          onClick={() => onQuickAdd(id)} 
          className={styles.columnQuickAddBtn}
          title={`Create new job in ${label}`}
          aria-label={`Add job to ${label}`}
        >
          <Plus size={16} />
        </button>
      </div>
      <div className={styles.columnContent}>
        {children}
      </div>
    </div>
  );
};

// Reusable Draggable Card
type KanbanCardProps = {
  job: Job;
  clientName: string;
  vehicleName: string;
  plateNumber: string;
  onEdit?: (job: Job) => void;
  onDelete?: (id: string) => void;
  onHandover?: (id: string) => void;
  onMoveStatus?: (id: string, status: JobStatus) => void;
  isOverlay?: boolean;
};

const KanbanCard = ({ 
  job, 
  clientName, 
  vehicleName, 
  plateNumber,
  onEdit, 
  onDelete, 
  onHandover, 
  onMoveStatus,
  isOverlay 
}: KanbanCardProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ 
    id: isOverlay ? `overlay-${job.id}` : job.id 
  });

  const style = {
    opacity: isDragging && !isOverlay ? 0.35 : 1,
    cursor: isOverlay ? 'grabbing' : 'grab',
  };

  const nextStatusMap: Record<JobStatus, JobStatus | null> = {
    "todo": "in-progress",
    "in-progress": "done",
    "waiting-parts": "in-progress",
    "done": null,
    "archived": null
  };

  const nextStatus = nextStatusMap[job.status];

  return (
    <div 
      ref={isOverlay ? undefined : setNodeRef} 
      style={style} 
      {...(isOverlay ? {} : listeners)} 
      {...(isOverlay ? {} : attributes)} 
      className={styles.card}
    >
      <div className={styles.cardHeader}>
        <h4 className={styles.cardTitle}>{job.title}</h4>
      </div>
      
      <div className={styles.cardTags}>
        <div className={styles.tag}>
          <User size={13} className={styles.tagIcon} /> 
          <span className={styles.tagText}>{clientName}</span>
        </div>
        <div className={styles.tag}>
          <Car size={13} className={styles.tagIcon} /> 
          <span className={styles.tagText}>{vehicleName}</span>
          {plateNumber && (
            <span className={styles.plateBadge}>{plateNumber}</span>
          )}
        </div>
      </div>

      <div className={styles.cardFooter}>
        {job.estimatedCost ? (
          <span className={styles.costBadge}>${job.estimatedCost.toFixed(2)}</span>
        ) : (
          <span className={styles.noEstimate}>No estimate</span>
        )}
        
        <div className={styles.cardActions} onPointerDown={(e) => e.stopPropagation()}>
          {/* Accessible Step Forward Button */}
          {nextStatus && onMoveStatus && (
            <button 
              onClick={() => onMoveStatus(job.id, nextStatus)} 
              title={`Move to ${nextStatus.replace("-", " ")}`}
              className={styles.advanceBtn}
              aria-label={`Advance status to ${nextStatus.replace("-", " ")}`}
            >
              <ArrowRight size={14} />
            </button>
          )}
          <button onClick={() => onEdit?.(job)} title="Edit Job" aria-label="Edit job">
            <Edit2 size={14} />
          </button>
          <button onClick={() => onDelete?.(job.id)} className={styles.deleteBtn} title="Delete Job" aria-label="Delete job">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {job.status === "done" && !isOverlay && (
        <button 
          className={styles.handoverBtn} 
          onPointerDown={(e) => e.stopPropagation()} 
          onClick={() => onHandover?.(job.id)}
          aria-label="Generate invoice and handover vehicle"
        >
          <Receipt size={15} /> 
          <span>Handover & Invoice</span>
        </button>
      )}
    </div>
  );
};

export const Jobs = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [defaultColumnStatus, setDefaultColumnStatus] = useState<JobStatus>("todo");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: jobs, isLoading: loadingJobs } = useJobs();
  const { data: clients } = useClients();
  const { data: vehicles } = useVehicles();
  const { mutate: updateStatus } = useUpdateJobStatus();
  const { mutate: deleteJob } = useDeleteJob();

  // W3C ARIA compliant keyboard & pointer drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const handleOpenModal = (job?: Job, initialStatus: JobStatus = "todo") => {
    setDefaultColumnStatus(initialStatus);
    setEditingJob(job || null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this job?")) deleteJob(id);
  };

  const handleHandover = (id: string) => {
    navigate(`/invoice/${id}`);
  };

  const handleMoveStatus = (id: string, newStatus: JobStatus) => {
    updateStatus({ id, status: newStatus });
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

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    if (!searchQuery.trim()) return jobs;

    const q = searchQuery.toLowerCase();
    return jobs.filter(job => {
      const client = clients?.find(c => c.id === job.clientId);
      const vehicle = vehicles?.find(v => v.id === job.vehicleId);
      const clientName = client?.fullName.toLowerCase() || "";
      const vehicleDesc = vehicle ? `${vehicle.make} ${vehicle.model} ${vehicle.plateNumber}`.toLowerCase() : "";
      const title = job.title.toLowerCase();

      return title.includes(q) || clientName.includes(q) || vehicleDesc.includes(q);
    });
  }, [jobs, clients, vehicles, searchQuery]);

  if (loadingJobs) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 size={36} className="animate-spin" color="var(--color-primary-600)" />
      </div>
    );
  }

  const activeJob = activeId ? jobs?.find(j => j.id === activeId) : null;
  const activeJobClient = activeJob ? clients?.find(c => c.id === activeJob.clientId)?.fullName || "Unknown" : "";
  const activeJobVehicle = activeJob ? vehicles?.find(v => v.id === activeJob.vehicleId) : null;

  return (
    <div className={styles.container}>
      {/* Header with Search and Actions */}
      <div className={styles.header}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search repairs, clients, or license plates..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            aria-label="Filter repair jobs"
          />
        </div>

        <div className={styles.headerActions}>
          <button onClick={() => setIsHistoryOpen(true)} className={styles.secondaryBtn}>
            <History size={17} />
            <span>Archive History</span>
          </button>
          <button onClick={() => handleOpenModal(undefined, "todo")} className={styles.addButton}>
            <Plus size={18} strokeWidth={2.5} />
            <span>New Repair Job</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext 
        sensors={sensors} 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
      >
        <div className={styles.board}>
          {COLUMNS.map(column => {
            const columnJobs = filteredJobs.filter(job => job.status === column.id && job.status !== "archived");
            return (
              <KanbanColumn 
                key={column.id} 
                id={column.id} 
                label={column.label} 
                count={columnJobs.length}
                accentColor={column.accentColor}
                onQuickAdd={(status) => handleOpenModal(undefined, status)}
              >
                {columnJobs.length === 0 ? (
                  <div className={styles.emptyColumn}>
                    <p>No jobs in {column.label.toLowerCase()}</p>
                  </div>
                ) : (
                  columnJobs.map(job => {
                    const client = clients?.find(c => c.id === job.clientId);
                    const vehicle = vehicles?.find(v => v.id === job.vehicleId);
                    return (
                      <KanbanCard 
                        key={job.id} 
                        job={job} 
                        clientName={client?.fullName || "Walk-in Client"}
                        vehicleName={vehicle ? `${vehicle.make} ${vehicle.model}` : "Vehicle Unspecified"}
                        plateNumber={vehicle?.plateNumber || ""}
                        onEdit={handleOpenModal}
                        onDelete={handleDelete}
                        onHandover={handleHandover}
                        onMoveStatus={handleMoveStatus}
                      />
                    );
                  })
                )}
              </KanbanColumn>
            );
          })}
        </div>

        <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeJob ? (
            <KanbanCard 
              job={activeJob} 
              clientName={activeJobClient}
              vehicleName={activeJobVehicle ? `${activeJobVehicle.make} ${activeJobVehicle.model}` : "Vehicle"}
              plateNumber={activeJobVehicle?.plateNumber || ""}
              isOverlay 
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <JobModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingJob(null); }} 
        job={editingJob} 
        initialStatus={defaultColumnStatus}
      />
      <JobHistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />  
    </div>
  );
};