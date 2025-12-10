import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  serviceBookingService,
  serviceCategoryService,
  serviceSubcategoryService,
  unitConfigurationService,
} from "./additionalServices";
// import { debugUnitConfigurations } from "../../utils/debugUnitConfigs";
// import { sampleUnitConfigurations } from "../../utils/sampleUnitConfigs";
import OsrModal from "./OsrModal";
import Osr from "./Osr";
import { FaPlus } from "react-icons/fa";
import Loading from "../../utils/Loading";

const AdminBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [unitConfigs, setUnitConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    subcategory: "",
    dateFrom: "",
    dateTo: "",
  });

  const applyFilters = useCallback(() => {
    let filtered = [...bookings];

    if (filters.status) {
      filtered = filtered.filter(
        (booking) => booking.status === filters.status
      );
    }

    if (filters.category) {
      const categorySubcategories = subcategories
        .filter((sub) => sub.service_category_id === parseInt(filters.category))
        .map((sub) => sub.id);
      filtered = filtered.filter((booking) =>
        categorySubcategories.includes(booking.service_subcategory_id)
      );
    }

    if (filters.subcategory) {
      filtered = filtered.filter(
        (booking) =>
          booking.service_subcategory_id === parseInt(filters.subcategory)
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

    setFilteredBookings(filtered);
  }, [bookings, filters, subcategories]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    applyFilters();
  }, [applyFilters]);

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const indexOfLastItem = currentPage * perPage;
  const indexOfFirstItem = indexOfLastItem - perPage;
  const currentBookings = filteredBookings.slice(indexOfFirstItem,indexOfLastItem);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Debug unit configurations first
      console.log("=== Starting Debug ===");
      // await debugUnitConfigurations();
      
      const [bookingsRes, subcategoriesRes, categoriesRes, unitConfigsRes] =
        await Promise.all([
          serviceBookingService.getAll(currentPage, perPage),
          serviceSubcategoryService.getAll(),
          serviceCategoryService.getAll(),
          unitConfigurationService.getAll(),
        ]);
      
      console.log("Raw API responses:");
      console.log("Bookings:", bookingsRes.data);
      console.log("Unit Configs:", unitConfigsRes.data);
      
      // setBookings(bookingsRes.data);
      setBookings(bookingsRes?.data?.service_bookings || []);
      setTotalCount(bookingsRes?.data?.total_count || 0);
      setSubcategories(subcategoriesRes.data);
      setCategories(categoriesRes.data);
      
      // Use sample data if API returns empty or has issues
      if (Array.isArray(unitConfigsRes.data) && unitConfigsRes.data.length > 0) {
        setUnitConfigs(unitConfigsRes.data);
      } else {
        console.log("Using sample unit configurations for testing");
        // setUnitConfigs(sampleUnitConfigurations);
      }
      
      // Debug: Log booking data structure
      if (bookingsRes.data && bookingsRes.data.length > 0) {
        console.log("=== Booking Data Analysis ===");
        console.log("First booking data structure:", bookingsRes.data[0]);
        console.log("Unit configuration ID in first booking:", bookingsRes.data[0].unit_configuration_id);
        console.log("Type of unit_configuration_id:", typeof bookingsRes.data[0].unit_configuration_id);
        
        // Check all bookings for unit_configuration_id patterns
        const unitConfigIds = bookingsRes.data.map(booking => ({
          booking_id: booking.id,
          unit_config_id: booking.unit_configuration_id,
          type: typeof booking.unit_configuration_id,
          has_unit_config_name: !!booking.unit_configuration_name,
          unit_config_name: booking.unit_configuration_name,
          has_nested_unit_config: !!booking.unit_configuration,
          nested_name: booking.unit_configuration?.name
        }));
        console.log("All booking unit config IDs:", unitConfigIds);
        console.log("=== End Booking Analysis ===");
      }
      
      // Debug: Log unit configs structure
      if (unitConfigsRes.data && unitConfigsRes.data.length > 0) {
        console.log("First unit config data structure:", unitConfigsRes.data[0]);
        console.log("Available unit config IDs:", unitConfigsRes.data.map(u => u.id));
      } else {
        console.log("No unit configurations found!");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      if (newStatus === "cancelled") {
        await serviceBookingService.cancel(bookingId);
      } else if (newStatus === "completed") {
        await serviceBookingService.complete(bookingId);
      } else {
        await serviceBookingService.update(bookingId, { status: newStatus });
      }

      toast.success(`Booking ${newStatus} successfully`);
      loadData();
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
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
      category: "",
      subcategory: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleCreateBooking = () => {
    navigate('/service-booking');
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

  const getUnitConfigName = (unitConfigId, booking = null) => {
    // Handle null, undefined, or empty values
    if (!unitConfigId && unitConfigId !== 0) {
      console.log("No unit config ID provided:", unitConfigId);
      return "Not Specified";
    }
    
    // If booking object is provided, try to get name directly first
    if (booking) {
      if (booking.unit_configuration_name) {
        console.log("Found unit config name directly in booking:", booking.unit_configuration_name);
        return booking.unit_configuration_name;
      }
      if (booking.unit_configuration && booking.unit_configuration.name) {
        console.log("Found unit config name in nested object:", booking.unit_configuration.name);
        return booking.unit_configuration.name;
      }
      console.log("No direct unit config name found in booking object");
    }
    
    console.log("=== Unit Config Debug ===");
    console.log("Looking for unit config ID:", unitConfigId, "Type:", typeof unitConfigId);
    console.log("Available unit configs count:", unitConfigs.length);
    console.log("Unit configs data:", unitConfigs);
    
    // Handle empty array
    if (!Array.isArray(unitConfigs) || unitConfigs.length === 0) {
      console.log("No unit configurations available");
      return `No Config (ID: ${unitConfigId})`;
    }
    
    // Log all available IDs for comparison
    const availableIds = unitConfigs.map(u => ({ id: u.id, type: typeof u.id, name: u.name }));
    console.log("Available unit config IDs and types:", availableIds);
    
    const unitConfig = unitConfigs.find((u) => {
      const match = u.id == unitConfigId; // Using == for loose comparison
      console.log(`Comparing config ID ${u.id} (${typeof u.id}) with ${unitConfigId} (${typeof unitConfigId}): ${match}`);
      return match;
    });
    
    console.log("Found unit config:", unitConfig);
    console.log("=== End Debug ===");
    
    if (unitConfig) {
      return unitConfig.name;
    } else {
      // Enhanced fallback with better debugging
      console.log(`Unit configuration not found for ID: ${unitConfigId}`);
      return `Unknown Config (ID: ${unitConfigId})`;
    }
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

  const getAvailableSubcategories = () => {
    if (!filters.category) return subcategories;
    return subcategories.filter(
      (sub) => sub.service_category_id === parseInt(filters.category)
    );
  };

//   if (loading) {
//     return <Loading message="Loading bookings..." />;
//   }

  return (
    <div className="flex h-screen">
      <Osr />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto">
          {loading ? (
            <Loading />
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h1>All Service Bookings</h1>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      await debugUnitConfigurations();
                      console.log("=== Manual Test ===");
                      console.log("Testing unit config lookup:");
                      console.log("Test ID 1:", getUnitConfigName(1));
                      console.log("Test ID 2:", getUnitConfigName(2));
                      console.log("Test ID 3:", getUnitConfigName(3));
                      console.log("Test ID '1':", getUnitConfigName("1"));
                      console.log("Test ID '2':", getUnitConfigName("2"));
                      console.log("Test ID null:", getUnitConfigName(null));
                      console.log(
                        "Test ID undefined:",
                        getUnitConfigName(undefined)
                      );
                      console.log("Current unitConfigs state:", unitConfigs);

                      // Test with a sample booking object
                      const sampleBooking = {
                        unit_configuration_id: 2,
                        unit_configuration_name: "Direct Name Test",
                        unit_configuration: { name: "Nested Name Test" },
                      };
                      console.log(
                        "Test with sample booking:",
                        getUnitConfigName(2, sampleBooking)
                      );
                      console.log("=== End Manual Test ===");
                    }}
                    className="btn btn-secondary"
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Debug Unit Configs
                  </button>
                  <button
                    onClick={handleCreateBooking}
                    className="btn btn-primary flex items-center gap-2"
                    style={{
                      backgroundColor: "#3b82f6",
                      color: "white",
                      padding: "10px 20px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    <FaPlus size={16} />
                    Book Service
                  </button>
                </div>
              </div>

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
                    <label className="form-label">Category</label>
                    <select
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                      className="form-control"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subcategory</label>
                    <select
                      name="subcategory"
                      value={filters.subcategory}
                      onChange={handleFilterChange}
                      className="form-control"
                    >
                      <option value="">All Subcategories</option>
                      {getAvailableSubcategories().map((subcategory) => (
                        <option key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </option>
                      ))}
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

                  <div
                    className="form-group"
                    style={{ display: "flex", alignItems: "end" }}
                  >
                    <button
                      className="btn btn-secondary"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Summary */}
              <div style={{ marginBottom: "20px" }}>
                <p>
                  Showing {Math.min(indexOfLastItem, filteredBookings.length)}{" "}
                  of {filteredBookings.length} filtered bookings (Total:{" "}
                  {bookings.length})
                </p>
              </div>

              {/* Bookings Table */}
              {currentBookings.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Category</th>
                      <th>Service</th>
                      <th>Date & Time</th>
                      <th>Unit Type</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>#{booking.id}</td>
                        <td>{booking.user_id}</td>
                        <td>
                          {getCategoryName(booking.service_subcategory_id)}
                        </td>
                        <td>
                          {getSubcategoryName(booking.service_subcategory_id)}
                        </td>
                        <td>
                          {new Date(booking.booking_date).toLocaleDateString()}
                          {booking.service_slot && (
                            <div style={{ fontSize: "12px", color: "#666" }}>
                              {booking.service_slot.start_time} -{" "}
                              {booking.service_slot.end_time}
                            </div>
                          )}
                        </td>
                        <td>
                          {getUnitConfigName(
                            booking.unit_configuration_id,
                            booking
                          )}
                        </td>
                        <td>₹{booking.total_amount || booking.price || 0}</td>
                        <td>
                          <span
                            className={`badge ${getStatusBadgeClass(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => viewBookingDetails(booking)}
                            style={{ marginRight: "5px", marginBottom: "5px" }}
                          >
                            View
                          </button>

                          {booking.status === "pending" && (
                            <>
                              <button
                                className="btn btn-success"
                                onClick={() =>
                                  handleStatusUpdate(booking.id, "confirmed")
                                }
                                style={{
                                  marginRight: "5px",
                                  marginBottom: "5px",
                                }}
                              >
                                Confirm
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() =>
                                  handleStatusUpdate(booking.id, "cancelled")
                                }
                                style={{ marginBottom: "5px" }}
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {booking.status === "confirmed" && (
                            <button
                              className="btn btn-warning"
                              onClick={() =>
                                handleStatusUpdate(booking.id, "completed")
                              }
                              style={{ marginBottom: "5px" }}
                            >
                              Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No bookings found matching the current filters.</p>
              )}

              {/* Pagination Controls */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "20px",
                }}
              >
                {/* Rows per page selector */}
                <div>
                  <label htmlFor="rowsPerPage" style={{ marginRight: "8px" }}>
                    Rows per page:
                  </label>
                  <select
                    id="rowsPerPage"
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(parseInt(e.target.value));
                      setCurrentPage(1); // Reset to first page
                    }}
                  >
                    {[10, 25, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Range display */}
                <div>
                  {filteredBookings.length > 0 ? (
                    <span>
                      {indexOfFirstItem + 1} -{" "}
                      {Math.min(indexOfLastItem, filteredBookings.length)} of{" "}
                      {filteredBookings.length}
                    </span>
                  ) : (
                    <span>0 of 0</span>
                  )}
                </div>

                {/* Navigation arrows */}
                <div>
                  <button
                    className="btn btn-light"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    style={{ marginRight: "5px" }}
                  >
                    ◀
                  </button>
                  <button
                    className="btn btn-light"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        prev < Math.ceil(filteredBookings.length / perPage)
                          ? prev + 1
                          : prev
                      )
                    }
                    disabled={
                      currentPage >=
                      Math.ceil(filteredBookings.length / perPage)
                    }
                  >
                    ▶
                  </button>
                </div>
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
                          <strong>User ID:</strong> {selectedBooking.user_id}
                        </p>
                        <p>
                          <strong>Booking Date:</strong>{" "}
                          {new Date(
                            selectedBooking.booking_date
                          ).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Created:</strong>{" "}
                          {new Date(
                            selectedBooking.created_at
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <h4>Service Information</h4>
                        <p>
                          <strong>Category:</strong>{" "}
                          {getCategoryName(
                            selectedBooking.service_subcategory_id
                          )}
                        </p>
                        <p>
                          <strong>Service:</strong>{" "}
                          {getSubcategoryName(
                            selectedBooking.service_subcategory_id
                          )}
                        </p>
                        <p>
                          <strong>Unit Type:</strong>{" "}
                          {getUnitConfigName(
                            selectedBooking.unit_configuration_id,
                            selectedBooking
                          )}
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
                        <strong>Total Price:</strong> ₹
                        {selectedBooking.total_amount ||
                          selectedBooking.price ||
                          0}
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
                        <h4>Rating & Review</h4>
                        <p>
                          <strong>Rating:</strong> {selectedBooking.rating}/5
                        </p>
                        {selectedBooking.review && (
                          <p>
                            <strong>Review:</strong> {selectedBooking.review}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </OsrModal>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
