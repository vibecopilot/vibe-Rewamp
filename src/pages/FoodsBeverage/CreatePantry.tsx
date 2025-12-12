import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ChevronLeft, Save, X } from 'lucide-react';
import { postPantry } from '../../api';
import { getItemInLocalStorage } from '../../utils/localStorage';
import toast from 'react-hot-toast';
import FileInputBox from '../../containers/Inputs/FileInputBox';

const CreatePantry: React.FC = () => {
  const navigate = useNavigate();
  const userId = getItemInLocalStorage('UserId');

  const [formData, setFormData] = useState({
    item_name: '',
    stock: '',
    description: '',
    attachfiles: [] as File[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (files: File[], fieldName: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: files }));
  };

  const handleSubmit = async () => {
    if (!formData.item_name) return toast.error('Item Name is required');
    if (!formData.stock) return toast.error('Stock is required');

    const sendData = new FormData();
    sendData.append('pantry[item_name]', formData.item_name);
    sendData.append('pantry[created_by_id]', userId || '');
    sendData.append('pantry[stock]', formData.stock);
    sendData.append('pantry[description]', formData.description);

    formData.attachfiles.forEach(file => {
      sendData.append('attachfiles[]', file);
    });

    try {
      await postPantry(sendData);
      toast.success('Pantry item created successfully');
      navigate('/fb/pantry');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create pantry item');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <button onClick={() => navigate('/fb/pantry')} className="flex items-center gap-1 hover:text-foreground">
          <ChevronLeft className="w-4 h-4" />
          Pantry Management
        </button>
        <span>/</span>
        <span className="text-foreground">Add New Item</span>
      </div>

      {/* Form Section */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Add New Pantry Item</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="item_name"
              value={formData.item_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Enter Item Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Stock <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Enter Stock"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Enter Description"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Upload Image</label>
          <FileInputBox
            handleChange={(files) => handleFileChange(files, 'attachfiles')}
            fieldName="attachfiles"
            isMulti={true}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            onClick={() => navigate('/fb/pantry')}
            className="px-6 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePantry;
