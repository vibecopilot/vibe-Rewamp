import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { serviceCategoryService } from "./additionalServices";
import OsrModal from "./OsrModal";
import PropTypes from "prop-types";
import { getItemInLocalStorage } from "../../utils/localStorage";
import { FaEdit, FaTrash } from "react-icons/fa";
import Loading from "../../utils/Loading";

const ServiceCategories = ({ onClose = null }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    active: true,
  });

  useEffect(() => {
    // Debug: Check if token exists
    const token = getItemInLocalStorage("TOKEN");
    console.log("Token available:", !!token);
    if (token) {
      console.log("Token preview:", token.substring(0, 20) + "...");
    }

    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await serviceCategoryService.getAll();

      // Ensure categories is always an array
      setCategories(response.data ? response.data : []);

      console.log("Loaded categories:", response.data);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load service categories");
      // Set empty array on error
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting form data:", formData);

      if (editingCategory) {
        const response = await serviceCategoryService.update(
          editingCategory.id,
          formData
        );
        console.log("Update response:", response);
        toast.success("Category updated successfully");
      } else {
        const response = await serviceCategoryService.create(formData);
        console.log("Create response:", response);
        toast.success("Category created successfully");
      }

      setShowModal(false);
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        icon: "",
        active: true,
      });
      loadCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      toast.error("Failed to save category");
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
      active: category.active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await serviceCategoryService.delete(id);
        toast.success("Category deleted successfully");
        loadCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error("Failed to delete category");
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
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      icon: "",
      active: true,
    });
    setShowModal(true);
  };

  if (loading) {
    return <Loading message="Loading service categories..." />;
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
          <h1>Service Categories</h1>
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
            <button className="btn btn-primary !bg-gray-600" onClick={openCreateModal}>
              Add Category
            </button>
          </div>
        </div>

        {Array.isArray(categories) && categories.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                {/* <th>Icon</th> */}
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.description}</td>
                  {/* <td>{category.icon}</td> */}
                  <td>
                    <span
                      className={`badge ${
                        category.active
                          ? "badge-confirmed"
                          : "badge-cancelled"
                      }`}
                    >
                      {category.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{new Date(category.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-warning"
                      onClick={() => handleEdit(category)}
                      style={{ marginRight: "10px" }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(category.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>
            No service categories found. Create your first category to get
            started.
          </p>
        )}
      </div>

      <OsrModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          editingCategory ? "Edit Service Category" : "Create Service Category"
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-control"
              required
              placeholder="e.g., Cleaning Services, Maintenance"
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
              placeholder="Description of the service category"
            />
          </div>

          {/* <div className="form-group">
            <label className="form-label">Icon</label>
            <input
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Icon class or emoji"
            />
          </div> */}

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
              {editingCategory ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </OsrModal>
    </div>
  );
};

ServiceCategories.propTypes = {
  onClose: PropTypes.func,
};

export default ServiceCategories;
