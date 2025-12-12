import React, { useState } from 'react';
import { Copy, ArrowRight } from 'lucide-react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import ReactSwitch from 'react-switch';
import { CreateVibeMeeting } from '../../../api';
import { getItemInLocalStorage } from '../../../utils/localStorage';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import 'react-datepicker/dist/react-datepicker.css';

interface CreateMeetingModalProps {
  selectedDate: string;
  users: { value: string; label: string }[];
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
  selectedDate,
  users,
  onSuccess,
  onCancel,
}) => {
  const vibeUserId = getItemInLocalStorage('VIBEUSERID');
  
  const [meetingTopic, setMeetingTopic] = useState('');
  const [meetingDate, setMeetingDate] = useState<Date | null>(selectedDate ? new Date(selectedDate) : new Date());
  const [meetingDescription, setMeetingDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [meetingLink, setMeetingLink] = useState('');
  const [invites, setInvites] = useState<any[]>([]);
  const [otherEmails, setOtherEmails] = useState('');
  const [emailList, setEmailList] = useState<string[]>([]);
  const [repeat, setRepeat] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateMeetingLink = () => {
    const uuid = uuidv4();
    const link = `https://meet.vibecopilot.ai/${uuid}`;
    setMeetingLink(link);
    toast.success('Meeting link generated!');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(meetingLink);
    toast.success('Link copied to clipboard!');
  };

  const addOtherEmail = () => {
    if (otherEmails.trim() && otherEmails.includes('@')) {
      setEmailList([...emailList, otherEmails.trim()]);
      setOtherEmails('');
    } else {
      toast.error('Please enter a valid email');
    }
  };

  const handleSubmit = async () => {
    if (!meetingTopic.trim()) {
      toast.error('Please enter a meeting topic');
      return;
    }

    try {
      setLoading(true);
      const data = {
        user_id: vibeUserId,
        title: meetingTopic,
        description: meetingDescription,
        from_datetime: meetingDate?.toISOString(),
        from_time: startTime,
        to_time: endTime,
        meet_link: meetingLink,
        participant_ids: invites.map(u => u.value),
        other_emails: emailList,
        category: 'Meeting',
        is_repeat: repeat,
      };

      await CreateVibeMeeting(data);
      onSuccess();
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error('Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Meeting Topic</label>
        <input
          type="text"
          value={meetingTopic}
          onChange={(e) => setMeetingTopic(e.target.value)}
          placeholder="Enter meeting topic"
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Date</label>
          <DatePicker
            selected={meetingDate}
            onChange={(date) => setMeetingDate(date)}
            dateFormat="yyyy-MM-dd"
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Meeting Description</label>
          <input
            type="text"
            value={meetingDescription}
            onChange={(e) => setMeetingDescription(e.target.value)}
            placeholder="Description"
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
        <label className="block text-sm font-medium text-foreground mb-1">Meeting Link</label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={meetingLink}
              readOnly
              placeholder="Generate or paste meeting link"
              className="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-secondary/50 text-foreground"
            />
            {meetingLink && (
              <button
                onClick={copyToClipboard}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded"
              >
                <Copy className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            onClick={generateMeetingLink}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1 text-sm whitespace-nowrap"
          >
            Generate Link <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Invites</label>
        <Select
          isMulti
          options={users}
          value={invites}
          onChange={(selected) => setInvites(selected as any[])}
          placeholder="Select participants..."
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Add Other Emails</label>
        <div className="flex gap-2">
          <input
            type="email"
            value={otherEmails}
            onChange={(e) => setOtherEmails(e.target.value)}
            placeholder="Enter email address"
            className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
          />
          <button
            onClick={addOtherEmail}
            className="px-3 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {emailList.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {emailList.map((email, idx) => (
              <span key={idx} className="px-2 py-1 bg-secondary rounded text-sm">{email}</span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-foreground">Repeat</label>
        <ReactSwitch
          checked={repeat}
          onChange={setRepeat}
          onColor="#7132CA"
          offColor="#e5e7eb"
          uncheckedIcon={false}
          checkedIcon={false}
          height={24}
          width={44}
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
          {loading ? 'Creating...' : 'Create Meeting'}
        </button>
      </div>
    </div>
  );
};

export default CreateMeetingModal;
