import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UtensilsCrossed, ChevronLeft, Edit2, Loader2, AlertCircle, RefreshCw, Check, X, Clock, Phone, MapPin, Users, DollarSign, FileText } from 'lucide-react';
import { getFBDetails } from '../../api';

interface Restaurant {
  id: number;
  restaurant_name: string;
  restauranttype?: string;
  cost_for_two?: number;
  mobile_number?: string;
  alternate_mobile_number?: string;
  landline_number?: string;
  delivery_time?: string;
  cuisines?: string;
  serves_alcohols?: boolean;
  wheelchair_accessible?: boolean;
  cash_on_delivery?: boolean;
  pure_veg?: boolean;
  address?: string;
  terms_and_conditions?: string;
  disclaimer?: string;
  closing_message?: string;
  start_time?: string;
  end_time?: string;
  break_start_time?: string;
  break_end_time?: string;
  last_booking_time?: string;
  table_number?: number;
  booking_allowed?: boolean;
  order_allowed?: boolean;
  minimum_person?: number;
  maximum_person?: number;
  cancel_before?: number;
  booking_not_available_text?: string;
  gst?: number;
  delivery_charges?: number;
  minimum_order?: number;
  order_not_allowed_text?: string;
  serviceCharges?: number;
  status?: boolean;
  mon?: number;
  tue?: number;
  wed?: number;
  thu?: number;
  fri?: number;
  sat?: number;
  sun?: number;
  cover_images?: Array<{ document_url?: string }>;
  menu_images?: Array<{ document_url?: string }>;
  gallery_images?: Array<{ document_url?: string }>;
  created_at?: string;
}

