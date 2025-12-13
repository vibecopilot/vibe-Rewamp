import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Eye, Plus, Upload, Download, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getCamBillingData,
  getCamBillingDownload,
  getFloors,
  getUnits,
  gatCamBillFilter,
} from '@/api';
import toast from 'react-hot-toast';
import { getItemInLocalStorage } from '@/utils/localStorage';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import InvoiceImportModal from '@/containers/modals/InvoiceImportModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

interface CamBillingItem {
  id: number;
  flat_id: string;
  bill_period_start_date: string;
  bill_period_end_date: string;
  total_amount: number;
  due_date: string;
  invoice_number: string;
  amount_paid: number;
  payment_status: string;
  status: string;
  created_at: string;
}

const CamBillingList: React.FC = () => {
  const themeColor = useSelector((state: any) => state.theme.color);
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<[Date | null, Date | null]>([null, null]);
  const [importModal, setImportModal] = useState(false);
  const [filter, setFilter] = useState(false);
  const [camBilling, setCamBilling] = useState<CamBillingItem[]>([]);
  const [filteredData, setFilteredData] = useState<CamBillingItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  
  const buildings = getItemInLocalStorage('Building') || [];
  const [floors, setFloors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    block: '',
    floor_name: '',
    flat: '',
    status: '',
    dueDate: '',
  });

  const fetchCamBilling = async () => {
    setLoading(true);
    try {
      const response = await getCamBillingData();
      setCamBilling(response.data);
      setFilteredData(response.data);
    } catch (err) {
      console.error('Failed to fetch CAM Billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamBilling();
  }, []);

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    setBillingPeriod(dates);
  };

  const handleSelectedRows = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredData.map((item) => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleDownload = async () => {
    if (selectedRows.length === 0) {
      return toast.error('Please select at least one record.');
    }
    toast.loading('Downloading CAM Billing Invoice...');
    try {
      const response = await getCamBillingDownload(selectedRows);
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: response.headers['content-type'] })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cam_invoice_file.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss();
      toast.success('CAM Billing Invoice downloaded successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Something went wrong, please try again');
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'block') {
      try {
        const response = await getFloors(Number(value));
        setFloors(response.data.map((item: any) => ({ name: item.name, id: item.id })));
      } catch (error) {
        console.error('Error fetching floors:', error);
      }
      setFormData((prev) => ({ ...prev, block: value, floor_name: '', flat: '' }));
    } else if (name === 'floor_name') {
      try {
        const response = await getUnits(Number(value));
        setUnits(response.data.map((item: any) => ({ name: item.name, id: item.id })));
      } catch (error) {
        console.error('Error fetching units:', error);
      }
      setFormData((prev) => ({ ...prev, floor_name: value, flat: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFilterData = async () => {
    try {
      const [startDate, endDate] = billingPeriod;
      const resp = await gatCamBillFilter(
        formData.block,
        formData.floor_name,
        formData.flat,
        formData.status,
        startDate,
        endDate,
        formData.dueDate
      );
      setFilteredData(resp.data);
      setFilter(false);
    } catch (error) {
      console.error('Error filtering data:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearchText(searchValue);
    if (searchValue.trim() === '') {
      setFilteredData(camBilling);
    } else {
      const filterResult = camBilling.filter(
        (item) =>
          item?.invoice_number?.toLowerCase().includes(searchValue.toLowerCase()) ||
          item?.status?.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredData(filterResult);
    }
  };

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (status === 'pending' || status === 'recall' || status === null) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Unpaid</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Paid</span>;
  };

  const isFlatDisabled = !formData.block || !formData.floor_name || !units.length;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Input
          type="text"
          onChange={handleSearch}
          value={searchText}
          placeholder="Search By Invoice No, Payment Status"
          className="md:w-96"
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate('/finance/cam/billing/add')} style={{ background: themeColor }}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
          <Button onClick={() => setImportModal(true)} style={{ background: themeColor }}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={handleDownload} style={{ background: themeColor }}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setFilter(!filter)} style={{ background: themeColor }}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {filter && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <select
            className="border p-2 px-4 border-border rounded-md bg-background"
            onChange={handleChange}
            value={formData.block}
            name="block"
          >
            <option value="">Select Building</option>
            {buildings?.map((building: any) => (
              <option key={building.id} value={building.id}>{building.name}</option>
            ))}
          </select>
          <select
            className="border p-2 px-4 border-border rounded-md bg-background"
            onChange={handleChange}
            value={formData.floor_name}
            name="floor_name"
            disabled={!floors.length}
          >
            <option value="">Select Floor</option>
            {floors.map((floor) => (
              <option key={floor.id} value={floor.id}>{floor.name}</option>
            ))}
          </select>
          <select
            name="flat"
            value={formData.flat}
            onChange={handleChange}
            disabled={isFlatDisabled}
            className="border p-2 px-4 border-border rounded-md bg-background"
          >
            <option value="">Select Flat</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>{unit.name}</option>
            ))}
          </select>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="border p-2 px-4 border-border rounded-md bg-background"
          >
            <option value="">Select Payment Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="Partially Paid">Partially Paid</option>
          </select>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="border p-2 px-4 border-border rounded-md bg-background"
          />
          <DatePicker
            selectsRange
            startDate={billingPeriod[0]}
            endDate={billingPeriod[1]}
            onChange={handleDateChange}
            placeholderText="Select Billing Period"
            className="border p-2 px-4 border-border rounded-md bg-background"
            isClearable
          />
          <Button onClick={handleFilterData} style={{ background: themeColor }}>Apply</Button>
          <Button variant="destructive" onClick={() => { fetchCamBilling(); setFilter(false); }}>Reset</Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Flat</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Invoice No</TableHead>
              <TableHead>Amount Paid</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Recall</TableHead>
              <TableHead>Created On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8">No records found</TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(row.id)}
                      onCheckedChange={(checked) => handleSelectedRows(row.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <Link to={`/finance/cam/billing/${row.id}`}>
                      <Eye className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
                    </Link>
                  </TableCell>
                  <TableCell>{row.flat_id}</TableCell>
                  <TableCell>{row.bill_period_start_date}</TableCell>
                  <TableCell>{row.bill_period_end_date}</TableCell>
                  <TableCell>{row.total_amount}</TableCell>
                  <TableCell>{row.due_date}</TableCell>
                  <TableCell>{row.invoice_number}</TableCell>
                  <TableCell>{row.amount_paid}</TableCell>
                  <TableCell>{getStatusBadge(row.status, row.payment_status)}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.created_at}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {importModal && (
        <InvoiceImportModal onclose={() => setImportModal(false)} fetchCamBilling={fetchCamBilling} />
      )}
    </div>
  );
};

export default CamBillingList;
