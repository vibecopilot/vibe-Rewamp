import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Navigation, FileText, Clock, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  instructions: string;
  deliveryTime: 'asap' | 'scheduled';
  scheduledTime: string;
}

interface RecentCustomer {
  id: number;
  name: string;
  phone: string;
  address: string;
}

const recentCustomers: RecentCustomer[] = [
  { id: 1, name: 'Rahul Sharma', phone: '9876543210', address: '123, Green Apartments, MG Road' },
  { id: 2, name: 'Priya Patel', phone: '8765432109', address: '45, Silver Heights, Park Street' },
  { id: 3, name: 'Amit Kumar', phone: '7654321098', address: '78, Blue Residency, Lake View' },
];

interface FBOrderDeliveryProps {
  onStartOrder?: (customerName: string) => void;
  onCancel?: () => void;
}

const FBOrderDelivery: React.FC<FBOrderDeliveryProps> = ({ onStartOrder, onCancel }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [formData, setFormData] = useState<CustomerDetails>({
    name: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    instructions: '',
    deliveryTime: 'asap',
    scheduledTime: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({});

  const handleInputChange = (field: keyof CustomerDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerDetails, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address Line 1 is required';
    }

    if (!formData.addressLine2.trim()) {
      newErrors.addressLine2 = 'Address Line 2 is required';
    }

    if (formData.deliveryTime === 'scheduled' && !formData.scheduledTime) {
      newErrors.scheduledTime = 'Please select a delivery time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartOrder = () => {
    if (validateForm()) {
      toast.success(`Delivery order started for ${formData.name}`);
      onStartOrder?.(formData.name);
    } else {
      toast.error('Please fill all required fields');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      instructions: '',
      deliveryTime: 'asap',
      scheduledTime: '',
    });
    setErrors({});
    toast('Order cancelled', { icon: '❌' });
    onCancel?.();
  };

  const handleSearchCustomer = (customer: RecentCustomer) => {
    setFormData(prev => ({
      ...prev,
      name: customer.name,
      phone: customer.phone,
      addressLine1: customer.address,
    }));
    setSearchQuery('');
    setShowSearchDropdown(false);
    toast.success(`Customer details loaded for ${customer.name}`);
  };

  const filteredCustomers = recentCustomers.filter(
    c => c.phone.includes(searchQuery) || c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-background min-h-[600px] flex justify-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <MapPin className="w-7 h-7 text-primary" />
            Delivery Order
          </h2>
          <p className="text-muted-foreground mt-2">Enter customer details to start delivery order</p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-xl shadow-lg p-8">
          {/* Customer Search */}
          <div className="mb-6 relative">
            <label className="block text-sm font-medium text-foreground mb-2">Quick Customer Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search existing customer by phone or name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(e.target.value.length > 0);
                }}
                onFocus={() => setShowSearchDropdown(searchQuery.length > 0)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map(customer => (
                    <button
                      key={customer.id}
                      onClick={() => handleSearchCustomer(customer)}
                      className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border last:border-b-0"
                    >
                      <div className="font-medium text-foreground">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">{customer.phone} • {customer.address}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-muted-foreground text-center">
                    No customer found - New Customer
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-border my-6"></div>

          {/* Form Fields */}
          <div className="space-y-5">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Enter customer name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.name ? 'border-red-500' : 'border-border'
                  }`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.phone ? 'border-red-500' : 'border-border'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Enter email (optional)"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Address Line 1 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Delivery Address Line 1 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="House No., Building Name"
                  value={formData.addressLine1}
                  onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.addressLine1 ? 'border-red-500' : 'border-border'
                  }`}
                />
              </div>
              {errors.addressLine1 && <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>}
            </div>

            {/* Address Line 2 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Delivery Address Line 2 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Street, Area"
                value={formData.addressLine2}
                onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.addressLine2 ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.addressLine2 && <p className="text-red-500 text-sm mt-1">{errors.addressLine2}</p>}
            </div>

            {/* Landmark */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Landmark</label>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Nearby landmark (optional)"
                  value={formData.landmark}
                  onChange={(e) => handleInputChange('landmark', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Delivery Instructions */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Delivery Instructions</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <textarea
                  placeholder="Special delivery instructions (optional)"
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>

            {/* Delivery Time */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Delivery Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <select
                  value={formData.deliveryTime}
                  onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                >
                  <option value="asap">ASAP (30-40 mins)</option>
                  <option value="scheduled">Schedule for later</option>
                </select>
              </div>
            </div>

            {/* Scheduled Time Picker */}
            {formData.deliveryTime === 'scheduled' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.scheduledTime ? 'border-red-500' : 'border-border'
                  }`}
                />
                {errors.scheduledTime && <p className="text-red-500 text-sm mt-1">{errors.scheduledTime}</p>}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button
              onClick={handleCancel}
              className="px-6 py-3 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartOrder}
              className="px-6 py-3 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              Start Order
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FBOrderDelivery;
