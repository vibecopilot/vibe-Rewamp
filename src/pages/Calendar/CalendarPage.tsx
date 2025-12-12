import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ChevronLeft, ChevronRight, Plus, Calendar, RefreshCw } from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Modal from '../../components/ui/Modal';
import CreateTaskModal from './components/CreateTaskModal';
import CreateEventModal from './components/CreateEventModal';
import CreateMeetingModal from './components/CreateMeetingModal';
import SyncDropdown from './components/SyncDropdown';
import { getVibeCalenderEventsNew, getVibeUsers } from '../../api';
import { getItemInLocalStorage } from '../../utils/localStorage';
import toast from 'react-hot-toast';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  category: string;
  description?: string;
  meeting_link?: string;
  backgroundColor?: string;
  borderColor?: string;
}

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const calendarRef = useRef<FullCalendar>(null);
  const vibeUserId = getItemInLocalStorage('VIBEUSERID');

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'task' | 'event' | 'meeting'>('task');
  const [showSyncDropdown, setShowSyncDropdown] = useState(false);

  // Filters
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  useEffect(() => {
    fetchCalendarEvents();
    fetchUsers();
  }, []);

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      const response = await getVibeCalenderEventsNew(vibeUserId);
      const validCategories = ['Task', 'Event', 'Meeting'];
      
      const formattedEvents = (Array.isArray(response?.data) ? response.data : [])
        .filter((event: any) => validCategories.includes(event.category))
        .map((event: any) => {
          const start = event.category === 'Task' ? event.due_date : event.from_datetime;
          const end = event.to_date ? incrementDate(event.to_date) : start;
          
          const categoryColors: Record<string, { bg: string; border: string }> = {
            Task: { bg: '#7132CA', border: '#5a28a0' },
            Event: { bg: '#10B981', border: '#059669' },
            Meeting: { bg: '#F59E0B', border: '#D97706' },
          };

          return {
            id: String(event.id),
            title: event.title,
            start,
            end,
            category: event.category,
            description: event.description,
            meeting_link: event.meet_link,
            backgroundColor: categoryColors[event.category]?.bg || '#7132CA',
            borderColor: categoryColors[event.category]?.border || '#5a28a0',
          };
        });

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getVibeUsers(vibeUserId);
      if (response?.success && Array.isArray(response.data)) {
        const userOptions = response.data.map((user: any) => ({
          value: user.user_id,
          label: user.email,
        }));
        setUsers(userOptions);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const incrementDate = (dateString: string) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr);
    setShowCreateModal(true);
  };

  const handleEventClick = (arg: any) => {
    const event = arg.event;
    toast.success(`Clicked: ${event.title}`);
  };

  const handleViewChange = (view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
    setCurrentView(view);
    calendarRef.current?.getApi().changeView(view);
  };

  const handlePrev = () => {
    calendarRef.current?.getApi().prev();
    setCurrentDate(calendarRef.current?.getApi().getDate() || new Date());
  };

  const handleNext = () => {
    calendarRef.current?.getApi().next();
    setCurrentDate(calendarRef.current?.getApi().getDate() || new Date());
  };

  const handleToday = () => {
    calendarRef.current?.getApi().today();
    setCurrentDate(new Date());
  };

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchCalendarEvents();
    toast.success('Created successfully!');
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <Breadcrumb items={[{ label: 'Calendar' }]} />

      {/* Date Range Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">Start Date:</label>
          <input
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">End Date:</label>
          <input
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left: Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
            <span className="text-lg font-semibold text-foreground ml-2">{formatMonthYear()}</span>
          </div>

          {/* Right: View buttons & actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-secondary rounded-lg p-1">
              {(['dayGridMonth', 'timeGridWeek', 'timeGridDay'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => handleViewChange(view)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    currentView === view
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {view === 'dayGridMonth' ? 'Month' : view === 'timeGridWeek' ? 'Week' : 'Day'}
                </button>
              ))}
            </div>

            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-sm font-medium bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-1"
            >
              <Calendar className="h-4 w-4" />
              My Calendar
            </button>

            <div className="relative">
              <button
                onClick={() => setShowSyncDropdown(!showSyncDropdown)}
                className="px-3 py-1.5 text-sm font-medium bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Sync
              </button>
              {showSyncDropdown && (
                <SyncDropdown onClose={() => setShowSyncDropdown(false)} />
              )}
            </div>

            <button
              onClick={() => navigate('/calendar/plan')}
              className="px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Plan My Day
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4">
        {loading ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={currentView}
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            headerToolbar={false}
            height="auto"
            dayMaxEvents={3}
            eventDisplay="block"
            nowIndicator
            selectable
            editable={false}
          />
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => {
          setSelectedDate(new Date().toISOString().split('T')[0]);
          setShowCreateModal(true);
        }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center z-40"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Create Task/Event/Meeting Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title=""
        size="lg"
      >
        {/* Tabs */}
        <div className="flex border-b border-border mb-4">
          {(['task', 'event', 'meeting'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'task' && (
          <CreateTaskModal
            selectedDate={selectedDate || ''}
            users={users}
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateModal(false)}
          />
        )}
        {activeTab === 'event' && (
          <CreateEventModal
            selectedDate={selectedDate || ''}
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateModal(false)}
          />
        )}
        {activeTab === 'meeting' && (
          <CreateMeetingModal
            selectedDate={selectedDate || ''}
            users={users}
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default CalendarPage;
