import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { postNewCalendarEvent } from '../../../api';
import { getItemInLocalStorage } from '../../../utils/localStorage';
import toast from 'react-hot-toast';
import 'react-datepicker/dist/react-datepicker.css';

interface CreateEventModalProps {
  selectedDate: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  selectedDate,
  onSuccess,
  onCancel,
}) => {
  const vibeUserId = getItemInLocalStorage('VIBEUSERID');
  
  const [eventTopic, setEventTopic] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(selectedDate ? new Date(selectedDate) : new Date());
  const [endDate, setEndDate] = useState<Date | null>(selectedDate ? new Date(selectedDate) : new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [eventDescription, setEventDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = async () => {
    if (!eventTopic.trim()) {
      toast.error('Please enter an event topic');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('user_id', vibeUserId);
      formData.append('title', eventTopic);
      formData.append('description', eventDescription);
      formData.append('from_datetime', startDate?.toISOString() || '');
      formData.append('to_date', endDate?.toISOString() || '');
      formData.append('from_time', startTime);
      formData.append('to_time', endTime);
      formData.append('category', 'Event');
      
      files.forEach((file) => {
        formData.append('attachments', file);
      });

      await postNewCalendarEvent(formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Event Topic</label>
        <input
          type="text"
          value={eventTopic}
          onChange={(e) => setEventTopic(e.target.value)}
          placeholder="Enter event topic"
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">End Date</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="yyyy-MM-dd"
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Event Description</label>
        <textarea
          value={eventDescription}
          onChange={(e) => setEventDescription(e.target.value)}
          placeholder="Enter event description"
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          <Upload className="inline h-4 w-4 mr-1" />
          File Upload
        </label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm"
        />
        {files.length > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            {files.map((file, idx) => (
              <span key={idx} className="mr-2">{file.name}</span>
            ))}
          </div>
        )}
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
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </div>
    </div>
  );
};

export default CreateEventModal;
