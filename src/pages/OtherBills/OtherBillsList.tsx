import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, Edit, DollarSign, FileText, CheckCircle, Clock } from 'lucide-react';
import Breadcrumb from '../../components/layout/Breadcrumb';
import ListToolbar from '../../components/ui/ListToolbar';
import { getOtherBills } from '../../api';
import { dateFormatSTD } from '../../utils/dateUtils';

interface OtherBill {
  id: number;
  description?: string;
  supplier_name?: string;
  vendor_name?: string;
  last_approved_by?: string;
  total_amount?: number;
  deduction?: number;
  tds_percentage?: number;
  tds_amount?: number;
  retention_percentage?: number;
  retention_amount?: number;
  payable_amount?: number;
  bill_date?: string;
  invoice_number?: string;
  gst_number?: string;
  pan_number?: string;
  payment_tenure?: number;
  amount_paid?: number;
  balance_amount?: number;
  payment_status?: string;
  created_at?: string;
  created_by_name?: string;
}

interface BillStats {
  totalBills: number;
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
}

const OtherBillsList = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [bills, setBills] = useState<OtherBill[]>([]);
  const [filteredBills, setFilteredBills] = useState<OtherBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState<BillStats>({
    totalBills: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalPending: 0,
  });

  const recordsPerPage = viewMode === 'grid' ? 12 : 10;

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    filterBills();
  }, [searchValue, dateFilter, bills]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await getOtherBills();
      const data = res.data;
      const billArray = Array.isArray(data) ? data : (data?.other_bills || data?.bills || data?.data || []);
      setBills(billArray);
      
      // Calculate stats
      const newStats: BillStats = {
        totalBills: billArray.length,
        totalAmount: 0,
        totalPaid: 0,
        totalPending: 0,
      };
      
      billArray.forEach((bill: OtherBill) => {
        const total = Number(bill.total_amount) || 0;
        const paid = Number(bill.amount_paid) || 0;
        newStats.totalAmount += total;
        newStats.totalPaid += paid;
        newStats.totalPending += (total - paid);
      });
      
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching other bills:', error);
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBills = () => {
    let filtered = [...bills];
    
    // Apply search filter
    if (searchValue) {
      filtered = filtered.filter(
        (bill) =>
          bill.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
          bill.supplier_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
          bill.vendor_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
          bill.invoice_number?.toLowerCase().includes(searchValue.toLowerCase()) ||
          String(bill.id).includes(searchValue)
      );
    }
    
    // Apply date filter
    if (dateFilter) {
      filtered = filtered.filter(
        (bill) => bill.bill_date?.split('T')[0] === dateFilter
      );
    }
    
    setFilteredBills(filtered);
    setCurrentPage(1);
  };

  const paginatedData = filteredBills.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const totalPages = Math.ceil(filteredBills.length / recordsPerPage);

  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getStatusColor = (status?: string) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('paid') || s.includes('completed')) return 'bg-green-100 text-green-700 border-green-200';
    if (s.includes('partial')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (s.includes('pending') || s.includes('unpaid')) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const STAT_CARDS = [
    { label: 'Total Bills', value: stats.totalBills, icon: FileText, color: 'bg-blue-500' },
    { label: 'Total Amount', value: formatCurrency(stats.totalAmount), icon: DollarSign, color: 'bg-purple-500' },
    { label: 'Total Paid', value: formatCurrency(stats.totalPaid), icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Total Pending', value: formatCurrency(stats.totalPending), icon: Clock, color: 'bg-orange-500' },
  ];

  return (
    <div className="p-6">
      <Breadcrumb items={[
        { label: 'Finance', path: '/finance/cam' },
        { label: 'Other Bills' }
      ]} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-4">
        {STAT_CARDS.map((stat, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-bold text-foreground">
                {typeof stat.value === 'number' ? stat.value : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <ListToolbar
            searchPlaceholder="Search by description, supplier..."
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onFilter={() => {}}
            onExport={() => {}}
            onAdd={() => navigate('/finance/other-bills/create')}
            addLabel="Add"
          />
        </div>
        <div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Filter by Bill Date"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedData.map((bill) => (
            <div
              key={bill.id}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">#{bill.id}</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(bill.payment_status)}`}>
                  {bill.payment_status || 'Pending'}
                </span>
              </div>
              
              <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">
                {bill.description || 'No Description'}
              </h3>
              
              <div className="space-y-1 text-xs text-muted-foreground mb-4">
                <p><span className="font-medium">Supplier:</span> {bill.supplier_name || bill.vendor_name || '-'}</p>
                <p><span className="font-medium">Invoice:</span> {bill.invoice_number || '-'}</p>
                <p><span className="font-medium">Total:</span> {formatCurrency(bill.total_amount)}</p>
                <p><span className="font-medium">Payable:</span> {formatCurrency(bill.payable_amount)}</p>
                <p><span className="font-medium">Bill Date:</span> {bill.bill_date ? dateFormatSTD(bill.bill_date) : '-'}</p>
              </div>
              
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Link
                  to={`/finance/other-bills/${bill.id}`}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <Eye className="w-4 h-4 text-primary" />
                </Link>
                <Link
                  to={`/finance/other-bills/${bill.id}/edit`}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <Edit className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[2000px]">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">View</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">Last Approved By</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">Total Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">Deduction</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">TDS(%)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">TDS Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">Retention(%)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">Retention Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">Payable Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">Bill Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">Invoice Number</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">GST Number</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">PAN Number</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">Payment Tenure</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">Amount Paid</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">Balance Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">Payment Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">Created On</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">Created By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedData.map((bill) => (
                  <tr key={bill.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link to={`/finance/other-bills/${bill.id}`}>
                          <Eye className="w-4 h-4 text-primary hover:text-primary/80" />
                        </Link>
                        <Link to={`/finance/other-bills/${bill.id}/edit`}>
                          <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{bill.id}</td>
                    <td className="px-4 py-3 text-sm text-foreground max-w-[200px] truncate">{bill.description || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{bill.supplier_name || bill.vendor_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{bill.last_approved_by || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{formatCurrency(bill.total_amount)}</td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{formatCurrency(bill.deduction)}</td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{bill.tds_percentage ?? '-'}%</td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{formatCurrency(bill.tds_amount)}</td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{bill.retention_percentage ?? '-'}%</td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{formatCurrency(bill.retention_amount)}</td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{formatCurrency(bill.payable_amount)}</td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{bill.bill_date ? dateFormatSTD(bill.bill_date) : '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{bill.invoice_number || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{bill.gst_number || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{bill.pan_number || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{bill.payment_tenure ?? '-'} days</td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{formatCurrency(bill.amount_paid)}</td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{formatCurrency(bill.balance_amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border whitespace-nowrap ${getStatusColor(bill.payment_status)}`}>
                        {bill.payment_status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{bill.created_at ? dateFormatSTD(bill.created_at) : '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{bill.created_by_name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, filteredBills.length)} of {filteredBills.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border hover:bg-muted'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {!loading && paginatedData.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No bills found</p>
        </div>
      )}
    </div>
  );
};

export default OtherBillsList;
