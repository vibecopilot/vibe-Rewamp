import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Loader2, Users, AlertCircle, RefreshCw, Search, Filter, Grid3X3, List, 
  Download, Plus, Calendar, Phone, Building2, Clock, CheckCircle, XCircle,
  UserCheck, UserX, History, FileText, UserPlus
} from 'lucide-react';
import { BsEye } from 'react-icons/bs';
import { BiEdit } from 'react-icons/bi';
import { FaCheck } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import DataTable from 'react-data-table-component';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import { vmsService, Visitor } from '../../services/vms.service';

// Sub-tabs for Visitors section
const subTabs = [
  { id: 'all', label: 'All Visitors', icon: Users },
  { id: 'in', label: 'Visitor In', icon: UserCheck },
  { id: 'out', label: 'Visitor Out', icon: UserX },
  { id: 'approvals', label: 'Approvals', icon: Clock },
  { id: 'history', label: 'History', icon: History },
  { id: 'logs', label: 'Logs', icon: FileText },
  { id: 'self-registration', label: 'Self-Registration', icon: UserPlus },
];

interface FilterState {
  dateFrom: string;
  dateTo: string;
  mobile: string;
  hostId: string;
}

const SecurityVisitors: React.FC = () => {
  const navigate = useNavigate();
  const themeColor = useSelector((state: any) => state.theme?.color);
  
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [visitorType, setVisitorType] = useState<'expected' | 'unexpected'>('expected');
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; type: 'approve' | 'reject'; id: string | number | null }>({ isOpen: false, type: 'approve', id: null });
  
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 12,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: '',
    mobile: '',
    hostId: '',
  });
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: '',
    mobile: '',
    hostId: '',
  });

  const perPage = viewMode === 'grid' ? 12 : 10;

  // Fetch visitors based on active sub-tab
  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let filterParams: any = { 
        search: searchValue,
        userTypeNotEq: 'security_guard',
      };

      // Apply tab-specific filters
      switch (activeSubTab) {
        case 'in':
          filterParams.visitorInOut = 'in';
          break;
        case 'out':
          filterParams.visitorInOut = 'out';
          break;
        case 'approvals':
          // Fetch pending approvals
          const approvalsRes = await vmsService.getApprovals(pagination.page, perPage);
          const approvalsData = approvalsRes.data;
          setVisitors(Array.isArray(approvalsData) ? approvalsData : approvalsData?.visitors || approvalsData?.data || []);
          setPagination(prev => ({
            ...prev,
            total: approvalsData.total || approvalsData.length,
            totalPages: approvalsData.total_pages || Math.ceil((approvalsData.total || approvalsData.length) / perPage),
          }));
          setLoading(false);
          return;
        case 'history':
          // Fetch approval history
          const historyRes = await vmsService.getHistory(pagination.page, perPage);
          const historyData = historyRes.data;
          setVisitors(Array.isArray(historyData) ? historyData : historyData?.visitors || historyData?.data || []);
          setPagination(prev => ({
            ...prev,
            total: historyData.total || historyData.length,
            totalPages: historyData.total_pages || Math.ceil((historyData.total || historyData.length) / perPage),
          }));
          setLoading(false);
          return;
        case 'logs':
          // Fetch device logs
          const logsRes = await vmsService.getDeviceLogs(pagination.page, perPage);
          const logsData = logsRes.data;
          setVisitors(Array.isArray(logsData) ? logsData : logsData?.logs || logsData?.data || []);
          setPagination(prev => ({
            ...prev,
            total: logsData.total || logsData.length,
            totalPages: logsData.total_pages || Math.ceil((logsData.total || logsData.length) / perPage),
          }));
          setLoading(false);
          return;
        case 'self-registration':
          filterParams.userType = 'self_registered';
          break;
        default:
          // All visitors - no additional filter
          break;
      }

      // Add applied filters
      if (appliedFilters.dateFrom) filterParams.dateFrom = appliedFilters.dateFrom;
      if (appliedFilters.dateTo) filterParams.dateTo = appliedFilters.dateTo;
      if (appliedFilters.mobile) filterParams.mobile = appliedFilters.mobile;
      if (appliedFilters.hostId) filterParams.host = appliedFilters.hostId;

      const res = await vmsService.getVisitors(pagination.page, perPage, filterParams);
      const data = res.data;
      
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
    } catch (err: any) {
      console.error('Error fetching visitors:', err);
      setError(err?.message || 'Failed to fetch visitors');
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, perPage, searchValue, appliedFilters, activeSubTab]);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const handleSubTabChange = (tabId: string) => {
    setActiveSubTab(tabId);
    setPagination(prev => ({ ...prev, page: 1 }));
    setSearchValue('');
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
    const emptyFilters: FilterState = { dateFrom: '', dateTo: '', mobile: '', hostId: '' };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setShowFilterModal(false);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleApprove = async () => {
    if (!confirmModal.id) return;
    try {
      await vmsService.approveVisitor(confirmModal.id, { status: 'approved' });
      toast.success('Visitor approved successfully');
      setConfirmModal({ isOpen: false, type: 'approve', id: null });
      fetchVisitors();
    } catch (error) {
      toast.error('Failed to approve visitor');
    }
  };

  const handleReject = async () => {
    if (!confirmModal.id) return;
    try {
      await vmsService.approveVisitor(confirmModal.id, { status: 'rejected' });
      toast.success('Visitor rejected');
      setConfirmModal({ isOpen: false, type: 'reject', id: null });
      fetchVisitors();
    } catch (error) {
      toast.error('Failed to reject visitor');
    }
  };

  const getVisitorStatus = (visitor: Visitor): string => {
    return visitor.visitor_in_out || visitor.status || '-';
  };

  const getStatusClass = (status: string): string => {
    switch (status?.toUpperCase()) {
      case 'IN': return 'bg-green-100 text-green-700';
      case 'OUT': return 'bg-red-100 text-red-700';
      case 'APPROVED': return 'bg-blue-100 text-blue-700';
      case 'REJECTED': case 'DENIED': return 'bg-red-100 text-red-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Get columns based on active tab
  const getColumns = () => {
    const baseColumns = [
      {
        name: 'Action',
        width: '100px',
        cell: (row: any) => (
          <div className="flex items-center gap-3">
            <Link to={`/security/visitors/${row.id}`} className="text-gray-600 hover:text-primary">
              <BsEye size={16} />
            </Link>
            {activeSubTab !== 'logs' && activeSubTab !== 'history' && (
              <Link to={`/security/visitors/${row.id}/edit`} className="text-gray-600 hover:text-primary">
                <BiEdit size={16} />
              </Link>
            )}
          </div>
        ),
      },
    ];

    if (activeSubTab === 'approvals') {
      return [
        ...baseColumns,
        { name: 'Name', selector: (row: any) => row.name || '-', sortable: true },
        { name: 'Purpose', selector: (row: any) => row.purpose || '-', sortable: true },
        { name: 'Expected Date', selector: (row: any) => row.expected_date ? format(new Date(row.expected_date), 'dd/MM/yyyy') : '-', sortable: true },
        { name: 'Expected Time', selector: (row: any) => row.expected_time || '-', sortable: true },
        {
          name: 'Approval',
          cell: (row: any) => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmModal({ isOpen: true, type: 'approve', id: row.id })}
                className="p-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              >
                <FaCheck size={12} />
              </button>
              <button
                onClick={() => setConfirmModal({ isOpen: true, type: 'reject', id: row.id })}
                className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <IoClose size={14} />
              </button>
            </div>
          ),
        },
      ];
    }

    if (activeSubTab === 'history') {
      return [
        ...baseColumns,
        { name: 'Name', selector: (row: any) => row.name || '-', sortable: true },
        { name: 'Purpose', selector: (row: any) => row.purpose || '-', sortable: true },
        { name: 'Mobile No.', selector: (row: any) => row.contact_no || '-', sortable: true },
        { name: 'Approval Date', selector: (row: any) => row.updated_at ? format(new Date(row.updated_at), 'dd/MM/yyyy') : '-', sortable: true },
        {
          name: 'Approval',
          cell: (row: any) => {
            const status = row.status?.toUpperCase();
            return (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {status === 'APPROVED' ? 'Approved' : 'Denied'}
              </span>
            );
          },
        },
      ];
    }

    if (activeSubTab === 'logs') {
      return [
        ...baseColumns,
        { name: 'Sr. No.', selector: (row: any, index: number) => index + 1, sortable: false, width: '80px' },
        { name: 'Name', selector: (row: any) => row.name || row.visitor_name || '-', sortable: true },
        { name: 'Check In', selector: (row: any) => row.check_in_time ? format(new Date(row.check_in_time), 'dd/MM/yyyy HH:mm') : '-', sortable: true },
        { name: 'Check Out', selector: (row: any) => row.check_out_time ? format(new Date(row.check_out_time), 'dd/MM/yyyy HH:mm') : '-', sortable: true },
      ];
    }

    // Default columns for All, In, Out, Self-Registration
    return [
      ...baseColumns,
      { name: 'Visitor Type', selector: (row: any) => row.user_type || '-', sortable: true },
      { name: 'Name', selector: (row: any) => row.name || '-', sortable: true },
      { name: 'Contact No.', selector: (row: any) => row.contact_no || '-', sortable: true },
      { name: 'Purpose', selector: (row: any) => row.purpose || '-', sortable: true },
      { name: 'Coming From', selector: (row: any) => row.company_name || '-', sortable: true },
      { name: 'Expected Date', selector: (row: any) => row.expected_date ? format(new Date(row.expected_date), 'dd/MM/yyyy') : '-', sortable: true },
      { name: 'Expected Time', selector: (row: any) => row.expected_time || '-', sortable: true },
      { name: 'Vehicle No.', selector: (row: any) => row.vehicle_number || '-', sortable: true },
    ];
  };

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: themeColor || 'hsl(var(--primary))',
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

  const getAddButtonConfig = () => {
    switch (activeSubTab) {
      case 'self-registration':
        return { label: 'Add Self-Registration', path: '/security/visitors/self-register' };
      default:
        return { label: 'Add New Visitor', path: '/security/visitors/create' };
    }
  };

  const getTitle = () => {
    switch (activeSubTab) {
      case 'all': return 'All Visitors';
      case 'in': return 'Visitors Currently Inside';
      case 'out': return 'Visitors Who Checked Out';
      case 'approvals': return 'Pending Approvals';
      case 'history': return 'Visitor History';
      case 'logs': return 'Visitor Check-in/Check-out Logs';
      case 'self-registration': return 'Self-Registered Visitors';
      default: return 'Visitors';
    }
  };

  const showAddButton = ['all', 'in', 'self-registration'].includes(activeSubTab);

  if (loading && visitors.length === 0) {
    return (
      <div>
        {/* Sub-tabs */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
          {subTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleSubTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeSubTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2 border-b border-border">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleSubTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeSubTab === tab.id
                ? 'text-primary border-b-2 border-primary -mb-[1px]'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-foreground mb-4">{getTitle()}</h2>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={activeSubTab === 'all' ? 'Search using Visitor name, Host, vehicle number' : 'Search...'}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-80 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Expected/Unexpected Toggle */}
          {['all', 'in', 'out'].includes(activeSubTab) && (
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setVisitorType('expected')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  visitorType === 'expected' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-accent'
                }`}
              >
                Expected
              </button>
              <button
                onClick={() => setVisitorType('unexpected')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  visitorType === 'unexpected' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-accent'
                }`}
              >
                Unexpected
              </button>
            </div>
          )}

          {/* Filter Button */}
          {activeSubTab !== 'logs' && (
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewModeChange('table')}
              className={`p-2 ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={() => toast.success('Export started')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          {/* Add Button */}
          {showAddButton && (
            <button
              onClick={() => navigate(getAddButtonConfig().path)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {getAddButtonConfig().label}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Data</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchVisitors}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {!error && !loading && visitors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border border-border">
          <Users className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Records Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchValue ? `No results match "${searchValue}"` : 'No data available'}
          </p>
        </div>
      )}

      {/* Grid View */}
      {visitors.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visitors.map((visitor, index) => (
            <div
              key={visitor.id || index}
              className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{visitor.name || 'Unknown'}</h3>
                    <p className="text-sm text-muted-foreground">{visitor.contact_no}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(getVisitorStatus(visitor))}`}>
                  {getVisitorStatus(visitor)}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span>{visitor.company_name || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{visitor.expected_date ? format(new Date(visitor.expected_date), 'dd MMM yyyy') : '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>Host: {visitor.host?.user ? `${visitor.host.user.firstname || ''} ${visitor.host.user.lastname || ''}`.trim() : '-'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                <Link
                  to={`/security/visitors/${visitor.id}`}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <BsEye size={14} /> View
                </Link>
                <Link
                  to={`/security/visitors/${visitor.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <BiEdit size={14} /> Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {visitors.length > 0 && viewMode === 'table' && (
        <DataTable
          columns={getColumns()}
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
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Date Range</label>
            <div className="flex gap-3">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Mobile Number</label>
            <input
              type="text"
              placeholder="Enter mobile number"
              value={filters.mobile}
              onChange={(e) => setFilters({ ...filters, mobile: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: 'approve', id: null })}
        title={confirmModal.type === 'approve' ? 'Approve Visitor' : 'Reject Visitor'}
        size="sm"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmModal({ isOpen: false, type: 'approve', id: null })}
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmModal.type === 'approve' ? handleApprove : handleReject}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                confirmModal.type === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {confirmModal.type === 'approve' ? 'Approve' : 'Reject'}
            </button>
          </div>
        }
      >
        <p className="text-muted-foreground">
          Are you sure you want to {confirmModal.type} this visitor?
        </p>
      </Modal>
    </div>
  );
};

export default SecurityVisitors;
