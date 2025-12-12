import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface WorkingDaysSetupProps {
  onSave: () => void;
  onCancel: () => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOT_DURATIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '60 minutes' },
];

const WorkingDaysSetup: React.FC<WorkingDaysSetupProps> = ({ onSave, onCancel }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  useEffect(() => {
    generateTimeSlots();
  }, [startTime, endTime, slotDuration]);

  const generateTimeSlots = () => {
    const slots: string[] = [];
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);

    for (let time = start; time < end; time += slotDuration) {
      const slotStart = minutesToTime(time);
      const slotEnd = minutesToTime(time + slotDuration);
      slots.push(`${slotStart} - ${slotEnd}`);
    }

    setTimeSlots(slots);
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const calculateWorkingHours = () => {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    const totalMinutes = end - start;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleSave = () => {
    if (!fromDate || !toDate) {
      toast.error('Please select date range');
      return;
    }
    if (selectedDays.length === 0) {
      toast.error('Please select at least one working day');
      return;
    }

    // Save logic here
    toast.success('Working days setup saved!');
    onSave();
  };

  return (
    <div className="space-y-5">
      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">FROM DATE</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">TO DATE</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
          />
        </div>
      </div>

      {/* Select Working Days */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">SELECT WORKING DAYS</label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDays.includes(day)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Working Time */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">SUGGESTED WORKING TIME</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Normal Working Hours */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">NORMAL WORKING HOURS</label>
        <div className="px-4 py-3 bg-secondary/50 rounded-lg">
          <span className="text-lg font-semibold text-primary">{calculateWorkingHours()}</span>
        </div>
      </div>

      {/* Slot Duration */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">SELECT SLOT DURATION</label>
        <select
          value={slotDuration}
          onChange={(e) => setSlotDuration(Number(e.target.value))}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
        >
          {SLOT_DURATIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Time Slots */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">SELECT TIME SLOT</label>
        <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-2">
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => toggleSlot(slot)}
                className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                  selectedSlots.includes(slot)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/50 text-foreground hover:bg-secondary'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default WorkingDaysSetup;
