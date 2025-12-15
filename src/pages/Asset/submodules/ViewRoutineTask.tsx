import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, AlertTriangle, ClipboardCheck, Clock, User } from 'lucide-react';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import StatusBadge, { StatusType } from '../../../components/ui/StatusBadge';
import { routineTaskService, RoutineTask } from '../../../services/assetSubModules.service';

interface TaskDetail extends RoutineTask {
  submissions?: { id: number; question?: string; answer?: string }[];
}

const ViewRoutineTask: React.FC = () => {
  const { id, assetId } = useParams<{ id: string; assetId?: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTaskDetails();
  }, [id, assetId]);

  const fetchTaskDetails = async () => {
    if (!id || !assetId) return;
    setLoading(true);
    try {
      const res = await routineTaskService.getRoutineTaskById(assetId, id);
      const data = Array.isArray(res.data) ? res.data : [res.data];
      if (data.length > 0) {
        setTask({ ...data[0], submissions: data });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch task details');
    } finally {
      setLoading(false);
    }
  };

  const getTaskStatus = (): StatusType => {
    if (!task) return 'available';
    const status = task.status?.toLowerCase();
    if (status === 'completed' || status === 'done') return 'checked-out';
    if (status === 'in_progress' || status === 'pending') return 'pending';
    if (status === 'overdue') return 'breakdown';
    return 'available';
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading task details...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Task</h3>
        <p className="text-muted-foreground mb-4">{error || 'Task not found'}</p>
        <button onClick={() => navigate('/asset/routine-task')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Breadcrumb items={[
        { label: 'FM Module', path: '/asset' },
        { label: 'Asset', path: '/asset' },
        { label: 'Routine Task', path: '/asset/routine-task' },
        { label: task.checklist_name || `Task #${task.id}` }
      ]} />

      <div className="flex items-center gap-4 mt-4 mb-6">
        <button onClick={() => navigate('/asset/routine-task')} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{task.checklist_name || `Task #${task.id}`}</h1>
          <div className="flex items-center gap-3 mt-1">
            <StatusBadge status={getTaskStatus()} />
            {task.asset_name && <span className="text-sm text-muted-foreground">Asset: {task.asset_name}</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="bg-primary/5 px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary" /> Task Details
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <InfoItem label="Checklist" value={task.checklist_name || '-'} />
            <InfoItem label="Asset" value={task.asset_name || '-'} />
            <InfoItem label="Status" value={task.status || '-'} />
            <InfoItem label="Frequency" value={task.frequency || '-'} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="bg-primary/5 px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Schedule
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <InfoItem label="Start Time" value={formatDateTime(task.start_time)} />
            <InfoItem label="End Time" value={formatDateTime(task.end_time)} />
            <InfoItem label="Assigned To" value={task.assigned_to || '-'} />
            <InfoItem label="Created On" value={formatDateTime(task.created_at)} />
          </div>
        </div>

        {task.submissions && task.submissions.length > 0 && (
          <div className="md:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Submissions ({task.submissions.length})</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {task.submissions.map((sub, index) => (
                  <div key={sub.id || index} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">{sub.question || `Question ${index + 1}`}</p>
                    <p className="text-foreground font-medium">{sub.answer || '-'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
);

export default ViewRoutineTask;