const ViewRestaurant: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurant = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getFBDetails(id);
      setRestaurant(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch restaurant details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '-';
    try {
      return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  const getOpenDays = (rest: Restaurant): string => {
    const daysOfWeek = [
      { key: 'mon', label: 'Mon' },
      { key: 'tue', label: 'Tue' },
      { key: 'wed', label: 'Wed' },
      { key: 'thu', label: 'Thu' },
      { key: 'fri', label: 'Fri' },
      { key: 'sat', label: 'Sat' },
      { key: 'sun', label: 'Sun' },
    ];
    const openDays = daysOfWeek
      .filter((day) => rest[day.key as keyof Restaurant] === 1)
      .map((day) => day.label);
    return openDays.length > 0 ? openDays.join(', ') : 'No days set';
  };

  const BooleanBadge = ({ value, trueText = 'Yes', falseText = 'No' }: { value?: boolean; trueText?: string; falseText?: string }) => (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {value ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      {value ? trueText : falseText}
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading restaurant details...</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Restaurant</h3>
        <p className="text-muted-foreground mb-4">{error || 'Restaurant not found'}</p>
        <button
          onClick={fetchRestaurant}
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
        <Link to="/fb/restaurant" className="hover:text-primary">Restaurant Management</Link>
        <span>/</span>
        <span className="text-foreground">{restaurant.restaurant_name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{restaurant.restaurant_name}</h1>
            <p className="text-sm text-muted-foreground">Restaurant Details</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/fb/restaurant')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={() => navigate(`/fb/restaurant/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Restaurant Name</label>
              <p className="mt-1 text-foreground">{restaurant.restaurant_name || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Type</label>
              <p className="mt-1 text-foreground capitalize">{restaurant.restauranttype || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <BooleanBadge value={restaurant.status} trueText="Active" falseText="Inactive" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Cost for Two</label>
              <p className="mt-1 text-foreground">₹{restaurant.cost_for_two || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Cuisines</label>
              <p className="mt-1 text-foreground">{restaurant.cuisines || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Open Days</label>
              <p className="mt-1 text-foreground">{getOpenDays(restaurant)}</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Mobile Number</label>
              <p className="mt-1 text-foreground">{restaurant.mobile_number || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Alternate Mobile</label>
              <p className="mt-1 text-foreground">{restaurant.alternate_mobile_number || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Landline Number</label>
              <p className="mt-1 text-foreground">{restaurant.landline_number || '-'}</p>
            </div>
            <div className="md:col-span-3">
              <label className="text-sm font-medium text-muted-foreground">Address</label>
              <p className="mt-1 text-foreground">{restaurant.address || '-'}</p>
            </div>
          </div>
        </div>

        {/* Timing & Schedule */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Timing & Schedule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Start Time</label>
              <p className="mt-1 text-foreground">{formatTime(restaurant.start_time)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">End Time</label>
              <p className="mt-1 text-foreground">{formatTime(restaurant.end_time)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Booking Time</label>
              <p className="mt-1 text-foreground">{formatTime(restaurant.last_booking_time)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Break Start Time</label>
              <p className="mt-1 text-foreground">{formatTime(restaurant.break_start_time)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Break End Time</label>
              <p className="mt-1 text-foreground">{formatTime(restaurant.break_end_time)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Delivery Time</label>
              <p className="mt-1 text-foreground">{restaurant.delivery_time || '-'} mins</p>
            </div>
          </div>
        </div>

        {/* Booking Settings */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Booking Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Booking Allowed</label>
              <div className="mt-1"><BooleanBadge value={restaurant.booking_allowed} /></div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Order Allowed</label>
              <div className="mt-1"><BooleanBadge value={restaurant.order_allowed} /></div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Table Number</label>
              <p className="mt-1 text-foreground">{restaurant.table_number || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Minimum Person</label>
              <p className="mt-1 text-foreground">{restaurant.minimum_person || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Maximum Person</label>
              <p className="mt-1 text-foreground">{restaurant.maximum_person || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Cancel Before (mins)</label>
              <p className="mt-1 text-foreground">{restaurant.cancel_before || '-'}</p>
            </div>
          </div>
        </div>

        {/* Charges & Fees */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Charges & Fees
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">GST (%)</label>
              <p className="mt-1 text-foreground">{restaurant.gst || '-'}%</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Delivery Charges</label>
              <p className="mt-1 text-foreground">₹{restaurant.delivery_charges || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Service Charges</label>
              <p className="mt-1 text-foreground">₹{restaurant.serviceCharges || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Minimum Order</label>
              <p className="mt-1 text-foreground">₹{restaurant.minimum_order || '-'}</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Serves Alcohol</label>
              <div className="mt-1"><BooleanBadge value={restaurant.serves_alcohols} /></div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Wheelchair Accessible</label>
              <div className="mt-1"><BooleanBadge value={restaurant.wheelchair_accessible} /></div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Cash on Delivery</label>
              <div className="mt-1"><BooleanBadge value={restaurant.cash_on_delivery} /></div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Pure Veg</label>
              <div className="mt-1"><BooleanBadge value={restaurant.pure_veg} /></div>
            </div>
          </div>
        </div>

        {/* Terms & Messages */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Terms & Messages</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Terms and Conditions</label>
              <p className="mt-1 text-foreground whitespace-pre-wrap">{restaurant.terms_and_conditions || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Disclaimer</label>
              <p className="mt-1 text-foreground whitespace-pre-wrap">{restaurant.disclaimer || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Closing Message</label>
              <p className="mt-1 text-foreground whitespace-pre-wrap">{restaurant.closing_message || '-'}</p>
            </div>
            {restaurant.booking_not_available_text && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Booking Not Allowed Text</label>
                <p className="mt-1 text-foreground">{restaurant.booking_not_available_text}</p>
              </div>
            )}
            {restaurant.order_not_allowed_text && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Order Not Allowed Text</label>
                <p className="mt-1 text-foreground">{restaurant.order_not_allowed_text}</p>
              </div>
            )}
          </div>
        </div>

        {/* Cover Images */}
        {restaurant.cover_images && restaurant.cover_images.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Cover Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {restaurant.cover_images.map((img, index) => (
                <div key={index} className="aspect-video rounded-lg overflow-hidden border border-border">
                  <img 
                    src={img.document_url} 
                    alt={`Cover ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu Images */}
        {restaurant.menu_images && restaurant.menu_images.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Menu Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {restaurant.menu_images.map((img, index) => (
                <div key={index} className="aspect-[3/4] rounded-lg overflow-hidden border border-border">
                  <img 
                    src={img.document_url} 
                    alt={`Menu ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Images */}
        {restaurant.gallery_images && restaurant.gallery_images.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {restaurant.gallery_images.map((img, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden border border-border">
                  <img 
                    src={img.document_url} 
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewRestaurant;