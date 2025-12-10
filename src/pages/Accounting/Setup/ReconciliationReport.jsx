import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axiosInstance';
import { FaDownload, FaFileExcel, FaChartBar } from 'react-icons/fa';

const ReconciliationReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({
    from_date: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1).toISOString().split('T')[0],
    to_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReconciliationReport();
  }, [dateRange]);

  const fetchReconciliationReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(dateRange).toString();
      const response = await axiosInstance.get(`/income_entries/reconciliation_report.json?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('api_key')}`
        }
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching reconciliation report:', error);
      toast.error('Failed to fetch reconciliation report');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    toast.info('Export functionality coming soon');
  };

  if (loading && !reportData) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">CAM Bill Reconciliation Report</h2>
        <p className="text-gray-600 mt-1">Compare CAM bills raised vs income received</p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateRange.from_date}
              onChange={(e) => setDateRange({ ...dateRange, from_date: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateRange.to_date}
              onChange={(e) => setDateRange({ ...dateRange, to_date: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <FaFileExcel /> Export to Excel
          </button>
        </div>
      </div>

      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-gray-600 text-sm">Total CAM Bills Raised</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{reportData.summary.total_cam_bills_raised.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-gray-600 text-sm">With Interest</p>
              <p className="text-2xl font-bold text-purple-600">
                ₹{reportData.summary.total_with_interest.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-gray-600 text-sm">Income Received</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{reportData.summary.cam_bill_income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-gray-600 text-sm">Outstanding</p>
              <p className="text-2xl font-bold text-red-600">
                ₹{reportData.summary.outstanding_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Collection Percentage */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Collection Efficiency</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative pt-1">
                  <div className="overflow-hidden h-4 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${reportData.summary.collection_percentage}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                    ></div>
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {reportData.summary.collection_percentage}%
              </div>
            </div>
          </div>

          {/* Monthly Report */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Billed</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">With Interest</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Received</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Collection %</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.monthly_report.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        ₹{row.billed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-purple-600">
                        ₹{row.billed_with_interest.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                        ₹{row.received.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                        ₹{row.outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className={`font-semibold ${
                          row.billed_with_interest > 0 
                            ? ((row.received / row.billed_with_interest) * 100) >= 80 
                              ? 'text-green-600' 
                              : 'text-orange-600'
                            : 'text-gray-600'
                        }`}>
                          {row.billed_with_interest > 0 
                            ? ((row.received / row.billed_with_interest) * 100).toFixed(2)
                            : 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Mode Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Payment Mode Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(reportData.payment_modes).map(([mode, amount]) => (
                <div key={mode} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm uppercase">{mode}</p>
                  <p className="text-lg font-bold text-gray-800">
                    ₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Unit-wise Outstanding */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Outstanding Units</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Billed</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Received</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.unit_outstanding.slice(0, 10).map((unit) => (
                    <tr key={unit.unit_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {unit.unit_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {unit.owner_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        ₹{unit.total_billed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                        ₹{unit.total_received.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-red-600">
                        ₹{unit.outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReconciliationReport;
