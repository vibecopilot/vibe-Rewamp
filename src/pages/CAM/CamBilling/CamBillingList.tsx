import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BsEye } from 'react-icons/bs';
import { IoAddCircleOutline } from 'react-icons/io5';
import { FaDownload, FaUpload } from 'react-icons/fa';
import { BiFilterAlt } from 'react-icons/bi';
import Table from '@/components/table/Table';
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

  const ensureArray = (data: any): CamBillingItem[] => {
    if (Array.isArray(data)) return data;
    if (data?.cam_billings) return data.cam_billings;
    if (data?.billings) return data.billings;
    if (data?.data) return Array.isArray(data.data) ? data.data : [];
    return [];
  };

  const fetchCamBilling = async () => {
    try {
      const response = await getCamBillingData();
      const dataArray = ensureArray(response.data);
      setCamBilling(dataArray);
      setFilteredData(dataArray);
    } catch (err) {
      console.error('Failed to fetch CAM Billing data:', err);
      setCamBilling([]);
      setFilteredData([]);
    }
  };

  useEffect(() => {
    fetchCamBilling();
  }, []);

  const columns = [
    {
      name: 'Action',
      cell: (row: CamBillingItem) => (
        <Link to={`/finance/cam/billing/${row.id}`}>
          <BsEye size={15} className="cursor-pointer hover:text-primary" />
        </Link>
      ),
      width: '80px',
    },
    { name: 'Flat', selector: (row: CamBillingItem) => row.flat_id, sortable: true },
    { name: 'Start Date', selector: (row: CamBillingItem) => row.bill_period_start_date, sortable: true },
    { name: 'End Date', selector: (row: CamBillingItem) => row.bill_period_end_date, sortable: true },
    { name: 'Amount', selector: (row: CamBillingItem) => row.total_amount, sortable: true },
    { name: 'Due Date', selector: (row: CamBillingItem) => row.due_date, sortable: true },
    { name: 'Invoice No.', selector: (row: CamBillingItem) => row.invoice_number, sortable: true },
    { name: 'Amount Paid', selector: (row: CamBillingItem) => row.amount_paid, sortable: true },
    {
      name: 'Payment Status',
      cell: (row: CamBillingItem) => {
        if (row.status === 'pending' || row.status === 'recall' || row.status === null) {
          return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Unpaid</span>;
        }
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Paid</span>;
      },
      sortable: true,
    },
    { name: 'Recall', selector: (row: CamBillingItem) => row.status, sortable: true },
    { name: 'Created On', selector: (row: CamBillingItem) => row.created_at, sortable: true },
  ];

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    setBillingPeriod(dates);
  };

  const handleSelectedRows = (rows: CamBillingItem[]) => {
    const selectedId = rows.map((row) => row.id);
    setSelectedRows(selectedId);
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
      setFilteredData(ensureArray(resp.data));
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

  const isFlatDisabled = !formData.block || !formData.floor_name || !units.length;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <input
          type="text"
          onChange={handleSearch}
          value={searchText}
          placeholder="Search By Invoice No, Payment Status"
          className="p-2 md:w-96 border border-gray-300 rounded-md placeholder:text-sm outline-none"
        />
        <div className="flex flex-wrap gap-2">
          <Link
            to="/finance/cam/billing/add"
            style={{ background: themeColor }}
            className="px-4 py-2 font-medium text-white rounded-md flex gap-2 items-center justify-center"
          >
            <IoAddCircleOutline />
            Add
          </Link>
          <button
            className="font-semibold text-white px-4 py-2 flex gap-2 items-center justify-center rounded-md"
            style={{ background: themeColor }}
            onClick={() => setImportModal(true)}
          >
            <FaUpload />
            Import
          </button>
          <button
            className="font-semibold text-white px-4 py-2 flex gap-2 items-center justify-center rounded-md"
            style={{ background: themeColor }}
            onClick={handleDownload}
          >
            <FaDownload />
            Export
          </button>
          <button
            className="font-semibold text-white px-4 py-2 flex gap-2 items-center justify-center rounded-md"
            style={{ background: themeColor }}
            onClick={() => setFilter(!filter)}
          >
            <BiFilterAlt />
            Filter
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {filter && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-100 rounded-lg">
          <select
            className="border p-2 px-4 border-gray-500 rounded-md"
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
            className="border p-2 px-4 border-gray-500 rounded-md"
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
            className="border p-2 px-4 border-gray-500 rounded-md"
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
            className="border p-2 px-4 border-gray-500 rounded-md"
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
            className="border p-2 px-4 border-gray-500 rounded-md"
          />
          <DatePicker
            selectsRange
            startDate={billingPeriod[0]}
            endDate={billingPeriod[1]}
            onChange={handleDateChange}
            placeholderText="Select Billing Period"
            className="border p-2 px-4 border-gray-500 rounded-md"
            isClearable
          />
          <button
            onClick={handleFilterData}
            className="p-2 px-4 text-white rounded-md"
            style={{ background: themeColor }}
          >
            Apply
          </button>
          <button
            className="bg-red-400 p-2 px-4 text-white rounded-md"
            onClick={() => { fetchCamBilling(); setFilter(false); }}
          >
            Reset
          </button>
        </div>
      )}

      {/* Table */}
      <Table
        columns={columns}
        data={filteredData}
        selectableRow={true}
        onSelectedRows={handleSelectedRows}
      />

      {importModal && (
        <InvoiceImportModal onclose={() => setImportModal(false)} fetchCamBilling={fetchCamBilling} />
      )}
    </div>
  );
};

export default CamBillingList;
