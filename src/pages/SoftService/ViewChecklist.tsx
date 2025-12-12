import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FormSection from '../../components/ui/FormSection';
import FormGrid from '../../components/ui/FormGrid';
import { getChecklistDetails } from '../../api';
import { Loader2, ClipboardList, AlertCircle, RefreshCw, Edit2, ArrowLeft } from 'lucide-react';

interface Question {
  id: number;
  name: string;
  type: string;
  group?: string;
  question_mandatory?: boolean;
  reading?: boolean;
  help_text?: string;
}

interface ChecklistDetails {
  id: number;
  name: string;
  frequency?: string;
  start_date?: string;
  end_date?: string;
  priority?: string;
  submit_hours?: number;
  submit_minutes?: number;
  extension_days?: number;
  extension_hours?: number;
  extension_minutes?: number;
  lock_overdue_task?: boolean;
  cron_day?: string;
  cron_hour?: string;
  cron_minute?: string;
  supervisors?: any[];
  supplier?: any;
  questions?: Question[];
  created_at?: string;
  updated_at?: string;
}

const ViewChecklist: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<ChecklistDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChecklistDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getChecklistDetails(id);
      setChecklist(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch checklist details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklistDetails();
  }, [id]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const getDayLabel = (day?: string) => {
    const days: Record<string, string> = {
      '*': 'Every day',
      '0': 'Sunday',
      '1': 'Monday',
      '2': 'Tuesday',
      '3': 'Wednesday',
      '4': 'Thursday',
      '5': 'Friday',
      '6': 'Saturday',
    };
    return days[day || '*'] || day;
  };

  // Group questions by their group field
  const groupedQuestions = checklist?.questions?.reduce((acc, q) => {
    const group = q.group || 'Default';
    if (!acc[group]) acc[group] = [];
    acc[group].push(q);
    return acc;
  }, {} as Record<string, Question[]>) || {};

  if (loading) {
    return (
      <div className="p-6">
        <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Soft Services', path: '/soft-services' }, { label: 'Checklist', path: '/soft-services/checklist' }, { label: 'View' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading checklist details...</p>
        </div>
      </div>
    );
  }

  if (error || !checklist) {
    return (
      <div className="p-6">
        <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Soft Services', path: '/soft-services' }, { label: 'Checklist', path: '/soft-services/checklist' }, { label: 'View' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Checklist</h3>
          <p className="text-muted-foreground mb-4">{error || 'Checklist not found'}</p>
          <button onClick={fetchChecklistDetails} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Soft Services', path: '/soft-services' }, { label: 'Checklist', path: '/soft-services/checklist' }, { label: checklist.name }]} />

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-6 mb-4">
        <button
          onClick={() => navigate('/soft-services/checklist')}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <Link
          to={`/soft-services/checklist/${id}/edit`}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <FormSection title="Checklist Details" icon={<ClipboardList className="w-5 h-5" />}>
          <FormGrid columns={3}>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Name</label>
              <p className="text-foreground font-medium">{checklist.name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Frequency</label>
              <p className="text-foreground font-medium capitalize">{checklist.frequency || '-'}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Priority</label>
              <p className="text-foreground font-medium capitalize">{checklist.priority || '-'}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Start Date</label>
              <p className="text-foreground font-medium">{formatDate(checklist.start_date)}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">End Date</label>
              <p className="text-foreground font-medium">{formatDate(checklist.end_date)}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Lock Overdue Task</label>
              <p className="text-foreground font-medium">{checklist.lock_overdue_task ? 'Yes' : 'No'}</p>
            </div>
          </FormGrid>
        </FormSection>

        <FormSection title="Schedule Settings" icon={<ClipboardList className="w-5 h-5" />}>
          <FormGrid columns={3}>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Allowed Submit Time</label>
              <p className="text-foreground font-medium">{checklist.submit_hours || 0}h {checklist.submit_minutes || 0}m</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Extension Time</label>
              <p className="text-foreground font-medium">{checklist.extension_days || 0}d {checklist.extension_hours || 0}h {checklist.extension_minutes || 0}m</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Cron Setting</label>
              <p className="text-foreground font-medium">
                {getDayLabel(checklist.cron_day)} at {checklist.cron_hour || '0'}:{checklist.cron_minute || '0'}
              </p>
            </div>
          </FormGrid>
        </FormSection>

        {Object.keys(groupedQuestions).length > 0 && (
          <FormSection title="Questions" icon={<ClipboardList className="w-5 h-5" />}>
            <div className="space-y-6">
              {Object.entries(groupedQuestions).map(([group, questions]) => (
                <div key={group} className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground bg-accent/50 px-3 py-2 rounded-lg">{group}</h4>
                  {questions.map((q, idx) => (
                    <div key={q.id || idx} className="flex items-start gap-4 p-3 bg-accent/20 rounded-lg">
                      <span className="text-sm text-muted-foreground w-8">{idx + 1}.</span>
                      <div className="flex-1">
                        <p className="text-foreground">{q.name}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>Type: {q.type}</span>
                          {q.question_mandatory && <span className="text-primary">Mandatory</span>}
                          {q.reading && <span>Reading</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </FormSection>
        )}

        {(checklist.supervisors?.length || checklist.supplier) && (
          <FormSection title="Assignments" icon={<ClipboardList className="w-5 h-5" />}>
            <FormGrid columns={2}>
              {checklist.supervisors && checklist.supervisors.length > 0 && (
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Supervisors</label>
                  <div className="flex flex-wrap gap-2">
                    {checklist.supervisors.map((s, idx) => (
                      <span key={idx} className="px-2 py-1 bg-accent rounded-md text-sm">
                        {s.firstname} {s.lastname}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {checklist.supplier && (
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Supplier</label>
                  <p className="text-foreground font-medium">{checklist.supplier.name || checklist.supplier.vendor_name || '-'}</p>
                </div>
              )}
            </FormGrid>
          </FormSection>
        )}
      </div>
    </div>
  );
};

export default ViewChecklist;
