import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader2, Users, AlertCircle, RefreshCw, Search, Filter, Grid3X3, List, Download, Plus, Calendar, Phone, Building2 } from 'lucide-react';
import { BsEye } from 'react-icons/bs';
import { BiEdit } from 'react-icons/bi';
import { FaCheck } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import DataTable from 'react-data-table-component';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import { getItemInLocalStorage } from '../../utils/localStorage';
import Modal from '../../components/ui/Modal';
import { commonService } from '../../services/common.service';
import { vmsService, Visitor } from '../../services/vms.service';

type SubTab = 'all' | 'in' | 'out' | 'approval' | 'history' | 'logs' | 'self-registration';

interface FilterState {
  dateFrom: string;
  dateTo: string;
  mobile: string;
  buildingId: string;
  floorId: string;
  unitId: string;
  hostId: string;
  hostApproval: string;
}

const VMSVisitors: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const themeColor = useSelector((state: any) => state.theme?.color);
  
  // Get active tab from URL query params (default to 'all')
  const getActiveTab = (): SubTab => {
    const tab = searchParams.get('tab');
    if (tab && ['all', 'in', 'out', 'approval', 'history', 'logs', 'self-registration'].includes(tab)) {
      return tab as SubTab;
    }
    return 'all';
  };

  const [activeTab, setActiveTab] = useState<SubTab>(getActiveTab());
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 12,
    total: 0,
    totalPages: 0,
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: '',
    mobile: '',
    buildingId: '',
    floorId: '',
    unitId: '',
    hostId: '',
    hostApproval: '',
  });
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: '',
    mobile: '',
    buildingId: '',
    floorId: '',
    unitId: '',
    hostId: '',
    hostApproval: '',
  });
  
  // Dropdown options
  const [buildings, setBuildings] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [hosts, setHosts] = useState<any[]>([]);

  const token = getItemInLocalStorage<string>('TOKEN');
  const perPage = viewMode === 'grid' ? 12 : 10;

  // Helper to extract array from API response
  const extractArray = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (data?.data && Array.isArray(data.data)) return data.data;
    if (data?.buildings && Array.isArray(data.buildings)) return data.buildings;
    if (data?.floors && Array.isArray(data.floors)) return data.floors;
    if (data?.units && Array.isArray(data.units)) return data.units;
    if (data?.hosts && Array.isArray(data.hosts)) return data.hosts;
    return [];
  };

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [buildingsRes, hostsRes] = await Promise.all([
          commonService.getBuildings(),
          vmsService.getHosts(getItemInLocalStorage<string>('SITEID') || ''),
        ]);
        setBuildings(extractArray(buildingsRes.data));
        setHosts(extractArray(hostsRes.data));
      } catch (error) {
        console.error('Error fetching dropdowns:', error);
        setBuildings([]);
        setHosts([]);
      }
    };
    fetchDropdowns();
  }, []);

  // Fetch floors when building changes
  useEffect(() => {
    if (filters.buildingId) {
      commonService.getFloors(filters.buildingId).then((res) => {
        setFloors(extractArray(res.data));
        setFilters(prev => ({ ...prev, floorId: '', unitId: '' }));
      }).catch(() => setFloors([]));
    } else {
      setFloors([]);
      setFilters(prev => ({ ...prev, floorId: '', unitId: '' }));
    }
  }, [filters.buildingId]);

  // Fetch units when floor changes
  useEffect(() => {
    if (filters.floorId) {
      commonService.getUnits(filters.floorId).then((res) => {
        setUnits(extractArray(res.data));
        setFilters(prev => ({ ...prev, unitId: '' }));
      }).catch(() => setUnits([]));
    } else {
      setUnits([]);
      setFilters(prev => ({ ...prev, unitId: '' }));
    }
  }, [filters.floorId]);

  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = {
        token,
        page: pagination.page,
        per_page: perPage,
      };

      // Add search query
      if (searchValue) {
        params['q[name_or_contact_no_or_company_name_cont]'] = searchValue;
      }

      // Add applied filters
      if (appliedFilters.dateFrom) {
        params['q[expected_date_gteq]'] = appliedFilters.dateFrom;
      }
      if (appliedFilters.dateTo) {
        params['q[expected_date_lteq]'] = appliedFilters.dateTo;
      }
      if (appliedFilters.mobile) {
        params['q[contact_no_cont]'] = appliedFilters.mobile;
      }
      if (appliedFilters.hostId) {
        params['host_id'] = appliedFilters.hostId;
      }
      if (appliedFilters.hostApproval) {
        params['q[skip_host_approval_eq]'] = appliedFilters.hostApproval === 'required' ? 'false' : 'true';
      }

      let endpoint = '/visitors.json';
      
      // Apply tab-specific filters with CORRECT query params
      switch (activeTab) {
        case 'all':
          // All visitors - MUST use user_type_not_eq to exclude security guards
          params['q[user_type_not_eq]'] = 'security_guard';
          break;
        case 'in':
          // Visitors IN - MUST use user_type_not_eq and visitor_in_out_eq=IN
          params['q[visitor_in_out_eq]'] = 'IN';
          params['q[user_type_not_eq]'] = 'security_guard';
          break;
        case 'out':
          // Visitors OUT - MUST use user_type_not_eq and visitor_in_out_eq=OUT
          params['q[visitor_in_out_eq]'] = 'OUT';
          params['q[user_type_not_eq]'] = 'security_guard';
          break;
        case 'approval':
          // Approval form endpoint
          endpoint = '/visitors/approval_form.json';
          break;
        case 'history':
          // Approval history endpoint
          endpoint = '/visitors/approval_history.json';
          break;
        case 'logs':
          // Device logs endpoint
          endpoint = '/visitor_device_logs.json';
          break;
        case 'self-registration':
          // Self-registration visitors
          endpoint = '/visitors.json';
          params['q[self_registered_eq]'] = 'true';
          params['q[user_type_not_eq]'] = 'security_guard';
          break;
      }

      const response = await axiosInstance.get(endpoint, { params });
      
      // Handle different response structures
      const data = response.data;
      if (Array.isArray(data)) {
        setVisitors(data);
        setPagination(prev => ({
          ...prev,
          total: data.length,
          totalPages: Math.ceil(data.length / perPage),
        }));
      } else if (data?.visitors || data?.data) {
        const visitorList = data.visitors || data.data || [];
        setVisitors(visitorList);
        setPagination(prev => ({
          ...prev,
          total: data.total || data.total_count || visitorList.length,
          totalPages: data.total_pages || Math.ceil((data.total || visitorList.length) / perPage),
        }));
      } else {
        setVisitors([]);
        setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching visitors:', err);
      // Handle 404 or other errors gracefully
      if (err?.response?.status === 404) {
        setError(`Endpoint not available for ${activeTab} tab`);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch visitors';
        setError(errorMessage);
      }
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, perPage, searchValue, activeTab, appliedFilters, token]);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  // Sync active tab with URL params (for browser back/forward)
  useEffect(() => {
    const tabFromUrl = getActiveTab();
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Update URL when tab changes
  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab !== activeTab) {
      setSearchParams({ tab: activeTab });
    }
  }, [activeTab]);

  const handleTabChange = (tab: SubTab) => {
    setActiveTab(tab);
    setPagination(prev => ({ ...prev, page: 1 }));
    setError(null);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    setPagination(prev => ({ ...prev, page: 1, perPage: mode === 'grid' ? 12 : 10 }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setShowFilterModal(false);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    const emptyFilters: FilterState = {
      dateFrom: '',
      dateTo: '',
      mobile: '',
      buildingId: '',
      floorId: '',
      unitId: '',
      hostId: '',
      hostApproval: '',
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setShowFilterModal(false);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleApprove = async (id: number | string) => {
    try {
      await vmsService.approveVisitor(id, { status: 'approved' });
      toast.success('Visitor approved successfully');
      fetchVisitors();
    } catch (error) {
      toast.error('Failed to approve visitor');
    }
  };

  const handleReject = async (id: number | string) => {
    try {
      await vmsService.approveVisitor(id, { status: 'rejected' });
      toast.success('Visitor rejected');
      fetchVisitors();
    } catch (error) {
      toast.error('Failed to reject visitor');
    }
  };

  const getVisitorStatus = (visitor: Visitor): string => {
    const status = visitor.visitor_in_out || visitor.status || '-';
    return status;
  };

  const getStatusClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'IN':
        return 'bg-green-100 text-green-700';
      case 'OUT':
        return 'bg-red-100 text-red-700';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Table columns
  const columns = [
    {
      name: 'Action',
      width: '100px',
      cell: (row: Visitor) => (
        <div className="flex items-center gap-3">
          <Link to={`/vms/visitors/${row.id}`} className="text-gray-600 hover:text-primary">
            <BsEye size={16} />
          </Link>
          <Link to={`/vms/visitors/${row.id}/edit`} className="text-gray-600 hover:text-primary">
            <BiEdit size={16} />
          </Link>
        </div>
      ),
    },
    {
      name: 'Mobile Number',
      selector: (row: Visitor) => row.contact_no || '-',
      sortable: true,
    },
    {
      name: 'Visitor Name',
      selector: (row: Visitor) => row.name || '-',
      sortable: true,
    },
    {
      name: 'Company',
      selector: (row: Visitor) => row.company_name || '-',
      sortable: true,
    },
    {
      name: 'Purpose',
      selector: (row: Visitor) => row.purpose || '-',
      sortable: true,
    },
    {
      name: 'Expected Date',
      selector: (row: Visitor) => row.expected_date ? format(new Date(row.expected_date), 'dd/MM/yyyy') : '-',
      sortable: true,
    },
    {
      name: 'Expected Time',
      selector: (row: Visitor) => row.expected_time || '-',
      sortable: true,
    },
    {
      name: 'Status',
      cell: (row: Visitor) => {
        const status = getVisitorStatus(row);
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(status)}`}>{status}</span>;
      },
      sortable: true,
    },
    {
      name: 'Host',
      selector: (row: Visitor) => 
        row.host?.user ? `${row.host.user.firstname || ''} ${row.host.user.lastname || ''}`.trim() : '-',
      sortable: true,
    },
    ...(activeTab === 'approval' ? [{
      name: 'Accept/Reject',
      cell: (row: Visitor) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleApprove(row.id)}
            className="p-1.5 bg-green-500 rounded-full hover:bg-green-600 text-white transition-colors"
          >
            <FaCheck size={12} />
          </button>
          <button 
            onClick={() => handleReject(row.id)}
            className="p-1.5 bg-red-500 rounded-full hover:bg-red-600 text-white transition-colors"
          >
            <IoClose size={14} />
          </button>
        </div>
      ),
    }] : []),
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: themeColor || '#1a1a2e',
        color: 'white',
        fontSize: '12px',
      },
    },
    headCells: {
      style: {
        textTransform: 'uppercase' as const,
        fontWeight: '600',
      },
    },
    rows: {
      style: {
        minHeight: '52px',
      },
    },
  };

  const tabs: { key: SubTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'in', label: 'Visitors In' },
    { key: 'out', label: 'Visitors Out' },
    { key: 'approval', label: 'Approvals' },
    { key: 'history', label: 'History' },
    { key: 'logs', label: 'Logs' },
    { key: 'self-registration', label: 'Self-Registration' },
  ];

  if (loading && visitors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading visitors...</p>
      </div>
    );
  }

  if (error && visitors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Visitors</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={fetchVisitors}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* Add Button */}
        <button
          onClick={() => navigate('/vms/visitors/create')}
          style={{ backgroundColor: themeColor }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Visitor
        </button>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search visitors..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>

          {/* View Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'hover:bg-gray-50'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewModeChange('table')}
              className={`p-2 ${viewMode === 'table' ? 'bg-primary text-white' : 'hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Export Button */}
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {loading && visitors.length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Refreshing...</span>
        </div>
      )}

      {!loading && visitors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <Users className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Visitors Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchValue ? `No visitors match "${searchValue}"` : 'Start by adding your first visitor'}
          </p>
          <Link
            to="/vms/visitors/create"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium"
          >
            + Add New Visitor
          </Link>
        </div>
      )}

      {/* Grid View */}
      {visitors.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visitors.map((visitor) => (
            <div
              key={visitor.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{visitor.name || 'Unknown'}</h3>
                    <p className="text-sm text-gray-500">{visitor.contact_no}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(getVisitorStatus(visitor))}`}>
                  {getVisitorStatus(visitor)}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>{visitor.company_name || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{visitor.expected_date ? format(new Date(visitor.expected_date), 'dd MMM yyyy') : '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>Host: {visitor.host?.user ? `${visitor.host.user.firstname || ''} ${visitor.host.user.lastname || ''}`.trim() : '-'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                <Link
                  to={`/vms/visitors/${visitor.id}`}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  <BsEye size={14} /> View
                </Link>
                <Link
                  to={`/vms/visitors/${visitor.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  <BiEdit size={14} /> Edit
                </Link>
                {activeTab === 'approval' && (
                  <>
                    <button
                      onClick={() => handleApprove(visitor.id)}
                      className="p-1.5 bg-green-500 rounded hover:bg-green-600 text-white transition-colors"
                    >
                      <FaCheck size={12} />
                    </button>
                    <button
                      onClick={() => handleReject(visitor.id)}
                      className="p-1.5 bg-red-500 rounded hover:bg-red-600 text-white transition-colors"
                    >
                      <IoClose size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {visitors.length > 0 && viewMode === 'table' && (
        <DataTable
          columns={columns}
          data={visitors}
          customStyles={customStyles}
          pagination
          paginationServer
          paginationTotalRows={pagination.total}
          paginationPerPage={perPage}
          paginationRowsPerPageOptions={[10, 25, 50]}
          onChangePage={(newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
          onChangeRowsPerPage={(newPerPage) => setPagination(prev => ({ ...prev, perPage: newPerPage, page: 1 }))}
          progressPending={loading}
          fixedHeader
          highlightOnHover
          responsive
        />
      )}

      {/* Pagination for Grid View */}
      {viewMode === 'grid' && pagination.total > perPage && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * perPage) + 1} to{' '}
            {Math.min(pagination.page * perPage, pagination.total)} of{' '}
            {pagination.total} records
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              «
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ‹ Prev
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next ›
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.totalPages }))}
              disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              »
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Per page:</span>
            <select
              value={perPage}
              onChange={(e) => setPagination(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))}
              className="px-2 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filter Visitors"
        size="md"
        footer={
          <div className="flex gap-3">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleApplyFilters}
              style={{ backgroundColor: themeColor }}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Apply Filters
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Expected Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Date Range</label>
            <div className="flex gap-3">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input
              type="text"
              placeholder="Enter mobile number"
              value={filters.mobile}
              onChange={(e) => setFilters({ ...filters, mobile: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Building */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
            <select
              value={filters.buildingId}
              onChange={(e) => setFilters({ ...filters, buildingId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Building</option>
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.building_name}
                </option>
              ))}
            </select>
          </div>

          {/* Floor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
            <select
              value={filters.floorId}
              onChange={(e) => setFilters({ ...filters, floorId: e.target.value })}
              disabled={!filters.buildingId}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
            >
              <option value="">Select Floor</option>
              {floors.map((floor) => (
                <option key={floor.id} value={floor.id}>
                  {floor.floor_name}
                </option>
              ))}
            </select>
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              value={filters.unitId}
              onChange={(e) => setFilters({ ...filters, unitId: e.target.value })}
              disabled={!filters.floorId}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
            >
              <option value="">Select Unit</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.unit_name}
                </option>
              ))}
            </select>
          </div>

          {/* Host */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
            <select
              value={filters.hostId}
              onChange={(e) => setFilters({ ...filters, hostId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Host</option>
              {hosts.map((host) => (
                <option key={host.id} value={host.id}>
                  {host.firstname || host.name} {host.lastname || ''}
                </option>
              ))}
            </select>
          </div>

          {/* Host Approval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Host Approval</label>
            <select
              value={filters.hostApproval}
              onChange={(e) => setFilters({ ...filters, hostApproval: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select</option>
              <option value="required">Required</option>
              <option value="not_required">Not Required</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VMSVisitors;
