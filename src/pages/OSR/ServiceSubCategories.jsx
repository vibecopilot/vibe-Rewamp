import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  serviceCategoryService,
  serviceSubcategoryService,
} from "./additionalServices";
import OsrModal from "./OsrModal";
import PropTypes from "prop-types";
import { FaEdit, FaTrash } from "react-icons/fa";
import Loading from "../../utils/Loading";

const ServiceSubcategories = ({ onClose = null }) => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    service_category_id: "",
    duration_minutes: "",
    active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subcategoriesRes, categoriesRes] = await Promise.all([
        serviceSubcategoryService.getAll(),
        serviceCategoryService.getAll(),
      ]);

      // Ensure all data is arrays
      setSubcategories(
        Array.isArray(subcategoriesRes.data) ? subcategoriesRes.data : []
      );
      setCategories(
        Array.isArray(categoriesRes.data) ? categoriesRes.data : []
      );

      console.log("Loaded subcategories data:", {
        subcategories: subcategoriesRes.data,
        categories: categoriesRes.data,
      });
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
      // Set empty arrays on error
      setSubcategories([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  console.log("categories data", categories);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubcategory) {
        await serviceSubcategoryService.update(editingSubcategory.id, formData);
        toast.success("Subcategory updated successfully");
      } else {
        await serviceSubcategoryService.create(formData);
        toast.success("Subcategory created successfully");
      }

      setShowModal(false);
      setEditingSubcategory(null);
      setFormData({
        name: "",
        description: "",
        service_category_id: "",
        duration_minutes: "",
        active: true,
      });
      loadData();
    } catch (error) {
      console.error("Error saving subcategory:", error);
      toast.error("Failed to save subcategory");
    }
  };

  const handleEdit = (subcategory) => {
    console.log("Editing subcategory:", subcategory);
    setEditingSubcategory(subcategory);
    setFormData({
      name: subcategory.name,
      description: subcategory.description || "",
      service_category_id: subcategory.service_category_id || "", // Handle undefined case
      duration_minutes: subcategory.duration_minutes || "",
      active: subcategory.active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        await serviceSubcategoryService.delete(id);
        toast.success("Subcategory deleted successfully");
        loadData();
      } catch (error) {
        console.error("Error deleting subcategory:", error);
        toast.error("Failed to delete subcategory");
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

  const openCreateModal = () => {
    setEditingSubcategory(null);
    setFormData({
      name: "",
      description: "",
      service_category_id: "",
      duration_minutes: "",
      active: true,
    });
    setShowModal(true);
  };

  const getCategoryName = (categoryId) => {
    if (!categories || !Array.isArray(categories)) {
      console.log("Categories not loaded properly:", categories);
      return "Unknown";
    }
    
    if (categoryId === undefined || categoryId === null || categoryId === "") {
      console.log("Category ID is undefined/null/empty for subcategory");
      return "⚠️ No Category Assigned";
    }
    
    const category = categories.find((c) => c.id === categoryId);
    console.log("category map", category, "looking for ID:", categoryId, "in categories:", categories);
    return category ? category.name : "Unknown";
  };

  if (loading) {
    return <Loading message="Loading service subcategories..." />;
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
          <h1>Service Subcategories</h1>
          <div style={{ display: "flex", gap: "10px" }}>
            {onClose && (
              <button
                className="btn btn-secondary"
                onClick={onClose}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#dc3545",
                }}
              >
                Close
              </button>
            )}
            <button
              className="btn btn-primary !bg-gray-600"
              onClick={openCreateModal}
            >
              Add Subcategory
            </button>
          </div>
        </div>

        {Array.isArray(subcategories) && subcategories.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Description</th>
                <th>Duration (min)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subcategories.map((subcategory) => {
                console.log("Subcategory data:", subcategory);
                return (
                <tr key={subcategory.id}>
                  <td>{subcategory.name}</td>
                  <td style={{ 
                    color: (!subcategory.service_category_id) ? '#dc3545' : 'inherit',
                    fontWeight: (!subcategory.service_category_id) ? 'bold' : 'normal'
                  }}>
                    {getCategoryName(subcategory.service_category_id)}
                  </td>
                  <td>{subcategory.description}</td>
                  <td>{subcategory.duration_minutes}</td>
                  <td>
                    <span
                      className={`badge ${
                        subcategory.active
                          ? "badge-confirmed"
                          : "badge-cancelled"
                      }`}
                    >
                      {subcategory.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-warning"
                      onClick={() => handleEdit(subcategory)}
                      style={{ marginRight: "10px" }}
                      title={!subcategory.service_category_id ? "Assign a category to this subcategory" : "Edit subcategory"}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(subcategory.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>
            No service subcategories found. Create your first subcategory to get
            started.
          </p>
        )}
      </div>

      <OsrModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          editingSubcategory
            ? "Edit Service Subcategory"
            : "Create Service Subcategory"
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              name="service_category_id"
              value={formData.service_category_id}
              onChange={handleInputChange}
              className="form-control"
              required
            >
              <option value="">Select a category</option>
              {Array.isArray(categories) &&
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-control"
              required
              placeholder="e.g., Deep Cleaning, AC Repair"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-control"
              rows="3"
              placeholder="Description of the service subcategory"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Duration (minutes)</label>
            <input
              type="number"
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleInputChange}
              className="form-control"
              min="0"
              placeholder="Expected duration in minutes"
            />
          </div>

          <div className="form-group">
            <label
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
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
              {editingSubcategory ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </OsrModal>
    </div>
  );
};

ServiceSubcategories.propTypes = {
  onClose: PropTypes.func,
};

export default ServiceSubcategories;
