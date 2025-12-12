import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Building2, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { getFacitilitySetup, postAmenitiesBooking, getFacilitySlots } from '../../api';
import { getItemInLocalStorage } from '../../utils/localStorage';
import toast from 'react-hot-toast';
import Select from 'react-select';

interface FacilityOption {
  value: number;
  label: string;
}

interface UserOption {
  value: string;
  label: string;
}

interface SlotOption {
  value: number;
  label: string;
  start_hr: number;
  start_min: number;
  end_hr: number;
  end_min: number;
}

const BookSpace: React.FC = () => {
  const navigate = useNavigate();
  const userId = getItemInLocalStorage('UserId');

  const [facilities, setFacilities] = useState<FacilityOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [selectedFacility, setSelectedFacility] = useState<FacilityOption | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotOption | null>(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('postpaid');

  const [members, setMembers] = useState({
    member: { adult: 0 },
    guest: { adult: 0 },
  });

  const [gst, setGst] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const [cancellationOpen, setCancellationOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await getFacitilitySetup();
        const data = response?.data?.amenities || response?.data || [];
        const options = Array.isArray(data) ? data.map((item: any) => ({
          value: item.id,
          label: item.fac_name || item.name,
        })) : [];
        setFacilities(options);
      } catch (error) {
        console.error('Error fetching facilities:', error);
      }
    };

    const fetchUsers = async () => {
      setUsers([
        { value: userId || '1', label: 'Current User' },
      ]);
    };

    fetchFacilities();
    fetchUsers();
  }, [userId]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (selectedFacility && bookingDate) {
        setLoadingSlots(true);
        try {
          const response = await getFacilitySlots(selectedFacility.value, bookingDate);
          const slotsData = response?.data?.slots || response?.data || [];
          const slotOptions = Array.isArray(slotsData) ? slotsData.map((slot: any) => ({
            value: slot.id,
            label: `${String(slot.start_hr || 0).padStart(2, '0')}:${String(slot.start_min || 0).padStart(2, '0')} - ${String(slot.end_hr || 0).padStart(2, '0')}:${String(slot.end_min || 0).padStart(2, '0')}`,
            start_hr: slot.start_hr,
            start_min: slot.start_min,
            end_hr: slot.end_hr,
            end_min: slot.end_min,
          })) : [];
          setSlots(slotOptions);
        } catch (error) {
          console.error('Error fetching slots:', error);
          setSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      }
    };
    fetchSlots();
  }, [selectedFacility, bookingDate]);

  const handleMemberChange = (category: 'member' | 'guest', value: number) => {
    setMembers(prev => ({
      ...prev,
      [category]: {
        adult: Math.max(0, value),
      },
    }));
  };

  const handleSubmit = async () => {
    if (!selectedFacility) {
      toast.error('Please select a facility');
      return;
    }
    if (!bookingDate) {
      toast.error('Please select a date');
      return;
    }

    setSubmitting(true);
    try {
      const postData = new FormData();
      postData.append('amenity_booking[amenity_id]', String(selectedFacility.value));
      postData.append('amenity_booking[booking_date]', bookingDate);
      postData.append('amenity_booking[payment_mode]', paymentMode);
      postData.append('amenity_booking[member_adult]', String(members.member.adult));
      postData.append('amenity_booking[member_child]', '0');
      postData.append('amenity_booking[guest_adult]', String(members.guest.adult));
      postData.append('amenity_booking[guest_child]', '0');
      postData.append('amenity_booking[tenant_adult]', '0');
      postData.append('amenity_booking[tenant_child]', '0');
      postData.append('amenity_booking[gst]', String(gst));
      postData.append('amenity_booking[amount]', String(totalAmount));
      if (selectedSlot) {
        postData.append('amenity_booking[amenity_slot_id]', String(selectedSlot.value));
      }
      if (selectedUser) {
        postData.append('amenity_booking[user_id]', selectedUser.value);
      }

      await postAmenitiesBooking(postData);
      toast.success('Space booked successfully');
      navigate('/space-booking');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: 'hsl(var(--background))',
      borderColor: 'hsl(var(--border))',
      '&:hover': { borderColor: 'hsl(var(--primary))' },
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      zIndex: 50,
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? 'hsl(var(--accent))' : 'transparent',
      color: 'hsl(var(--foreground))',
      '&:hover': { backgroundColor: 'hsl(var(--accent))' },
    }),
    singleValue: (base: any) => ({
      ...base,
      color: 'hsl(var(--foreground))',
    }),
    input: (base: any) => ({
      ...base,
      color: 'hsl(var(--foreground))',
    }),
    placeholder: (base: any) => ({
      ...base,
      color: 'hsl(var(--muted-foreground))',
    }),
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <button onClick={() => navigate('/space-booking')} className="flex items-center gap-1 hover:text-foreground">
          <ChevronLeft className="w-4 h-4" />
          Space Booking
        </button>
        <span>/</span>
        <span className="text-foreground">Book Facility</span>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Book Facility</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Select Facility */}
          <div>
            <label className="block text-sm font-medium mb-1">Select Facility <span className="text-destructive">*</span></label>
            <Select
              options={facilities}
              value={selectedFacility}
              onChange={(selected) => setSelectedFacility(selected)}
              placeholder="Search and select facility..."
              styles={selectStyles}
              isClearable
            />
          </div>

          {/* Select User */}
          <div>
            <label className="block text-sm font-medium mb-1">Select User</label>
            <Select
              options={users}
              value={selectedUser}
              onChange={(selected) => setSelectedUser(selected)}
              placeholder="Search and select user..."
              styles={selectStyles}
              isClearable
            />
          </div>

          {/* Select Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Select Date <span className="text-destructive">*</span></label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Select Slot */}
          <div>
            <label className="block text-sm font-medium mb-1">Select Time Slot</label>
            <Select
              options={slots}
              value={selectedSlot}
              onChange={(selected) => setSelectedSlot(selected)}
              placeholder={loadingSlots ? 'Loading slots...' : 'Select a time slot...'}
              styles={selectStyles}
              isLoading={loadingSlots}
              isDisabled={!selectedFacility || loadingSlots}
              isClearable
            />
          </div>
        </div>

        {/* Payment Mode - 4 radio buttons in single row */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Payment Mode</label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMode"
                value="postpaid"
                checked={paymentMode === 'postpaid'}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-4 h-4 text-primary accent-primary"
              />
              <span className="text-sm">Post Paid</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMode"
                value="prepaid"
                checked={paymentMode === 'prepaid'}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-4 h-4 text-primary accent-primary"
              />
              <span className="text-sm">Prepaid</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMode"
                value="pay_on_facility"
                checked={paymentMode === 'pay_on_facility'}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-4 h-4 text-primary accent-primary"
              />
              <span className="text-sm">Pay on Facility</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMode"
                value="complimentary"
                checked={paymentMode === 'complimentary'}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-4 h-4 text-primary accent-primary"
              />
              <span className="text-sm">Complimentary</span>
            </label>
          </div>
        </div>

        {/* Members Section - 2 columns only */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Members</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Member */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Member</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Adult</span>
                  <input
                    type="number"
                    min={0}
                    value={members.member.adult}
                    onChange={(e) => handleMemberChange('member', parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-sm border border-border rounded bg-background text-right"
                  />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm font-medium">Total</span>
                  <span className="font-semibold">{members.member.adult}</span>
                </div>
              </div>
            </div>

            {/* Guest */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Guest</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Adult</span>
                  <input
                    type="number"
                    min={0}
                    value={members.guest.adult}
                    onChange={(e) => handleMemberChange('guest', parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-sm border border-border rounded bg-background text-right"
                  />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm font-medium">Total</span>
                  <span className="font-semibold">{members.guest.adult}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GST and Total */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">GST (%)</label>
            <input
              type="number"
              min={0}
              value={gst}
              onChange={(e) => setGst(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-right focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Total Amount</label>
            <input
              type="number"
              min={0}
              value={totalAmount}
              onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-right focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        {/* Cancellation Policy Accordion */}
        <div className="border border-border rounded-lg mb-3">
          <button
            onClick={() => setCancellationOpen(!cancellationOpen)}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <span className="font-medium">Cancellation Policy</span>
            {cancellationOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {cancellationOpen && (
            <div className="px-4 pb-4 text-sm text-muted-foreground">
              <p>Cancellations made 24 hours before the scheduled time are eligible for a full refund. Cancellations made less than 24 hours before will incur a 50% cancellation fee. No refunds for no-shows.</p>
            </div>
          )}
        </div>

        {/* Terms & Conditions Accordion */}
        <div className="border border-border rounded-lg">
          <button
            onClick={() => setTermsOpen(!termsOpen)}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <span className="font-medium">Terms & Conditions</span>
            {termsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {termsOpen && (
            <div className="px-4 pb-4 text-sm text-muted-foreground">
              <ul className="list-disc list-inside space-y-1">
                <li>Bookings are subject to availability and confirmation.</li>
                <li>Please arrive 10 minutes before your scheduled time.</li>
                <li>The facility must be left in the same condition as found.</li>
                <li>Any damage to the facility will be charged to the user.</li>
                <li>Management reserves the right to cancel bookings if necessary.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookSpace;
