import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  serviceCategoryService,
  serviceSubcategoryService,
  serviceSlotService,
  servicePricingQueryService,
  serviceBookingService,
} from "./additionalServices";
import PropTypes from "prop-types";
import { FaClock, FaRupeeSign, FaCalendarAlt, FaUser } from "react-icons/fa";
import Osr from "./Osr";
import Loading from "../../utils/Loading";

const ServiceBooking = ({ onClose = null }) => {
  // State management
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [pricings, setPricings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Form data
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Load initial data
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await serviceCategoryService.getAll();
      const categoriesData = Array.isArray(response.data) ? response.data : [];
      setCategories(categoriesData);
      console.log("Loaded categories:", categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load service categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubcategories = async (categoryId) => {
    try {
      const response = await serviceSubcategoryService.getByCategoryId(
        categoryId
      );
      const subcategoriesData = Array.isArray(response.data)
        ? response.data
        : [];
      setSubcategories(subcategoriesData);
      console.log("Loaded subcategories:", subcategoriesData);
    } catch (error) {
      console.error("Error loading subcategories:", error);
      toast.error("Failed to load subcategories");
      setSubcategories([]);
    }
  };

  const loadAvailableSlots = async (subcategoryId, date) => {
    try {
      setSlotsLoading(true);
      const response = await serviceSlotService.getAvailableSlots(
        subcategoryId,
        date
      );
      const slotsData = response.data?.available_slots || [];
      setAvailableSlots(slotsData);
      console.log("Loaded available slots:", slotsData);
    } catch (error) {
      console.error("Error loading available slots:", error);
      toast.error("Failed to load available slots");
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const loadPricing = async (subcategoryId) => {
    try {
      setPricingLoading(true);
      const response = await servicePricingQueryService.getBySubcategory(
        subcategoryId
      );
      const pricingData = Array.isArray(response.data) ? response.data : [];
      setPricings(pricingData);
      console.log("Loaded pricing:", pricingData);
      // Debug: Log first pricing item structure
      if (pricingData.length > 0) {
        console.log("First pricing item structure:", pricingData[0]);
      }
    } catch (error) {
      console.error("Error loading pricing:", error);
      toast.error("Failed to load pricing information");
      setPricings([]);
    } finally {
      setPricingLoading(false);
    }
  };

  // Event handlers
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setSelectedSubcategory("");
    setSelectedDate("");
    setSelectedSlot(null);
    setSubcategories([]);
    setAvailableSlots([]);
    setPricings([]);

    if (categoryId) {
      loadSubcategories(categoryId);
    }
  };

  const handleSubcategoryChange = (e) => {
    const subcategoryId = e.target.value;
    setSelectedSubcategory(subcategoryId);
    setSelectedDate("");
    setSelectedSlot(null);
    setAvailableSlots([]);

    if (subcategoryId) {
      loadPricing(subcategoryId);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedSlot(null);
    setAvailableSlots([]);

    if (date && selectedSubcategory) {
      loadAvailableSlots(selectedSubcategory, date);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBookService = async () => {
    if (!selectedSubcategory || !selectedDate || !selectedSlot) {
      toast.error("Please select subcategory, date, and time slot");
      return;
    }

    try {
      setBookingLoading(true);

      const bookingData = {
        booking_date: selectedDate,
        service_subcategory_id: parseInt(selectedSubcategory),
        service_slot_id: selectedSlot.id,
        special_instructions: specialInstructions || "",
      };

      await serviceBookingService.create(bookingData);
      toast.success("Service booked successfully!");

      // Reset form
      setSelectedCategory("");
      setSelectedSubcategory("");
      setSelectedDate("");
      setSelectedSlot(null);
      setSpecialInstructions("");
      setSubcategories([]);
      setAvailableSlots([]);
      setPricings([]);
    } catch (error) {
      console.error("Error booking service:", error);
      toast.error("Failed to book service. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  if (loading) {
    return <Loading message="Loading service categories..." />;
  }

  return (
    <div className="flex h-screen">
      <Osr />
      <div className="w-full mt-4 flex mx-3 mb-10 flex-col overflow-hidden">
        <div className="max-w-4xl flex-wrap mx-auto overflow-y-auto max-h-full pb-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Book a Service
                </h1>
                <p className="text-gray-600 mt-2">
                  Select your preferred service and time slot
                </p>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>

          {/* Service Selection */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Select Service
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Category *
                </label>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Subcategory *
                </label>
                <select
                  value={selectedSubcategory}
                  onChange={handleSubcategoryChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!selectedCategory}
                  required
                >
                  <option value="">Select a subcategory</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Selection */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaCalendarAlt className="inline mr-2" />
                Select Date *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={getMinDate()}
                className="w-full md:w-1/2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!selectedSubcategory}
                required
              />
            </div>
          </div>

          {/* Pricing Information */}
          {selectedSubcategory && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                <FaRupeeSign className="inline mr-2" />
                Pricing Information
              </h2>

              {pricingLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">Loading pricing...</span>
                </div>
              ) : pricings.length > 0 ? (
                <>
                  {/* Debug section - remove this after fixing */}
                  {/* <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
                    <strong>Debug - Pricing Data:</strong>
                    <pre>{JSON.stringify(pricings[0], null, 2)}</pre>
                  </div> */}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pricings.map((pricing) => (
                      <div
                        key={pricing.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <h3 className="font-semibold text-lg text-gray-800">
                          {pricing.unit_configuration_name || "N/A"}
                        </h3>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Original Price:
                            </span>
                            <span className="font-medium">
                              ₹{pricing.original_price || pricing.price || 0}
                            </span>
                          </div>
                          {(pricing.discount_percentage > 0 ||
                            pricing.discount_amount > 0) && (
                            <div className="flex justify-between text-green-600">
                              <span>
                                Discount ({pricing.discount_percentage || 0}%):
                              </span>
                              <span>-₹{pricing.discount_amount || 0}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Tax ({pricing.tax_percentage || 0}%):
                            </span>
                            <span>₹{pricing.tax_amount || 0}</span>
                          </div>
                          <hr className="my-2" />
                          <div className="flex justify-between font-bold text-lg">
                            <span>Final Price:</span>
                            <span className="text-blue-600">
                              ₹
                              {pricing.final_price ||
                                pricing.total_price ||
                                pricing.price ||
                                0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-500">
                  No pricing information available
                </p>
              )}
            </div>
          )}

          {/* Available Slots */}
          {selectedDate && selectedSubcategory && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                <FaClock className="inline mr-2" />
                Available Time Slots
              </h2>

              {slotsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">
                    Loading available slots...
                  </span>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableSlots.map((slot) => (
                    <div
                      key={slot.id}
                      onClick={() => handleSlotSelect(slot)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        selectedSlot?.id === slot.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-800">
                          {slot.display_time}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {slot.available_spots} / {slot.max_bookings} spots
                          available
                        </div>
                        {selectedSlot?.id === slot.id && (
                          <div className="mt-2 text-blue-600 font-medium">
                            ✓ Selected
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  No slots available for the selected date
                </p>
              )}
            </div>
          )}

          {/* Special Instructions */}
          {selectedSlot && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                <FaUser className="inline mr-2" />
                Additional Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special requirements or instructions for the service provider..."
                />
              </div>
            </div>
          )}

          {/* Book Service Button */}
          {selectedSlot && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <button
                  onClick={handleBookService}
                  disabled={bookingLoading}
                  className={`px-8 py-3 rounded-md text-white font-semibold text-lg transition-all duration-200 ${
                    bookingLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 transform hover:scale-105"
                  }`}
                >
                  {bookingLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Booking Service...
                    </div>
                  ) : (
                    "Book Service"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ServiceBooking.propTypes = {
  onClose: PropTypes.func,
};

export default ServiceBooking;
