import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Eye, Plus, Upload, Download, Filter, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getInvoiceReceipt,
  getFloors,
  getUnits,
  getReceiptInvoiceCamDownload,
  gatReceiptInvoiceFilter,
  downloadReceiptInvoice,
} from '@/api';
import toast from 'react-hot-toast';
import { getItemInLocalStorage } from '@/utils/localStorage';
import ReceiptInvoiceModal from '@/containers/modals/ReceiptInvoiceModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

interface ReceiptItem {
  id: number;
  receipt_number: string;
  invoice_number: string;
  building?: { name: string };
  unit?: { name: string };
  amount_received: number;
  payment_mode: string;
  transaction_or_cheque_number: string;
  payment_date: string;
  receipt_date: string;
}

const ReceiptInvoiceList: React.FC = () => {
  const themeColor = useSelector((state: any) => state.theme.color);
  const navigate = useNavigate();
  const [invoiceReceipt, setInvoiceReceipt] = useState<ReceiptItem[]>([]);
  const [filter, setFilter] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterSearchData, setFilterSearchData] = useState<ReceiptItem[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const buildings = getItemInLocalStorage('Building') || [];
  const [floors, setFloors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    block: '',
    floor_name: '',
    flat: '',
    invoiceNumber: '',
    receiptNumber: '',
    receiptDate: '',
  });

  const fetchInvoiceReceipt = async () => {
    setLoading(true);
    try {
      const response = await getInvoiceReceipt();
      setInvoiceReceipt(response.data);
      setFilterSearchData(response.data);
    } catch (err) {
      console.error('Failed to fetch Receipt Invoice data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceReceipt();
  }, []);

  const handleDownloadReceipt = async (id: number) => {
    try {
      const response = await downloadReceiptInvoice(id);
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: response.headers['content-type'] })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'receipt_invoice_file.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      toast.error('Error downloading receipt');
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
      const resp = await gatReceiptInvoiceFilter(
        formData.block,
        formData.floor_name,
        formData.flat,
        formData.invoiceNumber,
        formData.receiptNumber,
        formData.receiptDate
      );
      setFilterSearchData(resp.data);
      setFilter(false);
    } catch (error) {
      console.error('Error filtering data:', error);
    }
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
      setSelectedRows(filterSearchData.map((item) => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleDownload = async () => {
    if (selectedRows.length === 0) {
      return toast.error('Please select at least one record.');
    }
    toast.loading('Downloading Receipt Invoice...');
    try {
      const response = await getReceiptInvoiceCamDownload(selectedRows);
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: response.headers['content-type'] })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'receipt_invoice_file.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss();
      toast.success('Receipt Invoice downloaded successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Something went wrong, please try again');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearchText(searchValue);
    if (searchValue.trim() === '') {
      setFilterSearchData(invoiceReceipt);
    } else {
      const filterResult = invoiceReceipt.filter(
        (item) =>
          item?.invoice_number?.toLowerCase().includes(searchValue.toLowerCase()) ||
          item?.receipt_number?.toLowerCase().includes(searchValue.toLowerCase()) ||
          item?.payment_mode?.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilterSearchData(filterResult);
    }
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
          placeholder="Search By Invoice No, Receipt No, Payment Mode"
          className="md:w-96"
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate('/finance/cam/receipt-invoice/add')} style={{ background: themeColor }}>
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
          <Input
            type="text"
            name="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={handleChange}
            placeholder="Invoice Number"
            className="w-40"
          />
          <Input
            type="text"
            name="receiptNumber"
            value={formData.receiptNumber}
            onChange={handleChange}
            placeholder="Receipt Number"
            className="w-40"
          />
          <input
            type="date"
            name="receiptDate"
            value={formData.receiptDate}
            onChange={handleChange}
            className="border p-2 px-4 border-border rounded-md bg-background"
          />
          <Button onClick={handleFilterData} style={{ background: themeColor }}>Apply</Button>
          <Button variant="destructive" onClick={() => { fetchInvoiceReceipt(); setFilter(false); }}>Reset</Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.length === filterSearchData.length && filterSearchData.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Receipt No</TableHead>
              <TableHead>Invoice No</TableHead>
              <TableHead>Block</TableHead>
              <TableHead>Flat</TableHead>
              <TableHead>Amount Received</TableHead>
              <TableHead>Payment Mode</TableHead>
              <TableHead>Transaction No</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>Receipt Date</TableHead>
              <TableHead>Attachments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : filterSearchData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8">No records found</TableCell>
              </TableRow>
            ) : (
              filterSearchData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(row.id)}
                      onCheckedChange={(checked) => handleSelectedRows(row.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <Link to={`/finance/cam/receipt-invoice/${row.id}`}>
                      <Eye className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
                    </Link>
                  </TableCell>
                  <TableCell>{row.receipt_number}</TableCell>
                  <TableCell>{row.invoice_number}</TableCell>
                  <TableCell>{row.building?.name || 'N/A'}</TableCell>
                  <TableCell>{row.unit?.name || 'N/A'}</TableCell>
                  <TableCell>{row.amount_received}</TableCell>
                  <TableCell>{row.payment_mode}</TableCell>
                  <TableCell>{row.transaction_or_cheque_number}</TableCell>
                  <TableCell>{row.payment_date}</TableCell>
                  <TableCell>{row.receipt_date}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => handleDownloadReceipt(row.id)}>
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {importModal && (
        <ReceiptInvoiceModal onclose={() => setImportModal(false)} fetchInvoiceReceipt={fetchInvoiceReceipt} />
      )}
    </div>
  );
};

export default ReceiptInvoiceList;
