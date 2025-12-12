import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FormSection from '../../components/ui/FormSection';
import FormInput from '../../components/ui/FormInput';
import FormGrid from '../../components/ui/FormGrid';
import FormToggle from '../../components/ui/FormToggle';
import { 
  postChecklist,
  getAssignedTo,
  getChecklistGroupReading,
  getVendors
} from '../../api';
import { Loader2, ClipboardList, Plus, X, Users, Settings, Calendar, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { getItemInLocalStorage } from '../../utils/localStorage';

interface Question {
  name: string;
  type: string;
  question_mandatory: boolean;
  reading: boolean;
  help_text: string;
  showHelpText: boolean;
}

interface Section {
  group: string;
  questions: Question[];
}

const answerTypes = [
  { value: 'Yes/No', label: 'Yes/No' },
  { value: 'Text', label: 'Text' },
  { value: 'Number', label: 'Number' },
  { value: 'Date', label: 'Date' },
  { value: 'Photo', label: 'Photo' },
  { value: 'Dropdown', label: 'Dropdown' },
];

const frequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const lockOptions = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
];

const CreateChecklist: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const today = new Date().toISOString().split('T')[0];
  
  const [submitting, setSubmitting] = useState(false);
  const [createNew, setCreateNew] = useState(false);
  const [createTicket, setCreateTicket] = useState(false);
  const [weightage, setWeightage] = useState(false);
  
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [priority, setPriority] = useState('');
  
  const [submitHours, setSubmitHours] = useState(0);
  const [submitMinutes, setSubmitMinutes] = useState(0);
  const [extensionDays, setExtensionDays] = useState(0);
  const [extensionHours, setExtensionHours] = useState(0);
  const [extensionMinutes, setExtensionMinutes] = useState(0);
  const [lockOverdue, setLockOverdue] = useState('no');
  const [cronDay, setCronDay] = useState('*');
  const [cronHour, setCronHour] = useState('0');
  const [cronMinute, setCronMinute] = useState('0');
  
  const [selectedSupervisors, setSelectedSupervisors] = useState<any[]>([]);
  const [supplierId, setSupplierId] = useState('');
  
  const [supervisorOptions, setSupervisorOptions] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [groupOptions, setGroupOptions] = useState<any[]>([]);
  
  const [sections, setSections] = useState<Section[]>([
    {
      group: '',
      questions: [
        {
          name: '',
          type: '',
          question_mandatory: false,
          reading: false,
          help_text: '',
          showHelpText: false,
        },
      ],
    },
  ]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [assignedRes, suppliersRes, groupsRes] = await Promise.all([
        getAssignedTo(),
        getVendors(),
        getChecklistGroupReading(),
      ]);
      
      setSupervisorOptions(
        assignedRes.data?.map((user: any) => ({
          value: user.id,
          label: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
        })) || []
      );
      setSuppliers(suppliersRes.data || []);
      setGroupOptions(
        groupsRes.data?.map((g: any) => ({
          value: g.id,
          label: g.name || g.group_name,
        })) || []
      );
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const addSection = () => {
    setSections([
      ...sections,
      {
        group: '',
        questions: [
          {
            name: '',
            type: '',
            question_mandatory: false,
            reading: false,
            help_text: '',
            showHelpText: false,
          },
        ],
      },
    ]);
  };

  const removeSection = (index: number) => {
    if (sections.length > 1) {
      setSections(sections.filter((_, i) => i !== index));
    }
  };

  const addQuestion = (sectionIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex].questions.push({
      name: '',
      type: '',
      question_mandatory: false,
      reading: false,
      help_text: '',
      showHelpText: false,
    });
    setSections(updated);
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    const updated = [...sections];
    if (updated[sectionIndex].questions.length > 1) {
      updated[sectionIndex].questions.splice(questionIndex, 1);
      setSections(updated);
    }
  };

  const handleSectionChange = (index: number, value: string) => {
    const updated = [...sections];
    updated[index].group = value;
    setSections(updated);
  };

  const handleQuestionChange = (
    sectionIndex: number,
    questionIndex: number,
    field: keyof Question,
    value: any
  ) => {
    const updated = [...sections];
    (updated[sectionIndex].questions[questionIndex] as any)[field] = value;
    setSections(updated);
  };

  const clearCron = () => {
    setCronDay('*');
    setCronHour('0');
    setCronMinute('0');
  };

  const handleSubmit = async () => {
    if (!name) {
      toast.error('Checklist name is required');
      return;
    }

    setSubmitting(true);
    try {
      const siteId = getItemInLocalStorage('SITEID');
      const userId = getItemInLocalStorage('UserId');
      
      const payload = {
        checklist: {
          name,
          frequency,
          start_date: startDate,
          end_date: endDate,
          priority,
          ctype: 'soft_service',
          site_id: siteId,
          user_id: userId,
          submit_hours: submitHours,
          submit_minutes: submitMinutes,
          extension_days: extensionDays,
          extension_hours: extensionHours,
          extension_minutes: extensionMinutes,
          lock_overdue_task: lockOverdue === 'yes',
          cron_day: cronDay,
          cron_hour: cronHour,
          cron_minute: cronMinute,
          supervisor_ids: selectedSupervisors.map(s => s.value),
          supplier_id: supplierId || null,
          questions_attributes: sections.flatMap((section, sIdx) =>
            section.questions.map((q, qIdx) => ({
              group: section.group,
              name: q.name,
              type: q.type,
              question_mandatory: q.question_mandatory,
              reading: q.reading,
              help_text: q.help_text,
              position: sIdx * 100 + qIdx,
            }))
          ),
        },
      };

      await postChecklist(payload);
      toast.success('Checklist created successfully');
      navigate('/soft-services/checklist');
    } catch (error) {
      toast.error('Failed to create checklist');
    } finally {
      setSubmitting(false);
    }
  };

  const dayOptions = [
    { value: '*', label: 'Every day' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
    { value: '0', label: 'Sunday' },
  ];

  return (
    <div className="p-6">
      <Breadcrumb 
        items={[
          { label: 'FM Module' }, 
          { label: 'Soft Services', path: '/soft-services' }, 
          { label: 'Checklist', path: '/soft-services/checklist' },
          { label: 'Add Checklist' }
        ]} 
      />

      <div className="bg-card rounded-xl border border-border overflow-hidden mt-6">
        {/* Top Toggles */}
        <div className="flex items-center gap-6 p-6 border-b border-border">
          <FormToggle label="Create New" checked={createNew} onChange={setCreateNew} />
          <FormToggle label="Create Ticket" checked={createTicket} onChange={setCreateTicket} />
          <FormToggle label="Weightage" checked={weightage} onChange={setWeightage} />
        </div>

        <FormSection title="Add Checklist" icon={<ClipboardList className="w-5 h-5" />}>
          <FormGrid columns={3}>
            <FormInput
              label="Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter checklist name"
            />
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">Select Frequency</option>
                {frequencyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <FormInput
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <FormInput
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">Select Priority</option>
                {priorityOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </FormGrid>
        </FormSection>

        {/* Groups and Questions */}
        {sections.map((section, sectionIndex) => (
          <FormSection 
            key={sectionIndex} 
            title={`Add New Group ${sectionIndex + 1}`} 
            icon={<Plus className="w-5 h-5" />}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-foreground mb-1.5">Group</label>
                  <select
                    value={section.group}
                    onChange={(e) => handleSectionChange(sectionIndex, e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="">Select Group</option>
                    {groupOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                {sections.length > 1 && (
                  <button
                    onClick={() => removeSection(sectionIndex)}
                    className="mt-6 p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {section.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="flex items-start gap-4 p-4 bg-accent/30 rounded-lg">
                  <div className="flex-1">
                    <FormInput
                      label="Question Name"
                      value={question.name}
                      onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, 'name', e.target.value)}
                      placeholder="Enter question"
                    />
                  </div>
                  <div className="w-40">
                    <label className="block text-sm font-medium text-foreground mb-1.5">Answer Type</label>
                    <select
                      value={question.type}
                      onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    >
                      <option value="">Select Type</option>
                      {answerTypes.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-4 mt-6">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={question.question_mandatory}
                        onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, 'question_mandatory', e.target.checked)}
                        className="rounded border-border"
                      />
                      Mandatory
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={question.reading}
                        onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, 'reading', e.target.checked)}
                        className="rounded border-border"
                      />
                      Reading
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={question.showHelpText}
                        onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, 'showHelpText', e.target.checked)}
                        className="rounded border-border"
                      />
                      Help Text
                    </label>
                  </div>
                  <button
                    onClick={() => addQuestion(sectionIndex)}
                    className="mt-6 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Add Question
                  </button>
                  {section.questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(sectionIndex, questionIndex)}
                      className="mt-6 p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </FormSection>
        ))}

        <div className="px-6 pb-4">
          <button
            onClick={addSection}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Group
          </button>
        </div>

        {/* Schedules */}
        <FormSection title="Schedules" icon={<Calendar className="w-5 h-5" />}>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground w-40">Allowed time to submit:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={submitHours}
                    onChange={(e) => setSubmitHours(Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-border rounded-lg bg-background text-center"
                  />
                  <span className="text-sm">Hours</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={submitMinutes}
                    onChange={(e) => setSubmitMinutes(Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-border rounded-lg bg-background text-center"
                  />
                  <span className="text-sm">Minutes</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground w-40">Extension Time:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={extensionDays}
                    onChange={(e) => setExtensionDays(Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-border rounded-lg bg-background text-center"
                  />
                  <span className="text-sm">Days</span>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={extensionHours}
                    onChange={(e) => setExtensionHours(Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-border rounded-lg bg-background text-center"
                  />
                  <span className="text-sm">Hours</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={extensionMinutes}
                    onChange={(e) => setExtensionMinutes(Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-border rounded-lg bg-background text-center"
                  />
                  <span className="text-sm">Minutes</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground w-40">Lock Overdue Task:</span>
                <select
                  value={lockOverdue}
                  onChange={(e) => setLockOverdue(e.target.value)}
                  className="w-32 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  {lockOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground w-40">Cron Setting:</span>
                <span className="text-sm">Every</span>
                <select
                  value={cronDay}
                  onChange={(e) => setCronDay(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  {dayOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <span className="text-sm">at</span>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={cronHour}
                  onChange={(e) => setCronHour(e.target.value)}
                  className="w-16 px-2 py-1 border border-border rounded-lg bg-background text-center"
                />
                <span>:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={cronMinute}
                  onChange={(e) => setCronMinute(e.target.value)}
                  className="w-16 px-2 py-1 border border-border rounded-lg bg-background text-center"
                />
                <button
                  onClick={clearCron}
                  className="px-3 py-1 text-sm text-destructive border border-destructive rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Supervisors</label>
                <Select
                  isMulti
                  options={supervisorOptions}
                  value={selectedSupervisors}
                  onChange={(val) => setSelectedSupervisors(val as any[])}
                  placeholder="Select supervisors..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: 'hsl(var(--card))',
                      zIndex: 50,
                    }),
                    option: (base, { isFocused }) => ({
                      ...base,
                      backgroundColor: isFocused ? 'hsl(var(--accent))' : 'transparent',
                      color: 'hsl(var(--foreground))',
                    }),
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Supplier</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name || s.vendor_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </FormSection>

        {/* Submit Button */}
        <div className="p-6 border-t border-border">
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChecklist;
