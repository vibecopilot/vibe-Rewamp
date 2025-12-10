import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  serviceBookingService,
  serviceCategoryService,
  serviceSubcategoryService,
  unitConfigurationService,
} from "./additionalServices";
import OsrModal from "./OsrModal";
import Osr from "./Osr";
import Loading from "../../utils/Loading";
import StarRating from "../../utils/StarRating";

const MyBookings = () => {
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [unitConfigs, setUnitConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [ratingData, setRatingData] = useState({
    rating: 0,
    review: "",
  });
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    dateFrom: "",
    dateTo: "",
  });

  // In a real app, this would come from auth context
  const currentUserId = 1;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, subcategoriesRes, categoriesRes, unitConfigsRes] =
        await Promise.all([
          serviceBookingService.getUserBookings(currentUserId),
          serviceSubcategoryService.getAll(),
          serviceCategoryService.getAll(),
          unitConfigurationService.getAll(),
        ]);
      setBookings(bookingsRes.data);
      setSubcategories(subcategoriesRes.data);
      setCategories(categoriesRes.data);
      setUnitConfigs(unitConfigsRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    if (filters.status) {
      filtered = filtered.filter(
        (booking) => booking.status === filters.status
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(
        (booking) =>
          new Date(booking.booking_date) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(
        (booking) => new Date(booking.booking_date) <= new Date(filters.dateTo)
      );
    }

    // Sort by booking date (most recent first)
    filtered.sort(
      (a, b) => new Date(b.booking_date) - new Date(a.booking_date)
    );

    setFilteredBookings(filtered);
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await serviceBookingService.cancel(bookingId);
        toast.success("Booking cancelled successfully");
        loadData();
      } catch (error) {
        console.error("Error cancelling booking:", error);
        toast.error("Failed to cancel booking");
      }
    }
  };

  const handleRateService = (booking) => {
    setSelectedBooking(booking);
    setRatingData({
      rating: booking.rating || 0,
      review: booking.review || "",
    });
    setShowRatingModal(true);
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    try {
      await serviceBookingService.addRating(
        selectedBooking.id,
        ratingData.rating,
        ratingData.review
      );
      toast.success("Rating submitted successfully");
      setShowRatingModal(false);
      setSelectedBooking(null);
      setRatingData({ rating: 0, review: "" });
      loadData();
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit rating");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const getSubcategoryName = (subcategoryId) => {
    const subcategory = subcategories.find((s) => s.id === subcategoryId);
    return subcategory ? subcategory.name : "Unknown";
  };

  const getCategoryName = (subcategoryId) => {
    const subcategory = subcategories.find((s) => s.id === subcategoryId);
    if (!subcategory) return "Unknown";
    const category = categories.find(
      (c) => c.id === subcategory.service_category_id
    );
    return category ? category.name : "Unknown";
  };

  const getUnitConfigName = (unitConfigId) => {
    const unitConfig = unitConfigs.find((u) => u.id === unitConfigId);
    return unitConfig ? unitConfig.name : "Unknown";
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "badge-pending";
      case "confirmed":
        return "badge-confirmed";
      case "completed":
        return "badge-completed";
      case "cancelled":
        return "badge-cancelled";
      default:
        return "badge-pending";
    }
  };

  const canCancelBooking = (booking) => {
    const bookingDate = new Date(booking.booking_date);
    const today = new Date();
    const daysDifference = (bookingDate - today) / (1000 * 60 * 60 * 24);

    return (
      booking.status === "pending" ||
      (booking.status === "confirmed" && daysDifference >= 1)
    );
  };

  const canRateService = (booking) => {
    return booking.status === "completed" && !booking.rating;
  };

  if (loading) {
    return <Loading message="Loading your bookings..." />;
  }

  return (
    <div className="flex">
      <Osr />
      <div className="w-full mt-4 flex mx-3 mb-10 flex-col overflow-hidden">
        <h1>My Bookings</h1>

        {/* Filters */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <h3>Filters</h3>
          <div className="grid grid-3">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="form-control"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date From</label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date To</label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>
          </div>

          <button className="btn btn-secondary" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>

        {/* Results Summary */}
        <div style={{ marginBottom: "20px" }}>
          <p>
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="grid grid-1">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="card">
                <div className="grid grid-2">
                  <div>
                    <h3>
                      #{booking.id} -{" "}
                      {getSubcategoryName(booking.service_subcategory_id)}
                    </h3>
                    <p>
                      <strong>Category:</strong>{" "}
                      {getCategoryName(booking.service_subcategory_id)}
                    </p>
                    <p>
                      <strong>Unit Type:</strong>{" "}
                      {getUnitConfigName(booking.unit_configuration_id)}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </p>
                    {booking.service_slot && (
                      <p>
                        <strong>Time:</strong> {booking.service_slot.start_time}{" "}
                        - {booking.service_slot.end_time}
                      </p>
                    )}
                    <p>
                      <strong>Amount:</strong> ₹{booking.total_price}
                    </p>

                    {booking.special_instructions && (
                      <p>
                        <strong>Instructions:</strong>{" "}
                        {booking.special_instructions}
                      </p>
                    )}

                    {booking.rating && (
                      <div>
                        <strong>Your Rating:</strong>
                        <StarRating rating={booking.rating} readOnly={true} />
                        {booking.review && (
                          <p>
                            <em>"{booking.review}"</em>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span
                      className={`badge ${getStatusBadgeClass(booking.status)}`}
                      style={{ marginBottom: "15px" }}
                    >
                      {booking.status}
                    </span>

                    <div>
                      <button
                        className="btn btn-primary"
                        onClick={() => viewBookingDetails(booking)}
                        style={{ marginBottom: "10px", width: "100%" }}
                      >
                        View Details
                      </button>

                      {canCancelBooking(booking) && (
                        <button
                          className="btn btn-danger"
                          onClick={() => handleCancelBooking(booking.id)}
                          style={{ marginBottom: "10px", width: "100%" }}
                        >
                          Cancel Booking
                        </button>
                      )}

                      {canRateService(booking) && (
                        <button
                          className="btn btn-warning"
                          onClick={() => handleRateService(booking)}
                          style={{ width: "100%" }}
                        >
                          Rate Service
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <p>No bookings found matching your criteria.</p>
            {Object.values(filters).some((filter) => filter) && (
              <button className="btn btn-secondary" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      <OsrModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Booking #${selectedBooking?.id} Details`}
      >
        {selectedBooking && (
          <div>
            <div className="grid grid-2">
              <div>
                <h4>Booking Information</h4>
                <p>
                  <strong>ID:</strong> #{selectedBooking.id}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span
                    className={`badge ${getStatusBadgeClass(
                      selectedBooking.status
                    )}`}
                    style={{ marginLeft: "10px" }}
                  >
                    {selectedBooking.status}
                  </span>
                </p>
                <p>
                  <strong>Booking Date:</strong>{" "}
                  {new Date(selectedBooking.booking_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(selectedBooking.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <h4>Service Information</h4>
                <p>
                  <strong>Category:</strong>{" "}
                  {getCategoryName(selectedBooking.service_subcategory_id)}
                </p>
                <p>
                  <strong>Service:</strong>{" "}
                  {getSubcategoryName(selectedBooking.service_subcategory_id)}
                </p>
                <p>
                  <strong>Unit Type:</strong>{" "}
                  {getUnitConfigName(selectedBooking.unit_configuration_id)}
                </p>
                {selectedBooking.service_slot && (
                  <p>
                    <strong>Time Slot:</strong>{" "}
                    {selectedBooking.service_slot.start_time} -{" "}
                    {selectedBooking.service_slot.end_time}
                  </p>
                )}
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <h4>Pricing</h4>
              <p>
                <strong>Total Price:</strong> ₹{selectedBooking.total_price}
              </p>
            </div>

            {selectedBooking.special_instructions && (
              <div style={{ marginTop: "20px" }}>
                <h4>Special Instructions</h4>
                <p>{selectedBooking.special_instructions}</p>
              </div>
            )}

            {selectedBooking.rating && (
              <div style={{ marginTop: "20px" }}>
                <h4>Your Rating & Review</h4>
                <StarRating rating={selectedBooking.rating} readOnly={true} />
                {selectedBooking.review && (
                  <p style={{ marginTop: "10px" }}>
                    <em>"{selectedBooking.review}"</em>
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </OsrModal>

      {/* Rating Modal */}
      <OsrModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        title="Rate Your Service Experience"
      >
        {selectedBooking && (
          <form onSubmit={handleSubmitRating}>
            <div style={{ marginBottom: "20px" }}>
              <h4>
                {getSubcategoryName(selectedBooking.service_subcategory_id)}
              </h4>
              <p>
                Booking Date:{" "}
                {new Date(selectedBooking.booking_date).toLocaleDateString()}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Rating *</label>
              <StarRating
                rating={ratingData.rating}
                onRatingChange={(rating) =>
                  setRatingData((prev) => ({ ...prev, rating }))
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Review (Optional)</label>
              <textarea
                value={ratingData.review}
                onChange={(e) =>
                  setRatingData((prev) => ({ ...prev, review: e.target.value }))
                }
                className="form-control"
                rows="4"
                placeholder="Share your experience with this service..."
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowRatingModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={ratingData.rating === 0}
              >
                Submit Rating
              </button>
            </div>
          </form>
        )}
      </OsrModal>
    </div>
  );
};

export default MyBookings;
