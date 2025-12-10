import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  serviceCategoryService,
  serviceSlotService,
  serviceSubcategoryService,
} from "./additionalServices";
import OsrModal from "./OsrModal";
import PropTypes from "prop-types";
import { FaEdit, FaTrash } from "react-icons/fa";
import Loading from "../../utils/Loading";

const ServiceSlots = ({ onClose = null }) => {
  const [slots, setSlots] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState({
    service_subcategory_id: "",
    start_hour: "",
    start_minute: "",
    end_hour: "",
    end_minute: "",
    max_bookings: 1,
    is_active: true,
  });
  const [bulkFormData, setBulkFormData] = useState({
    service_subcategory_id: "",
    start_hour: "",
    start_minute: "",
    end_hour: "",
    end_minute: "",
    max_bookings: 1,
  });

  useEffect(() => {
    const removeDuplicateSlots = (slots) => {
      if (!Array.isArray(slots)) return [];
      
      const unique = [];
      const seenIds = new Set();
      
      for (const slot of slots) {
        if (!seenIds.has(slot.id)) {
          seenIds.add(slot.id);
          unique.push(slot);
        }
      }
      
      return unique;
    };

    const loadInitialData = async () => {
      try {
        setLoading(true);

        // First load categories and subcategories
        const [subcategoriesRes, categoriesRes] = await Promise.all([
          serviceSubcategoryService.getAll(),
          serviceCategoryService.getAll(),
        ]);

        // Ensure all data is arrays
        const subcategoriesData = Array.isArray(subcategoriesRes.data)
          ? subcategoriesRes.data
          : [];
        const categoriesData = Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : [];

        setSubcategories(subcategoriesData);
        setCategories(categoriesData);

        // Try to load all slots at once first
        let allSlots = [];
        try {
          const allSlotsRes = await serviceSlotService.getAll();
          const slotsData = Array.isArray(allSlotsRes.data) ? allSlotsRes.data : [];
          allSlots = removeDuplicateSlots(slotsData);
          console.log("Loaded all slots at once:", allSlots);
        } catch (error) {
          console.warn("Failed to load all slots at once, trying individual subcategory loading:", error);
          
          // Fallback: load slots for each subcategory individually
          if (subcategoriesData.length > 0) {
            const slotPromises = subcategoriesData.map((subcategory) =>
              serviceSlotService
                .getBySubcategoryId(subcategory.id)
                .catch((error) => {
                  console.warn(
                    `Failed to load slots for subcategory ${subcategory.id}:`,
                    error
                  );
                  return { data: [] };
                })
            );

            const slotResults = await Promise.all(slotPromises);
            const flatSlots = slotResults.flatMap((result) =>
              Array.isArray(result.data) ? result.data : []
            );

            // Remove duplicates using our utility function
            allSlots = removeDuplicateSlots(flatSlots);
          }
        }

        setSlots(allSlots);

        console.log("Final loaded slots data:", {
          slots: allSlots,
          subcategories: subcategoriesData,
          categories: categoriesData,
        });
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
        // Set empty arrays on error
        setSlots([]);
        setSubcategories([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const loadData = async () => {
    const removeDuplicateSlots = (slots) => {
      if (!Array.isArray(slots)) return [];
      
      const unique = [];
      const seenIds = new Set();
      
      for (const slot of slots) {
        if (!seenIds.has(slot.id)) {
          seenIds.add(slot.id);
          unique.push(slot);
        }
      }
      
      return unique;
    };

    try {
      setLoading(true);

      // First load categories and subcategories
      const [subcategoriesRes, categoriesRes] = await Promise.all([
        serviceSubcategoryService.getAll(),
        serviceCategoryService.getAll(),
      ]);

      // Ensure all data is arrays
      const subcategoriesData = Array.isArray(subcategoriesRes.data)
        ? subcategoriesRes.data
        : [];
      const categoriesData = Array.isArray(categoriesRes.data)
        ? categoriesRes.data
        : [];

      setSubcategories(subcategoriesData);
      setCategories(categoriesData);

      // Try to load all slots at once first
      let allSlots = [];
      try {
        const allSlotsRes = await serviceSlotService.getAll();
        const slotsData = Array.isArray(allSlotsRes.data) ? allSlotsRes.data : [];
        allSlots = removeDuplicateSlots(slotsData);
        console.log("Loaded all slots at once:", allSlots);
      } catch (error) {
        console.warn("Failed to load all slots at once, trying individual subcategory loading:", error);
        
        // Fallback: load slots for each subcategory individually
        if (subcategoriesData.length > 0) {
          const slotPromises = subcategoriesData.map((subcategory) =>
            serviceSlotService
              .getBySubcategoryId(subcategory.id)
              .catch((error) => {
                console.warn(
                  `Failed to load slots for subcategory ${subcategory.id}:`,
                  error
                );
                return { data: [] };
              })
          );

          const slotResults = await Promise.all(slotPromises);
          const flatSlots = slotResults.flatMap((result) =>
            Array.isArray(result.data) ? result.data : []
          );

          // Remove duplicates using our utility function
          allSlots = removeDuplicateSlots(flatSlots);
        }
      }

      setSlots(allSlots);

      console.log("Final loaded slots data:", {
        slots: allSlots,
        subcategories: subcategoriesData,
        categories: categoriesData,
      });
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
      // Set empty arrays on error
      setSlots([]);
      setSubcategories([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  console.log("sub-Cat", subcategories);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.service_subcategory_id || !formData.start_hour || !formData.start_minute || !formData.end_hour || !formData.end_minute) {
        toast.error("Please fill in all required fields.");
        return;
      }

      // Format time as HH:MM
      const startTime = `${formData.start_hour.padStart(2, '0')}:${formData.start_minute.padStart(2, '0')}`;
      const endTime = `${formData.end_hour.padStart(2, '0')}:${formData.end_minute.padStart(2, '0')}`;

      const slotData = {
        service_subcategory_id: formData.service_subcategory_id,
        start_time: startTime,
        end_time: endTime,
        max_bookings: formData.max_bookings,
        active: formData.is_active,
      };

      if (editingSlot) {
        await serviceSlotService.update(editingSlot.id, slotData);
        toast.success("Slot updated successfully");
      } else {
        await serviceSlotService.create(slotData);
        toast.success("Slot created successfully");
      }

      setShowModal(false);
      setEditingSlot(null);
      resetFormData();
      loadData();
    } catch (error) {
      console.error("Error saving slot:", error);
      toast.error("Failed to save slot");
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate form data
      const {
        service_subcategory_id,
        start_hour,
        start_minute,
        end_hour,
        end_minute,
        max_bookings,
      } = bulkFormData;

      if (!service_subcategory_id || !start_hour || !start_minute || !end_hour || !end_minute) {
        toast.error("Please fill in all required fields.");
        return;
      }

      // Format time as HH:MM
      const startTime = `${start_hour.padStart(2, '0')}:${start_minute.padStart(2, '0')}`;
      const endTime = `${end_hour.padStart(2, '0')}:${end_minute.padStart(2, '0')}`;

      const slotData = {
        service_subcategory_id: service_subcategory_id,
        start_time: startTime,
        end_time: endTime,
        max_bookings: max_bookings,
        active: true,
      };

      await serviceSlotService.create(slotData);
      toast.success("Slot created successfully");

      setShowBulkModal(false);
      setBulkFormData({
        service_subcategory_id: "",
        start_hour: "",
        start_minute: "",
        end_hour: "",
        end_minute: "",
        max_bookings: 1,
      });
      loadData();
    } catch (error) {
      console.error("Error creating slot:", error);
      toast.error("Failed to create slot");
    }
  };

  const handleEdit = (slot) => {
    console.log("Editing slot:", slot);
    console.log("Available subcategories:", subcategories);
    console.log("Available categories:", categories);
    
    setEditingSlot(slot);

    // Parse start and end times - handle both 24-hour and 12-hour formats
    let startHour = "";
    let startMinute = "";
    let endHour = "";
    let endMinute = "";

    const parseTime = (timeStr) => {
      if (!timeStr) return { hour: "", minute: "" };
      
      // Handle 12-hour format (e.g., "12:10 AM", "02:04 AM")
      if (timeStr.includes("AM") || timeStr.includes("PM")) {
        const [time, period] = timeStr.split(" ");
        const [hourStr, minuteStr] = time.split(":");
        let hour = parseInt(hourStr);
        const minute = parseInt(minuteStr);
        
        // Convert to 24-hour format
        if (period === "AM" && hour === 12) {
          hour = 0;
        } else if (period === "PM" && hour !== 12) {
          hour += 12;
        }
        
        return {
          hour: hour.toString(),
          minute: minute.toString()
        };
      } else {
        // Handle 24-hour format (e.g., "14:30")
        const [hourStr, minuteStr] = timeStr.split(":");
        return {
          hour: hourStr || "",
          minute: minuteStr || ""
        };
      }
    };

    if (slot.start_time) {
      const parsed = parseTime(slot.start_time);
      startHour = parsed.hour;
      startMinute = parsed.minute;
    }

    if (slot.end_time) {
      const parsed = parseTime(slot.end_time);
      endHour = parsed.hour;
      endMinute = parsed.minute;
    }

    const editFormData = {
      service_subcategory_id: slot.service_subcategory_id || slot.subcategory_id,
      start_hour: startHour,
      start_minute: startMinute,
      end_hour: endHour,
      end_minute: endMinute,
      max_bookings: slot.max_bookings,
      is_active: slot.is_active || slot.active, // Handle both field names
    };
    
    console.log("Setting form data for edit:", editFormData);
    setFormData(editFormData);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this slot?")) {
      try {
        await serviceSlotService.delete(id);
        toast.success("Slot deleted successfully");
        loadData();
      } catch (error) {
        console.error("Error deleting slot:", error);
        toast.error("Failed to delete slot");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBulkInputChange = (e) => {
    const { name, value } = e.target;
    setBulkFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFormData = () => {
    setFormData({
      service_subcategory_id: "",
      start_hour: "",
      start_minute: "",
      end_hour: "",
      end_minute: "",
      max_bookings: 1,
      is_active: true,
    });
  };

  const openCreateModal = () => {
    setEditingSlot(null);
    resetFormData();
    setShowModal(true);
  };

  const getSubcategoryName = (slot) => {
    // First try to get from slot.subcategory if available
    if (slot.subcategory?.name) {
      return slot.subcategory.name;
    }
    
    // Otherwise, look up by ID
    const subcategoryId = slot.service_subcategory_id || slot.subcategory_id;
    if (!Array.isArray(subcategories) || !subcategoryId) return "Unknown";
    const subcategory = subcategories.find((s) => s.id === subcategoryId);
    return subcategory ? subcategory.name : "Unknown";
  };

  const getCategoryName = (categoryId) => {
    if (!Array.isArray(categories)) return "Unknown";
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Unknown";
  };

  const getCategoryNameBySubcategoryId = (slot) => {
    // First try to get from slot.subcategory if available
    if (slot.subcategory?.category_name) {
      return slot.subcategory.category_name;
    }
    
    const subcategoryId = slot.service_subcategory_id || slot.subcategory_id;
    if (!Array.isArray(subcategories) || !Array.isArray(categories) || !subcategoryId)
      return "Unknown";
    const subcategory = subcategories.find((s) => s.id === subcategoryId);
    if (!subcategory) return "Unknown";
    const category = categories.find(
      (c) => c.id === subcategory.service_category_id
    );
    return category ? category.name : "Unknown";
  };

  if (loading) {
    return <Loading message="Loading service slots..." />;
  }

  return (
    <div>
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h1>Service Slots</h1>
          <div>
            {onClose && (
              <button
                className="btn btn-secondary"
                onClick={onClose}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#dc3545",
                  marginRight: "10px",
                }}
              >
                Close
              </button>
            )}
            {/* <button
              className="btn btn-secondary"
              onClick={() => setShowBulkModal(true)}
              style={{ marginRight: "10px" }}
            >
              Add Slot
            </button> */}
            <button
              className="btn btn-primary !bg-gray-700"
              onClick={openCreateModal}
            >
              Add Slot
            </button>
          </div>
        </div>

        {Array.isArray(slots) && slots.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Max Bookings</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id}>
                  <td>{getCategoryNameBySubcategoryId(slot)}</td>
                  <td>{getSubcategoryName(slot)}</td>
                  <td>{slot.start_time}</td>
                  <td>{slot.end_time}</td>
                  <td>{slot.max_bookings}</td>
                  <td>
                    <span
                      className={`badge ${
                        slot.is_active || slot.active
                          ? "badge-confirmed"
                          : "badge-cancelled"
                      }`}
                    >
                      {slot.is_active || slot.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-warning"
                      onClick={() => handleEdit(slot)}
                      style={{ marginRight: "10px" }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(slot.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No service slots found. Create your first slot to get started.</p>
        )}
      </div>

      {/* Single Slot Modal */}
      <OsrModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSlot ? "Edit Service Slot" : "Create Service Slot"}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Subcategory *</label>
            <select
              name="service_subcategory_id"
              value={formData.service_subcategory_id}
              onChange={handleInputChange}
              className="form-control"
              required
            >
              <option value="">Select a subcategory</option>
              {Array.isArray(subcategories) &&
                subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {getCategoryName(subcategory.service_category_id)} - {subcategory.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Start Time *</label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <select
                name="start_hour"
                value={formData.start_hour}
                onChange={handleInputChange}
                className="form-control"
                style={{ flex: "1" }}
                required
              >
                <option value="">Hour</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i.toString()}>
                    {i.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              <span>:</span>
              <select
                name="start_minute"
                value={formData.start_minute}
                onChange={handleInputChange}
                className="form-control"
                style={{ flex: "1" }}
                required
              >
                <option value="">Minute</option>
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i.toString()}>
                    {i.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">End Time *</label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <select
                name="end_hour"
                value={formData.end_hour}
                onChange={handleInputChange}
                className="form-control"
                style={{ flex: "1" }}
                required
              >
                <option value="">Hour</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i.toString()}>
                    {i.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              <span>:</span>
              <select
                name="end_minute"
                value={formData.end_minute}
                onChange={handleInputChange}
                className="form-control"
                style={{ flex: "1" }}
                required
              >
                <option value="">Minute</option>
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i.toString()}>
                    {i.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Max Bookings</label>
            <input
              type="number"
              name="max_bookings"
              value={formData.max_bookings}
              onChange={handleInputChange}
              className="form-control"
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
              />
              Active
            </label>
          </div>

          <div
            style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingSlot ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </OsrModal>

      {/* Quick Add Slot Modal */}
      <OsrModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Create Service Slot"
      >
        <form onSubmit={handleBulkSubmit}>
          <div className="form-group">
            <label className="form-label">Subcategory *</label>
            <select
              name="service_subcategory_id"
              value={bulkFormData.service_subcategory_id}
              onChange={handleBulkInputChange}
              className="form-control"
              required
            >
              <option value="">Select a subcategory</option>
              {Array.isArray(subcategories) &&
                subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {getCategoryName(subcategory.service_category_id)} - {subcategory.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Start Time *</label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <select
                name="start_hour"
                value={bulkFormData.start_hour}
                onChange={handleBulkInputChange}
                className="form-control"
                style={{ flex: "1" }}
                required
              >
                <option value="">Hour</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i.toString()}>
                    {i.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              <span>:</span>
              <select
                name="start_minute"
                value={bulkFormData.start_minute}
                onChange={handleBulkInputChange}
                className="form-control"
                style={{ flex: "1" }}
                required
              >
                <option value="">Minute</option>
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i.toString()}>
                    {i.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">End Time *</label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <select
                name="end_hour"
                value={bulkFormData.end_hour}
                onChange={handleBulkInputChange}
                className="form-control"
                style={{ flex: "1" }}
                required
              >
                <option value="">Hour</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i.toString()}>
                    {i.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              <span>:</span>
              <select
                name="end_minute"
                value={bulkFormData.end_minute}
                onChange={handleBulkInputChange}
                className="form-control"
                style={{ flex: "1" }}
                required
              >
                <option value="">Minute</option>
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i.toString()}>
                    {i.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Max Bookings per Slot</label>
            <input
              type="number"
              name="max_bookings"
              value={bulkFormData.max_bookings}
              onChange={handleBulkInputChange}
              className="form-control"
              min="1"
              required
            />
          </div>

          <div
            style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowBulkModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Slot
            </button>
          </div>
        </form>
      </OsrModal>
    </div>
  );
};

ServiceSlots.propTypes = {
  onClose: PropTypes.func,
};

export default ServiceSlots;
