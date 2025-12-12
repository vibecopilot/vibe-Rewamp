import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Modal from '../../components/ui/Modal';
import WorkingDaysSetup from './components/WorkingDaysSetup';

interface ScheduleItem {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
}

const PlanMyCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [showWorkingDaysModal, setShowWorkingDaysModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSchedule = async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    try {
      // Placeholder - would fetch from API
      setSchedule([]);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <Breadcrumb items={[
        { label: 'Calendar', path: '/calendar' },
        { label: 'Plan My Calendar' }
      ]} />

      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Plan My Calendar
          </h1>
          <button
            onClick={() => setShowWorkingDaysModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Schedule
          </button>
        </div>

        {/* Date Range Selection */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-3">View Schedule by Selecting Date Range:</p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
              />
            </div>
            <button
              onClick={fetchSchedule}
              className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium"
            >
              View Schedule
            </button>
          </div>
        </div>

        {/* Schedule Display */}
        <div className="min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : schedule.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <Calendar className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg">No Schedule For Selected Time Range</p>
              <p className="text-sm mt-1">Select a date range to view your schedule</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedule.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-secondary/50 rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">{item.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      {item.startTime} - {item.endTime}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{item.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Working Days Setup Modal */}
      <Modal
        isOpen={showWorkingDaysModal}
        onClose={() => setShowWorkingDaysModal(false)}
        title="Working Days Setup"
        size="lg"
      >
        <WorkingDaysSetup
          onSave={() => setShowWorkingDaysModal(false)}
          onCancel={() => setShowWorkingDaysModal(false)}
        />
      </Modal>
    </div>
  );
};

export default PlanMyCalendar;
