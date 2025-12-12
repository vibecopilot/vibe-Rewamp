import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Clock, Table, Settings, Paperclip, ChevronLeft, Save, X, Plus, Trash2 } from 'lucide-react';
import { postFB, getCuisinesFBSetup } from '../../api';
import { getItemInLocalStorage } from '../../utils/localStorage';
import toast from 'react-hot-toast';
import Select from 'react-select';
import FileInputBox from '../../containers/Inputs/FileInputBox';

interface BlockedDay {
  order: boolean;
  booking: boolean;
  startDate: string;
  endDate: string;
}

interface CuisineOption {
  value: number;
  label: string;
}

const CreateRestaurant: React.FC = () => {
  const navigate = useNavigate();
  const userId = getItemInLocalStorage('UserId');
  
  const [option, setOption] = useState('bookable');
  const [cuisineOptions, setCuisineOptions] = useState<CuisineOption[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<CuisineOption[]>([]);
  const [blockedDays, setBlockedDays] = useState<BlockedDay[]>([]);
  
  const [selectedDays, setSelectedDays] = useState({
    all: false,
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
  });

  const [formData, setFormData] = useState({
    restaurantName: '',
    costForTwo: '',
    mobileNumber: '',
    anotherMobileNumber: '',
    landlineNumber: '',
    deliveryTime: '',
    servesAlcohol: '',
    wheelchairAccessible: '',
    cashOnDelivery: '',
    pureVeg: '',
    address: '',
    termsAndConditions: '',
    disclaimer: '',
    closingMessage: '',
    start_time: '',
    end_time: '',
    break_start_time: '',
    break_end_time: '',
    booking_allowed: false,
    order_allowed: false,
    last_booking_time: '',
    table_number: '',
    minimumPerson: '',
    maximumPerson: '',
    canCancelBefore: '',
    bookingNotAllowedText: '',
    gst: '',
    deliveryCharge: '',
    ServiceCharges: '',
    minimumOrder: '',
    orderNotAllowedText: '',
    cover_image: [] as File[],
    menu: [] as File[],
    gallery: [] as File[],
  });

  useEffect(() => {
    const fetchCuisines = async () => {
      try {
        const response = await getCuisinesFBSetup();
        const options = response.data.map((item: any) => ({
          value: item.id,
          label: item.name,
        }));
        setCuisineOptions(options);
      } catch (error) {
        console.error('Error fetching cuisines:', error);
      }
    };
    fetchCuisines();
  }, []);

  const handleAllChange = () => {
    const newState = !selectedDays.all;
    setSelectedDays({
      all: newState,
      sunday: newState,
      monday: newState,
      tuesday: newState,
      wednesday: newState,
      thursday: newState,
      friday: newState,
      saturday: newState,
    });
  };

  const handleDayChange = (day: keyof typeof selectedDays) => {
    if (day === 'all') {
      handleAllChange();
      return;
    }
    const updatedState = { ...selectedDays, [day]: !selectedDays[day] };
    const allChecked = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      .every(d => updatedState[d as keyof typeof selectedDays]);
    updatedState.all = allChecked;
    setSelectedDays(updatedState);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (files: File[], fieldName: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: files }));
  };

  const addBlockedDay = () => {
    setBlockedDays([...blockedDays, { order: false, booking: false, startDate: '', endDate: '' }]);
  };

  const removeBlockedDay = (index: number) => {
    setBlockedDays(blockedDays.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.restaurantName) return toast.error('Restaurant Name is required');
    if (!formData.costForTwo) return toast.error('Cost For Two is required');
    if (!formData.mobileNumber) return toast.error('Mobile Number is required');
    if (formData.mobileNumber.length !== 10) return toast.error('Mobile Number must be 10 digits');
    if (!formData.servesAlcohol) return toast.error('Please select Serves Alcohol');
    if (!formData.wheelchairAccessible) return toast.error('Please select Wheelchair Accessible');
    if (!formData.pureVeg) return toast.error('Please select Pure Veg');

    const postData = new FormData();
    postData.append('food_and_beverage[restauranttype]', option);
    postData.append('food_and_beverage[restaurant_name]', formData.restaurantName);
    postData.append('food_and_beverage[status]', 'true');
    postData.append('food_and_beverage[created_by_id]', userId || '');
    postData.append('food_and_beverage[cost_for_two]', formData.costForTwo);
    postData.append('food_and_beverage[mobile_number]', formData.mobileNumber);
    postData.append('food_and_beverage[alternate_mobile_number]', formData.anotherMobileNumber);
    postData.append('food_and_beverage[landline_number]', formData.landlineNumber);
    postData.append('food_and_beverage[delivery_time]', formData.deliveryTime);
    
    selectedCuisines.forEach(cuisine => {
      postData.append('food_and_beverage[cuisines][]', String(cuisine.value));
    });

    postData.append('food_and_beverage[serves_alcohols]', formData.servesAlcohol);
    postData.append('food_and_beverage[wheelchair_accessible]', formData.wheelchairAccessible);
    postData.append('food_and_beverage[cash_on_delivery]', formData.cashOnDelivery);
    postData.append('food_and_beverage[pure_veg]', formData.pureVeg);
    postData.append('food_and_beverage[address]', formData.address);
    postData.append('food_and_beverage[terms_and_conditions]', formData.termsAndConditions);
    postData.append('food_and_beverage[disclaimer]', formData.disclaimer);
    postData.append('food_and_beverage[closing_message]', formData.closingMessage);
    postData.append('food_and_beverage[start_time]', formData.start_time);
    postData.append('food_and_beverage[end_time]', formData.end_time);
    postData.append('food_and_beverage[break_start_time]', formData.break_start_time);
    postData.append('food_and_beverage[break_end_time]', formData.break_end_time);
    postData.append('food_and_beverage[booking_allowed]', String(formData.booking_allowed));
    postData.append('food_and_beverage[order_allowed]', String(formData.order_allowed));
    postData.append('food_and_beverage[last_booking_time]', formData.last_booking_time);
    postData.append('food_and_beverage[table_number]', formData.table_number);
    postData.append('food_and_beverage[minimum_person]', formData.minimumPerson);
    postData.append('food_and_beverage[maximum_person]', formData.maximumPerson);
    postData.append('food_and_beverage[cancel_before]', formData.canCancelBefore);
    postData.append('food_and_beverage[booking_not_available_text]', formData.bookingNotAllowedText);
    postData.append('food_and_beverage[gst]', formData.gst);
    postData.append('food_and_beverage[delivery_charges]', formData.deliveryCharge);
    postData.append('food_and_beverage[serviceCharges]', formData.ServiceCharges);
    postData.append('food_and_beverage[minimum_order]', formData.minimumOrder);
    postData.append('food_and_beverage[order_not_allowed_text]', formData.orderNotAllowedText);

    postData.append('food_and_beverage[sun]', selectedDays.sunday ? '1' : '0');
    postData.append('food_and_beverage[mon]', selectedDays.monday ? '1' : '0');
    postData.append('food_and_beverage[tue]', selectedDays.tuesday ? '1' : '0');
    postData.append('food_and_beverage[wed]', selectedDays.wednesday ? '1' : '0');
    postData.append('food_and_beverage[thu]', selectedDays.thursday ? '1' : '0');
    postData.append('food_and_beverage[fri]', selectedDays.friday ? '1' : '0');
    postData.append('food_and_beverage[sat]', selectedDays.saturday ? '1' : '0');

    blockedDays.forEach((row) => {
      postData.append('blocked_days[][order_allowed]', String(row.order));
      postData.append('blocked_days[][booking_allowed]', String(row.booking));
      postData.append('blocked_days[][start_date]', row.startDate);
      postData.append('blocked_days[][end_date]', row.endDate);
    });

    formData.cover_image?.forEach(file => postData.append('cover_images[]', file));
    formData.menu?.forEach(file => postData.append('menu_images[]', file));
    formData.gallery?.forEach(file => postData.append('gallery_images[]', file));

    try {
      await postFB(postData);
      toast.success('Restaurant added successfully');
      navigate('/fb/restaurant');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add restaurant');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <button onClick={() => navigate('/fb/restaurant')} className="flex items-center gap-1 hover:text-foreground">
          <ChevronLeft className="w-4 h-4" />
          Restaurant Management
        </button>
        <span>/</span>
        <span className="text-foreground">Create Restaurant</span>
      </div>

      {/* Section 1 - Basic Details */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Basic Details</h2>
        </div>

        {/* Bookable/Request Radio */}
        <div className="flex gap-6 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="bookable"
              checked={option === 'bookable'}
              onChange={(e) => setOption(e.target.value)}
              className="w-4 h-4 text-primary"
            />
            <span className="font-medium">Bookable</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="request"
              checked={option === 'request'}
              onChange={(e) => setOption(e.target.value)}
              className="w-4 h-4 text-primary"
            />
            <span className="font-medium">Request</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Restaurant Name <span className="text-destructive">*</span></label>
            <input name="restaurantName" value={formData.restaurantName} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Restaurant Name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cost For Two <span className="text-destructive">*</span></label>
            <input name="costForTwo" value={formData.costForTwo} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Cost For Two" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mobile Number <span className="text-destructive">*</span></label>
            <input name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Mobile Number" maxLength={10} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Another Mobile Number</label>
            <input name="anotherMobileNumber" value={formData.anotherMobileNumber} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Another Mobile Number" maxLength={10} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Landline Number</label>
            <input name="landlineNumber" value={formData.landlineNumber} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Landline Number" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Delivery Time</label>
            <input name="deliveryTime" value={formData.deliveryTime} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary" placeholder="e.g., 30 mins" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cuisines</label>
            <Select
              isMulti
              options={cuisineOptions}
              value={selectedCuisines}
              onChange={(selected) => setSelectedCuisines(selected as CuisineOption[])}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Serves Alcohol <span className="text-destructive">*</span></label>
            <select name="servesAlcohol" value={formData.servesAlcohol} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary">
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Wheelchair Accessible <span className="text-destructive">*</span></label>
            <select name="wheelchairAccessible" value={formData.wheelchairAccessible} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary">
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cash on Delivery <span className="text-destructive">*</span></label>
            <select name="cashOnDelivery" value={formData.cashOnDelivery} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary">
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pure Veg <span className="text-destructive">*</span></label>
            <select name="pureVeg" value={formData.pureVeg} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary">
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Address" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-1">Terms & Conditions</label>
            <textarea name="termsAndConditions" value={formData.termsAndConditions} onChange={handleChange} rows={2} className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Terms & Conditions" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-1">Disclaimer</label>
            <textarea name="disclaimer" value={formData.disclaimer} onChange={handleChange} rows={2} className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Disclaimer" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-1">Closing Message</label>
            <textarea name="closingMessage" value={formData.closingMessage} onChange={handleChange} rows={2} className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Closing Message" />
          </div>
        </div>
      </div>

      {/* Section 2 - Restaurant Details */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Restaurant Details</h2>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Operational Days</label>
          <div className="flex flex-wrap gap-4">
            {['all', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => (
              <label key={day} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDays[day as keyof typeof selectedDays]}
                  onChange={() => handleDayChange(day as keyof typeof selectedDays)}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm capitalize">{day === 'all' ? 'All' : day.charAt(0).toUpperCase()}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Break Start Time</label>
            <input type="time" name="break_start_time" value={formData.break_start_time} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Break End Time</label>
            <input type="time" name="break_end_time" value={formData.break_end_time} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Booking & Order Time</label>
            <input type="time" name="last_booking_time" value={formData.last_booking_time} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="booking_allowed" checked={formData.booking_allowed} onChange={handleChange} className="w-4 h-4 text-primary rounded" />
              <span className="text-sm">Booking Allowed</span>
            </label>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="order_allowed" checked={formData.order_allowed} onChange={handleChange} className="w-4 h-4 text-primary rounded" />
              <span className="text-sm">Order Allowed</span>
            </label>
          </div>
        </div>
      </div>

      {/* Section 3 - Blocked Days */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <X className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Blocked Days</h2>
          </div>
          <button onClick={addBlockedDay} className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {blockedDays.map((row, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input type="date" value={row.startDate} onChange={(e) => {
                const updated = [...blockedDays];
                updated[index].startDate = e.target.value;
                setBlockedDays(updated);
              }} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input type="date" value={row.endDate} onChange={(e) => {
                const updated = [...blockedDays];
                updated[index].endDate = e.target.value;
                setBlockedDays(updated);
              }} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={row.booking} onChange={(e) => {
                  const updated = [...blockedDays];
                  updated[index].booking = e.target.checked;
                  setBlockedDays(updated);
                }} className="w-4 h-4 text-primary rounded" />
                <span className="text-sm">Block Booking</span>
              </label>
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={row.order} onChange={(e) => {
                  const updated = [...blockedDays];
                  updated[index].order = e.target.checked;
                  setBlockedDays(updated);
                }} className="w-4 h-4 text-primary rounded" />
                <span className="text-sm">Block Order</span>
              </label>
            </div>
            <div className="flex items-center">
              <button onClick={() => removeBlockedDay(index)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {blockedDays.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No blocked days added</p>
        )}
      </div>

      {/* Section 4 - Table Booking */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Table className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Table Booking</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Number of Tables</label>
            <input name="table_number" value={formData.table_number} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background" placeholder="Number of Tables" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Minimum Person</label>
            <input name="minimumPerson" value={formData.minimumPerson} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background" placeholder="Minimum Person" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Maximum Person</label>
            <input name="maximumPerson" value={formData.maximumPerson} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background" placeholder="Maximum Person" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Can Cancel Before (mins)</label>
            <input name="canCancelBefore" value={formData.canCancelBefore} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background" placeholder="e.g., 60" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Booking Not Available Text</label>
            <input name="bookingNotAllowedText" value={formData.bookingNotAllowedText} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background" placeholder="Message when booking is not available" />
          </div>
        </div>
      </div>

      {/* Section 5 - Order Configure */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Order Configure</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">GST %</label>
            <input name="gst" value={formData.gst} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background" placeholder="GST %" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Delivery Charge</label>
            <input name="deliveryCharge" value={formData.deliveryCharge} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background" placeholder="Delivery Charge" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Service Charge %</label>
            <input name="ServiceCharges" value={formData.ServiceCharges} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background" placeholder="Service Charge %" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Minimum Order</label>
            <input name="minimumOrder" value={formData.minimumOrder} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background" placeholder="Minimum Order Amount" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Order Not Allowed Text</label>
            <input name="orderNotAllowedText" value={formData.orderNotAllowedText} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background" placeholder="Message when order is not allowed" />
          </div>
        </div>
      </div>

      {/* Section 6 - Attachments */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Paperclip className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Attachments</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Cover Image</label>
            <FileInputBox
              handleChange={(files) => handleFileChange(files, 'cover_image')}
              fieldName="cover_image"
              isMulti={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Menu</label>
            <FileInputBox
              handleChange={(files) => handleFileChange(files, 'menu')}
              fieldName="menu"
              isMulti={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Gallery</label>
            <FileInputBox
              handleChange={(files) => handleFileChange(files, 'gallery')}
              fieldName="gallery"
              isMulti={true}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mb-10">
        <button onClick={() => navigate('/fb/restaurant')} className="px-6 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors">
          Cancel
        </button>
        <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>
    </div>
  );
};

export default CreateRestaurant;
