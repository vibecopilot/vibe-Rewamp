import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ListToolbar from '../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import { Loader2, Shield, AlertCircle, RefreshCw, Eye, Edit2, Plus } from 'lucide-react';
import { getPatrollings, getPatrollingHistory, postPatrolling, getFloors, getUnits, getStaff } from '../../api';
import { convertToIST, SendDateFormat, formatTime } from '../../utils/dateUtils';
import { getItemInLocalStorage } from '../../utils/localStorage';
import toast from 'react-hot-toast';

interface Patrolling {
  id: number;
  building_name?: string;
  floor_name?: string;
  unit_name?: string;
  start_time?: string;
  assigned_to?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  end_time?: string;
  created_at?: string;
}

interface PatrollingHistory {
  id: number;
  date?: string;
  time?: string;
  building_name?: string;
  floor_name?: string;
  unit_name?: string;
  staff_name?: string;
  status?: string;
  remarks?: string;
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

interface StaffMember {
  id: number;
  firstname?: string;
  lastname?: string;
}

type SubTab = 'schedule' | 'logs';

const VMSPatrolling: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SubTab>('schedule');
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
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [formData, setFormData] = useState({
    buildingId: '',
    floorId: '',
    unitId: '',
    scheduleTime: '',
    assignedTo: '',
    frequency: 'Daily',
    status: 'Active',
  });

  const buildings: Building[] = getItemInLocalStorage('Building') || [];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [patrollingRes, historyRes, staffRes] = await Promise.all([
        getPatrollings(),
        getPatrollingHistory(),
        getStaff(),
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

      const staffData = staffRes.data?.staffs || staffRes.data || [];
      setStaffList(staffData);
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

  const handleTabChange = (tab: SubTab) => {
    setActiveTab(tab);
    setSearchValue('');
    setSelectedRows([]);
    if (tab === 'schedule') {
      setFilteredPatrollings(patrollings);
    } else {
      setFilteredHistories(histories);
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

  const handleSubmit = async () => {
    if (!formData.buildingId || !formData.floorId) {
      toast.error('Please select Building and Floor!');
      return;
    }

    const sendData = new FormData();
    sendData.append('patrolling[building_id]', formData.buildingId);
    sendData.append('patrolling[floor_id]', formData.floorId);
    sendData.append('patrolling[unit_id]', formData.unitId);
    sendData.append('patrolling[start_time]', formData.scheduleTime);
    sendData.append('patrolling[assigned_to]', formData.assignedTo);
    sendData.append('patrolling[frequency]', formData.frequency);
    sendData.append('patrolling[status]', formData.status);

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
        scheduleTime: '',
        assignedTo: '',
        frequency: 'Daily',
        status: 'Active',
      });
      fetchData();
    } catch {
      toast.dismiss();
      toast.error('Something went wrong!');
    }
  };

  const scheduleColumns: TableColumn<Patrolling>[] = [
    {
      key: 'actions',
      header: 'ACTION',
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
    { key: 'building_name', header: 'BUILDING', sortable: true, render: (v) => v || '-' },
    { key: 'floor_name', header: 'FLOOR', sortable: true, render: (v) => v || '-' },
    { key: 'unit_name', header: 'UNIT', sortable: true, render: (v) => v || '-' },
    { key: 'start_time', header: 'SCHEDULE TIME', sortable: true, render: (v) => v ? convertToIST(v) : '-' },
    { key: 'assigned_to', header: 'ASSIGNED TO', sortable: true, render: (v) => v || '-' },
    { 
      key: 'status', 
      header: 'STATUS', 
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {value || 'Active'}
        </span>
      ),
    },
  ];

  const historyColumns: TableColumn<PatrollingHistory>[] = [
    {
      key: 'actions',
      header: 'ACTION',
      width: '80px',
      render: (_, row) => (
        <Link to={`/vms/patrolling/${row.id}`} className="text-muted-foreground hover:text-primary">
          <Eye className="w-4 h-4" />
        </Link>
      ),
    },
    { key: 'date', header: 'DATE', sortable: true, render: (v) => v || '-' },
    { key: 'time', header: 'TIME', sortable: true, render: (v) => v ? formatTime(v) : '-' },
    { key: 'building_name', header: 'BUILDING', sortable: true, render: (v) => v || '-' },
    { key: 'floor_name', header: 'FLOOR', sortable: true, render: (v) => v || '-' },
    { key: 'unit_name', header: 'UNIT', sortable: true, render: (v) => v || '-' },
    { key: 'staff_name', header: 'STAFF NAME', sortable: true, render: (v) => v || '-' },
    { 
      key: 'status', 
      header: 'STATUS',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Completed' ? 'bg-green-100 text-green-700' : 
          value === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
        }`}>
          {value || '-'}
        </span>
      ),
    },
    { key: 'remarks', header: 'REMARKS', render: (v) => v || '-' },
  ];

  const subTabs: { id: SubTab; label: string }[] = [
    { id: 'schedule', label: 'Schedule' },
    { id: 'logs', label: 'Logs' },
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
      <div className="flex gap-1 border-b border-border mb-4">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ListToolbar
        searchPlaceholder="Search by building, floor, unit"
        searchValue={searchValue}
        onSearchChange={handleSearch}
        onFilter={() => console.log('Filter clicked')}
        onExport={() => console.log('Export clicked')}
        onAdd={activeTab === 'schedule' ? () => setModalVisible(true) : undefined}
        addLabel="Add"
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
              Add Patrolling Schedule
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Building <span className="text-destructive">*</span></label>
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
                <label className="block text-sm font-medium text-foreground mb-1">Floor <span className="text-destructive">*</span></label>
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
                <label className="block text-sm font-medium text-foreground mb-1">Unit <span className="text-destructive">*</span></label>
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
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Schedule Time <span className="text-destructive">*</span></label>
                <input
                  type="time"
                  name="scheduleTime"
                  value={formData.scheduleTime}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Assigned To <span className="text-destructive">*</span></label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="">Select Staff</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>
                      {`${s.firstname || ''} ${s.lastname || ''}`.trim() || `Staff ${s.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Frequency</label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
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
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VMSPatrolling;
