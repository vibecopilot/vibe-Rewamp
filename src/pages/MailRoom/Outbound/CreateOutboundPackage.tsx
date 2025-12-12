import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/layout/PageHeader';
import { getVendors, createOutbound, getOutboundDetail, editOutbound } from '../../../api';
import { stateCityModal } from '../../../utils/stateCityModal';

const CreateOutboundPackage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState({ vendor_id: '', sending_date: '', recipient_name: '', recipient_email_id: '', sender_id: '', mobile_number: '', awb_number: '', entity: '', unit: '', company: '', company_address_1: '', company_address_2: '', state: '', city: '', mail_outbound_type: '' });
  const [vendors, setVendors] = useState<{id: number; vendor_name: string}[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getVendors().then(res => setVendors(res.data || []));
    if (isEditMode && id) getOutboundDetail(id).then(res => { const p = res.data; setFormData({ vendor_id: p.vendor_id?.toString() || '', sending_date: p.sending_date?.split('T')[0] || '', recipient_name: p.recipient_name || '', recipient_email_id: p.recipient_email_id || '', sender_id: p.sender_id || '', mobile_number: p.mobile_number || '', awb_number: p.awb_number || '', entity: p.entity || '', unit: p.unit || '', company: p.company || '', company_address_1: p.company_address_1 || '', company_address_2: p.company_address_2 || '', state: p.state || '', city: p.city || '', mail_outbound_type: p.mail_outbound_type || '' }); });
  }, [id, isEditMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value, ...(e.target.name === 'state' ? { city: '' } : {}) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { isEditMode ? await editOutbound(id, formData) : await createOutbound(formData); toast.success(isEditMode ? 'Updated' : 'Created'); navigate('/mail-room/outbound'); }
    catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  return (
    <div className="p-6">
      <PageHeader title={isEditMode ? 'Edit Outbound Package' : 'Create Outbound Package'} breadcrumbs={[{ label: 'FM Module', path: '/mail-room' }, { label: 'Mail Room', path: '/mail-room' }, { label: 'Outbound', path: '/mail-room/outbound' }, { label: isEditMode ? 'Edit' : 'Create' }]} />
      <form onSubmit={handleSubmit}>
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-foreground mb-2">Select Vendor *</label><select name="vendor_id" value={formData.vendor_id} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground"><option value="">Select</option>{vendors.map(v => <option key={v.id} value={v.id}>{v.vendor_name}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-foreground mb-2">Sending Date *</label><input type="date" name="sending_date" value={formData.sending_date} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground" /></div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-primary/10 rounded-lg"><Package className="w-5 h-5 text-primary" /></div><h2 className="text-lg font-semibold text-foreground">Package Details</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[['sender_id', 'Sender Id'], ['recipient_name', 'Recipient Name'], ['recipient_email_id', 'Recipient Email'], ['entity', 'Entity'], ['unit', 'Unit'], ['mobile_number', 'Mobile'], ['awb_number', 'AWB Number'], ['company', 'Company'], ['company_address_1', 'Address Line 1'], ['company_address_2', 'Address Line 2'], ['mail_outbound_type', 'Package Type']].map(([name, label]) => (
              <div key={name}><label className="block text-sm font-medium text-foreground mb-2">{label}</label><input type="text" name={name} value={(formData as any)[name]} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground" /></div>
            ))}
            <div><label className="block text-sm font-medium text-foreground mb-2">State</label><select name="state" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground"><option value="">Select</option>{Object.keys(stateCityModal).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-foreground mb-2">City</label><select name="city" value={formData.city} onChange={handleInputChange} disabled={!formData.state} className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground"><option value="">Select</option>{formData.state && (stateCityModal as any)[formData.state]?.map((c: string) => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <button type="button" onClick={() => navigate('/mail-room/outbound')} className="px-6 py-2.5 border border-border text-foreground rounded-lg hover:bg-accent">Go Back</button>
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">{loading ? 'Saving...' : 'Create Package'}</button>
        </div>
      </form>
    </div>
  );
};
export default CreateOutboundPackage;
