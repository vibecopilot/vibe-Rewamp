import React, { useState } from 'react';
import { Paperclip } from 'lucide-react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { postCalendarTask } from '../../../api';
import { getItemInLocalStorage } from '../../../utils/localStorage';
import toast from 'react-hot-toast';
import 'react-datepicker/dist/react-datepicker.css';

interface CreateTaskModalProps {
  selectedDate: string;
  users: { value: string; label: string }[];
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  selectedDate,
  users,
  onSuccess,
  onCancel,
}) => {
  const vibeUserId = getItemInLocalStorage('VIBEUSERID');
  
  const [taskTopic, setTaskTopic] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(selectedDate ? new Date(selectedDate) : new Date());
  const [taskDescription, setTaskDescription] = useState('');
  const [assignTo, setAssignTo] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = async () => {
    if (!taskTopic.trim()) {
      toast.error('Please enter a task topic');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('user_id', vibeUserId);
      formData.append('title', taskTopic);
      formData.append('description', taskDescription);
      formData.append('due_date', dueDate?.toISOString() || '');
      formData.append('assign_to', JSON.stringify(assignTo.map(u => u.value)));
      
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      await postCalendarTask(formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Task Topic</label>
        <input
          type="text"
          value={taskTopic}
          onChange={(e) => setTaskTopic(e.target.value)}
          placeholder="Enter task topic"
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Date</label>
        <DatePicker
          selected={dueDate}
          onChange={(date) => setDueDate(date)}
          showTimeSelect
          dateFormat="Pp"
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Task Description</label>
        <textarea
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          placeholder="Enter task description"
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          <Paperclip className="inline h-4 w-4 mr-1" />
          Attachments
        </label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm"
        />
        {attachments.length > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            {attachments.map((file, idx) => (
              <span key={idx} className="mr-2">{file.name}</span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Assign To</label>
        <Select
          isMulti
          options={users}
          value={assignTo}
          onChange={(selected) => setAssignTo(selected as any[])}
          placeholder="Select users..."
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Task'}
        </button>
      </div>
    </div>
  );
};

export default CreateTaskModal;
