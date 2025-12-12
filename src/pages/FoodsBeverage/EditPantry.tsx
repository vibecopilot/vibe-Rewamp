import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Package, ChevronLeft, Save, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { getPantryDetails, postPantry } from '../../api';
import { getItemInLocalStorage } from '../../utils/localStorage';
import FileInputBox from '../../containers/Inputs/FileInputBox';
import toast from 'react-hot-toast';

interface PantryFormData {
  item_name: string;
  stock: string;
  description: string;
  attachfiles: File[];
}

const EditPantry: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = getItemInLocalStorage('UserId');

  const [formData, setFormData] = useState<PantryFormData>({
    item_name: '',
    stock: '',
    description: '',
    attachfiles: [],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPantryItem = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getPantryDetails(id);
      const item = response.data;
      setFormData({
        item_name: item.item_name || '',
        stock: String(item.stock || ''),
        description: item.description || '',
        attachfiles: [],
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pantry item';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPantryItem();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (files: File[]) => {
    setFormData(prev => ({ ...prev, attachfiles: files }));
  };

  const handleSubmit = async () => {
    if (!formData.item_name.trim()) {
      toast.error('Please enter item name');
      return;
    }

    if (!formData.stock.trim()) {
      toast.error('Please enter stock');
      return;
    }

    setSubmitting(true);
    const sendData = new FormData();
    sendData.append('pantry[item_name]', formData.item_name);
    sendData.append('pantry[created_by_id]', userId);
    sendData.append('pantry[stock]', formData.stock);
    sendData.append('pantry[description]', formData.description);

    formData.attachfiles.forEach((file) => {
      sendData.append('attachfiles[]', file);
    });

    try {
      await postPantry(sendData);
      toast.success('Pantry item updated successfully');
      navigate('/fb/pantry');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update pantry item');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading pantry item...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Pantry Item</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={fetchPantryItem}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/fb/pantry" className="hover:text-primary">Pantry Management</Link>
        <span>/</span>
        <span className="text-foreground">Edit Item</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Package className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Edit Pantry Item</h1>
          <p className="text-sm text-muted-foreground">Update pantry item details</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="item_name"
              value={formData.item_name}
              onChange={handleChange}
              placeholder="Enter Item Name"
              className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Stock <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Enter Stock"
              className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <label className="text-sm font-medium text-foreground">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Enter description"
            className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div className="mt-6 space-y-2">
          <label className="text-sm font-medium text-foreground">Upload Image</label>
          <FileInputBox
            handleChange={handleFileChange}
            fieldName="attachfiles"
            isMulti={true}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
          <button
            type="button"
            onClick={() => navigate('/fb/pantry')}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPantry;
