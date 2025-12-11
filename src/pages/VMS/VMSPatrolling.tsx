import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ListToolbar from '../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import { Loader2, Shield, AlertCircle, RefreshCw, Eye, Edit2, Plus } from 'lucide-react';
import { getPatrollings, getPatrollingHistory, postPatrolling, getFloors, getUnits } from '../../api';
import { convertToIST, SendDateFormat, formatTime } from '../../utils/dateUtils';
import { getItemInLocalStorage } from '../../utils/localStorage';
import toast from 'react-hot-toast';

interface Patrolling {
  id: number;
  building_name?: string;
  floor_name?: string;
  unit_name?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  created_at?: string;
}

interface PatrollingHistory {
  id: number;
  building_name?: string;
  floor_name?: string;
  unit_name?: string;
  expected_time?: string;
  actual_time?: string;
}

interface Building {
  id: number;
  name: string;
}

interface Floor {
  id: number;
  name: string;
}

interface Unit {
  id: number;
  name: string;
}

const VMSPatrolling: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'logs'>('schedule');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [patrollings, setPatrollings] = useState<Patrolling[]>([]);
  const [filteredPatrollings, setFilteredPatrollings] = useState<Patrolling[]>([]);
  const [histories, setHistories] = useState<PatrollingHistory[]>([]);
  const [filteredHistories, setFilteredHistories] = useState<PatrollingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    buildingId: '',
    floorId: '',
    unitId: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    timeInterval: '',
  });

  const buildings: Building[] = getItemInLocalStorage('Building') || [];
  const hours = Array.from({ length: 24 }, (_, i) => i < 10 ? `0${i}` : `${i}`);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [patrollingRes, historyRes] = await Promise.all([
        getPatrollings(),
        getPatrollingHistory(),
      ]);
      
      const patrollingData = patrollingRes.data || [];
      const sortedPatrolling = Array.isArray(patrollingData)
        ? patrollingData.sort((a: Patrolling, b: Patrolling) =>
            new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
          )
        : [];
      setPatrollings(sortedPatrolling);
      setFilteredPatrollings(sortedPatrolling);

      const historyData = historyRes.data || [];
      const sortedHistory = Array.isArray(historyData)
        ? historyData.sort((a: PatrollingHistory, b: PatrollingHistory) => b.id - a.id)
        : [];
      setHistories(sortedHistory);
      setFilteredHistories(sortedHistory);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch patrolling data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (activeTab === 'schedule') {
      if (value.trim() === '') {
        setFilteredPatrollings(patrollings);
      } else {
        const filtered = patrollings.filter((item) =>
          item.building_name?.toLowerCase().includes(value.toLowerCase()) ||
          item.floor_name?.toLowerCase().includes(value.toLowerCase()) ||
          item.unit_name?.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredPatrollings(filtered);
      }
    } else {
      if (value.trim() === '') {
        setFilteredHistories(histories);
      } else {
        const filtered = histories.filter((item) =>
          item.building_name?.toLowerCase().includes(value.toLowerCase()) ||
          item.floor_name?.toLowerCase().includes(value.toLowerCase()) ||
          item.unit_name?.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredHistories(filtered);
      }
    }
  };

  const handleFormChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'buildingId') {
      try {
        const floorRes = await getFloors(Number(value));
        setFloors(floorRes.data.map((f: { name: string; id: number }) => ({ name: f.name, id: f.id })));
        setUnits([]);
      } catch {
        setFloors([]);
      }
      setFormData(prev => ({ ...prev, buildingId: value, floorId: '', unitId: '' }));
    } else if (name === 'floorId') {
      try {
        const unitRes = await getUnits(Number(value));
        setUnits(unitRes.data.map((u: { name: string; id: number }) => ({ name: u.name, id: u.id })));
      } catch {
        setUnits([]);
      }
      setFormData(prev => ({ ...prev, floorId: value, unitId: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleHourSelection = (hour: string) => {
    setSelectedHours(prev =>
      prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]
    );
  };

  const handleSubmit = async () => {
    if (!formData.buildingId || !formData.floorId) {
      toast.error('Please select Building and Floor!');
      return;
    }

    const sendData = new FormData();
    sendData.append('patrolling[building_id]', formData.buildingId);
    sendData.append('patrolling[floor_id]', formData.floorId);
    sendData.append('patrolling[unit_id]', formData.unitId);
    sendData.append('patrolling[start_date]', formData.startDate);
    sendData.append('patrolling[end_date]', formData.endDate);
    sendData.append('patrolling[start_time]', formData.startTime);
    sendData.append('patrolling[end_time]', formData.endTime);
    sendData.append('patrolling[time_intervals]', formData.timeInterval);
    selectedHours.forEach(hour => {
      sendData.append('patrolling[specific_times][]', hour);
    });

    try {
      toast.loading('Creating patrolling...');
      await postPatrolling(sendData);
      toast.dismiss();
      toast.success('Patrolling created successfully');
      setModalVisible(false);
      setFormData({
        buildingId: '',
        floorId: '',
        unitId: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        timeInterval: '',
      });
      setSelectedHours([]);
      fetchData();
    } catch {
      toast.dismiss();
      toast.error('Something went wrong!');
    }
  };

  const scheduleColumns: TableColumn<Patrolling>[] = [
    {
      key: 'actions',
      header: 'Action',
      width: '100px',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Link to={`/vms/patrolling/${row.id}`} className="text-muted-foreground hover:text-primary">
            <Eye className="w-4 h-4" />
          </Link>
          <Link to={`/vms/patrolling/${row.id}/edit`} className="text-muted-foreground hover:text-primary">
            <Edit2 className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
    { key: 'building_name', header: 'Building', sortable: true, render: (v) => v || '-' },
    { key: 'floor_name', header: 'Floor', sortable: true, render: (v) => v || '-' },
    { key: 'unit_name', header: 'Unit', sortable: true, render: (v) => v || '-' },
    { key: 'start_date', header: 'Start Date', sortable: true, render: (v) => v || '-' },
    { key: 'end_date', header: 'End Date', sortable: true, render: (v) => v || '-' },
    { key: 'start_time', header: 'Start Time', sortable: true, render: (v) => v ? convertToIST(v) : '-' },
    { key: 'end_time', header: 'End Time', sortable: true, render: (v) => v ? convertToIST(v) : '-' },
    { key: 'created_at', header: 'Created On', sortable: true, render: (v) => v ? SendDateFormat(v) : '-' },
  ];

  const historyColumns: TableColumn<PatrollingHistory>[] = [
    { key: 'building_name', header: 'Building', sortable: true, render: (v) => v || '-' },
    { key: 'floor_name', header: 'Floor', sortable: true, render: (v) => v || '-' },
    { key: 'unit_name', header: 'Unit', sortable: true, render: (v) => v || '-' },
    { key: 'expected_time', header: 'Expected Time', sortable: true, render: (v) => v ? formatTime(v) : '-' },
    { key: 'actual_time', header: 'Actual Time', sortable: true, render: (v) => v ? formatTime(v) : '-' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading patrolling data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Data</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Sub-tabs */}
      <div className="flex gap-4 border-b border-border mb-4">
        <button
          onClick={() => { setActiveTab('schedule'); setSearchValue(''); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'schedule'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Schedule
        </button>
        <button
          onClick={() => { setActiveTab('logs'); setSearchValue(''); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Logs
        </button>
      </div>

      <ListToolbar
        searchPlaceholder="Search by building, floor, unit..."
        searchValue={searchValue}
        onSearchChange={handleSearch}
        onFilter={() => console.log('Filter clicked')}
        onExport={() => console.log('Export clicked')}
        onAdd={activeTab === 'schedule' ? () => setModalVisible(true) : undefined}
        addLabel="Add Patrolling"
      />

      {activeTab === 'schedule' ? (
        filteredPatrollings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
            <Shield className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Patrolling Schedules</h3>
            <p className="text-muted-foreground mb-4">
              {searchValue ? `No schedules match "${searchValue}"` : 'Start by adding your first patrolling schedule'}
            </p>
            <button
              onClick={() => setModalVisible(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Patrolling
            </button>
          </div>
        ) : (
          <DataTable
            columns={scheduleColumns}
            data={filteredPatrollings}
            selectable
            selectedRows={selectedRows}
            onSelectRow={(id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])}
            onSelectAll={() => setSelectedRows(prev => prev.length === filteredPatrollings.length ? [] : filteredPatrollings.map(p => String(p.id)))}
            viewPath={(row) => `/vms/patrolling/${row.id}`}
          />
        )
      ) : (
        filteredHistories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
            <Shield className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Patrolling Logs</h3>
            <p className="text-muted-foreground">
              {searchValue ? `No logs match "${searchValue}"` : 'No patrolling logs available'}
            </p>
          </div>
        ) : (
          <DataTable columns={historyColumns} data={filteredHistories} />
        )
      )}

      {/* Add Modal */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50" onClick={() => setModalVisible(false)}>
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-foreground mb-6 text-center bg-primary text-primary-foreground py-2 rounded-full">
              Add Patrolling
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Building</label>
                <select
                  name="buildingId"
                  value={formData.buildingId}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="">Select Building</option>
                  {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Floor</label>
                <select
                  name="floorId"
                  value={formData.floorId}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="">Select Floor</option>
                  {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Unit</label>
                <select
                  name="unitId"
                  value={formData.unitId}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="">Select Unit</option>
                  {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>

            <h3 className="text-sm font-medium text-foreground border-b border-border pb-2 mb-4">Frequency</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1">Time Interval (hrs)</label>
              <input
                type="number"
                name="timeInterval"
                value={formData.timeInterval}
                onChange={handleFormChange}
                placeholder="Enter interval in hours"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Specific Hours</label>
              <div className="flex flex-wrap gap-2">
                {hours.map(hour => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => toggleHourSelection(hour)}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      selectedHours.includes(hour)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    {hour}:00
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalVisible(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VMSPatrolling;
