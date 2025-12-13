import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Save, FileText, Upload } from 'lucide-react';
import Breadcrumb from '../../components/layout/Breadcrumb';
import FormInput from '../../components/ui/FormInput';
import FormGrid from '../../components/ui/FormGrid';
import { getVendors, getOtherBillsDetails, postOtherBills, editOtherBillsDetails } from '../../api';
import toast from 'react-hot-toast';

interface Vendor {
  id: number;
  name?: string;
  company_name?: string;
}

const CreateOtherBill = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEdit);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    vendor_id: '',
    bill_date: '',
    invoice_number: '',
    related_to: '',
    base_amount: '',
    deduction: '',
    deduction_remarks: '',
    amount: '',
    tds_rate: '',
    tds_amount: '',
    retention_percentage: '',
    payment_tenure: '',
    additional_expenses: '',
    cgst_rate: '',
    cgst_amount: '',
    sgst_rate: '',
    sgst_amount: '',
    igst_rate: '',
    igst_amount: '',
    tcs_rate: '',
    tcs_amount: '',
    tax_amount: '',
    total_amount: '',
    description: '',
  });

  useEffect(() => {
    fetchDropdownData();
    if (isEdit) {
      fetchBillDetails();
    }
  }, [id]);

  const fetchDropdownData = async () => {
    try {
      const vendorsRes = await getVendors();
      const vendorData = vendorsRes.data;
      setVendors(Array.isArray(vendorData) ? vendorData : (vendorData?.vendors || vendorData?.data || []));
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const fetchBillDetails = async () => {
    try {
      setFetchingData(true);
      const res = await getOtherBillsDetails(id);
      const data = res.data;

      setFormData({
        vendor_id: String(data.vendor_id || ''),
        bill_date: data.bill_date?.split('T')[0] || '',
        invoice_number: data.invoice_number || '',
        related_to: data.related_to || '',
        base_amount: String(data.base_amount || ''),
        deduction: String(data.deduction || ''),
        deduction_remarks: data.deduction_remarks || '',
        amount: String(data.amount || ''),
        tds_rate: String(data.tds_rate || data.tds_percentage || ''),
        tds_amount: String(data.tds_amount || ''),
        retention_percentage: String(data.retention_percentage || ''),
        payment_tenure: String(data.payment_tenure || ''),
        additional_expenses: String(data.additional_expenses || ''),
        cgst_rate: String(data.cgst_rate || ''),
        cgst_amount: String(data.cgst_amount || ''),
        sgst_rate: String(data.sgst_rate || ''),
        sgst_amount: String(data.sgst_amount || ''),
        igst_rate: String(data.igst_rate || ''),
        igst_amount: String(data.igst_amount || ''),
        tcs_rate: String(data.tcs_rate || ''),
        tcs_amount: String(data.tcs_amount || ''),
        tax_amount: String(data.tax_amount || ''),
        total_amount: String(data.total_amount || ''),
        description: data.description || '',
      });
    } catch (error) {
      console.error('Error fetching bill details:', error);
      toast.error('Failed to load bill details');
    } finally {
      setFetchingData(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-calculate amounts when rates change
    if (name === 'base_amount' || name === 'deduction') {
      const base = parseFloat(name === 'base_amount' ? value : formData.base_amount) || 0;
      const ded = parseFloat(name === 'deduction' ? value : formData.deduction) || 0;
      setFormData((prev) => ({ ...prev, amount: String(base - ded) }));
    }

    // Calculate TDS amount
    if (name === 'tds_rate' || name === 'amount') {
      const amt = parseFloat(name === 'amount' ? value : formData.amount) || 0;
      const rate = parseFloat(name === 'tds_rate' ? value : formData.tds_rate) || 0;
      setFormData((prev) => ({ ...prev, tds_amount: String((amt * rate / 100).toFixed(2)) }));
    }

    // Calculate CGST amount
    if (name === 'cgst_rate') {
      const amt = parseFloat(formData.amount) || 0;
      setFormData((prev) => ({ ...prev, cgst_amount: String((amt * parseFloat(value) / 100).toFixed(2)) }));
    }

    // Calculate SGST amount
    if (name === 'sgst_rate') {
      const amt = parseFloat(formData.amount) || 0;
      setFormData((prev) => ({ ...prev, sgst_amount: String((amt * parseFloat(value) / 100).toFixed(2)) }));
    }

    // Calculate IGST amount
    if (name === 'igst_rate') {
      const amt = parseFloat(formData.amount) || 0;
      setFormData((prev) => ({ ...prev, igst_amount: String((amt * parseFloat(value) / 100).toFixed(2)) }));
    }

    // Calculate TCS amount
    if (name === 'tcs_rate') {
      const amt = parseFloat(formData.amount) || 0;
      setFormData((prev) => ({ ...prev, tcs_amount: String((amt * parseFloat(value) / 100).toFixed(2)) }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vendor_id) {
      toast.error('Please select a supplier');
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          submitData.append(`other_bill[${key}]`, value);
        }
      });

      // Append attachments
      attachments.forEach((file) => {
        submitData.append('other_bill[attachments][]', file);
      });

      if (isEdit) {
        await editOtherBillsDetails(id, submitData);
        toast.success('Bill updated successfully');
      } else {
        await postOtherBills(submitData);
        toast.success('Bill created successfully');
      }
      navigate('/finance/other-bills');
    } catch (error) {
      console.error('Error saving bill:', error);
      toast.error(isEdit ? 'Failed to update bill' : 'Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Breadcrumb items={[
        { label: 'Finance', path: '/finance/cam' },
        { label: 'Other Bills', path: '/finance/other-bills' },
        { label: isEdit ? 'Edit Bill' : 'New Bill' }
      ]} />

      <div className="bg-card border border-border rounded-xl shadow-sm mt-4">
        <div className="bg-primary text-primary-foreground px-6 py-4 rounded-t-xl">
          <h1 className="text-xl font-semibold">{isEdit ? 'Edit Bill' : 'NEW BILL'}</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">Fill in the details to {isEdit ? 'update the' : 'create a new'} bill</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Details Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                <FileText className="w-4 h-4" />
              </span>
              Basic Details
            </h2>
            
            {/* Row 1 */}
            <FormGrid columns={3}>
              <FormInput
                label="Supplier"
                name="vendor_id"
                type="select"
                value={formData.vendor_id}
                onChange={handleChange}
                options={vendors.map((v) => ({ value: String(v.id), label: v.name || v.company_name || `Vendor ${v.id}` }))}
                placeholder="Select Supplier"
                required
              />
              <FormInput
                label="Bill Date"
                name="bill_date"
                type="date"
                value={formData.bill_date}
                onChange={handleChange}
                placeholder="Select Date"
              />
              <FormInput
                label="Invoice Number"
                name="invoice_number"
                type="text"
                value={formData.invoice_number}
                onChange={handleChange}
                placeholder="Enter Invoice Number"
              />
            </FormGrid>

            {/* Row 2 */}
            <FormGrid columns={3} className="mt-4">
              <FormInput
                label="Related To"
                name="related_to"
                type="text"
                value={formData.related_to}
                onChange={handleChange}
                placeholder="Enter Related To"
              />
              <FormInput
                label="Base Amount"
                name="base_amount"
                type="number"
                value={formData.base_amount}
                onChange={handleChange}
                placeholder="Enter Base Amount"
              />
              <FormInput
                label="Deduction"
                name="deduction"
                type="number"
                value={formData.deduction}
                onChange={handleChange}
                placeholder="Enter Deduction"
              />
            </FormGrid>

            {/* Row 3 */}
            <FormGrid columns={3} className="mt-4">
              <FormInput
                label="Deduction Remarks"
                name="deduction_remarks"
                type="text"
                value={formData.deduction_remarks}
                onChange={handleChange}
                placeholder="Enter Deduction Remarks"
              />
              <FormInput
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Calculated Amount"
                readOnly
              />
              <div className="grid grid-cols-2 gap-2">
                <FormInput
                  label="TDS Rate (%)"
                  name="tds_rate"
                  type="number"
                  value={formData.tds_rate}
                  onChange={handleChange}
                  placeholder="Rate"
                />
                <FormInput
                  label="TDS Amount"
                  name="tds_amount"
                  type="number"
                  value={formData.tds_amount}
                  onChange={handleChange}
                  placeholder="Amount"
                  readOnly
                />
              </div>
            </FormGrid>

            {/* Row 4 */}
            <FormGrid columns={3} className="mt-4">
              <FormInput
                label="Retention (%)"
                name="retention_percentage"
                type="number"
                value={formData.retention_percentage}
                onChange={handleChange}
                placeholder="Enter Retention %"
              />
              <FormInput
                label="Payment Tenure (in days)"
                name="payment_tenure"
                type="number"
                value={formData.payment_tenure}
                onChange={handleChange}
                placeholder="Enter Payment Tenure"
              />
              <FormInput
                label="Additional Expenses"
                name="additional_expenses"
                type="number"
                value={formData.additional_expenses}
                onChange={handleChange}
                placeholder="Enter Additional Expenses"
              />
            </FormGrid>

            {/* Row 5 - Tax Rates */}
            <FormGrid columns={3} className="mt-4">
              <div className="grid grid-cols-2 gap-2">
                <FormInput
                  label="CGST Rate (%)"
                  name="cgst_rate"
                  type="number"
                  value={formData.cgst_rate}
                  onChange={handleChange}
                  placeholder="Rate"
                />
                <FormInput
                  label="CGST Amount"
                  name="cgst_amount"
                  type="number"
                  value={formData.cgst_amount}
                  onChange={handleChange}
                  placeholder="Amount"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormInput
                  label="SGST Rate (%)"
                  name="sgst_rate"
                  type="number"
                  value={formData.sgst_rate}
                  onChange={handleChange}
                  placeholder="Rate"
                />
                <FormInput
                  label="SGST Amount"
                  name="sgst_amount"
                  type="number"
                  value={formData.sgst_amount}
                  onChange={handleChange}
                  placeholder="Amount"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormInput
                  label="IGST Rate (%)"
                  name="igst_rate"
                  type="number"
                  value={formData.igst_rate}
                  onChange={handleChange}
                  placeholder="Rate"
                />
                <FormInput
                  label="IGST Amount"
                  name="igst_amount"
                  type="number"
                  value={formData.igst_amount}
                  onChange={handleChange}
                  placeholder="Amount"
                  readOnly
                />
              </div>
            </FormGrid>

            {/* Row 6 */}
            <FormGrid columns={3} className="mt-4">
              <div className="grid grid-cols-2 gap-2">
                <FormInput
                  label="TCS Rate (%)"
                  name="tcs_rate"
                  type="number"
                  value={formData.tcs_rate}
                  onChange={handleChange}
                  placeholder="Rate"
                />
                <FormInput
                  label="TCS Amount"
                  name="tcs_amount"
                  type="number"
                  value={formData.tcs_amount}
                  onChange={handleChange}
                  placeholder="Amount"
                  readOnly
                />
              </div>
              <FormInput
                label="Tax Amount"
                name="tax_amount"
                type="number"
                value={formData.tax_amount}
                onChange={handleChange}
                placeholder="Enter Tax Amount"
              />
              <FormInput
                label="Total Amount"
                name="total_amount"
                type="number"
                value={formData.total_amount}
                onChange={handleChange}
                placeholder="Enter Total Amount"
              />
            </FormGrid>

            {/* Description */}
            <div className="mt-4">
              <FormInput
                label="Description"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description..."
                rows={4}
              />
            </div>
          </div>

          {/* Attachments Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                <Upload className="w-4 h-4" />
              </span>
              Attachments
            </h2>
            
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, JPG, PNG, XLSX</p>
              </label>
              
              {attachments.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {attachments.map((file, index) => (
                    <span key={index} className="px-3 py-1 bg-muted rounded-full text-xs text-foreground">
                      {file.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => navigate('/finance/other-bills')}
              className="px-6 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Submit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOtherBill;
