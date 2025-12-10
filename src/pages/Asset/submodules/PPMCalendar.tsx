import React, { useState, useEffect, useCallback } from 'react';
import { ppmActivityService, PPMActivity } from '../../services/assetSubModules.service';
import { Loader2, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge, { StatusType } from '../../components/ui/StatusBadge';

interface PPMCalendarProps {
  searchValue: string;
}

const PPMCalendar: React.FC<PPMCalendarProps> = ({ searchValue }) => {
  const [activities, setActivities] = useState<PPMActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ppmActivityService.getPPMActivities(1, 100);
      const data = response.data;
      const activityList = Array.isArray(data) ? data : data?.activities || data?.data || [];
      setActivities(activityList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch PPM activities');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const getActivityStatus = (activity: PPMActivity): StatusType => {
    const status = activity.status?.toLowerCase();
    if (status === 'completed' || status === 'done') return 'checked-out';
    if (status === 'in_progress' || status === 'ongoing') return 'maintenance';
    if (status === 'overdue') return 'breakdown';
    return 'pending';
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const getActivitiesForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return activities.filter(activity => {
      const dueDate = activity.due_date || activity.start_time;
      return dueDate?.startsWith(dateStr);
    }).filter(activity => 
      !searchValue || 
      activity.checklist_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
      activity.asset_name?.toLowerCase().includes(searchValue.toLowerCase())
    );
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: startingDay }, (_, i) => i);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading PPM calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-error mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Calendar</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button onClick={fetchActivities} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 border border-border rounded-lg hover:bg-accent">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent">
            Today
          </button>
          <button onClick={nextMonth} className="p-2 border border-border rounded-lg hover:bg-accent">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className="min-h-24 bg-muted/30 rounded-lg" />
        ))}
        {days.map((day) => {
          const dayActivities = getActivitiesForDate(day);
          const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
          return (
            <div
              key={day}
              className={`min-h-24 p-2 border border-border rounded-lg ${isToday ? 'bg-primary/5 border-primary' : 'hover:bg-accent/50'}`}
            >
              <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>{day}</div>
              <div className="space-y-1">
                {dayActivities.slice(0, 3).map((activity) => (
                  <div
                    key={activity.id}
                    className="text-xs p-1 rounded bg-primary/10 text-primary truncate cursor-pointer hover:bg-primary/20"
                    title={activity.checklist_name || `Activity #${activity.id}`}
                  >
                    <StatusBadge status={getActivityStatus(activity)} size="sm" />
                    <span className="ml-1">{activity.checklist_name?.substring(0, 15) || `#${activity.id}`}</span>
                  </div>
                ))}
                {dayActivities.length > 3 && (
                  <div className="text-xs text-muted-foreground">+{dayActivities.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PPMCalendar;
