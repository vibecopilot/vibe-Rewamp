import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { unitConfigurationService } from "./additionalServices";
import { Modal } from "antd";
import Osr from "./Osr";
import PropTypes from "prop-types";
import { FaEdit, FaTrash } from "react-icons/fa";
import Loading from "../../utils/Loading";

const UnitConfigurations = ({ onClose = null }) => {
  const [unitConfigs, setUnitConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    bedroom_count: "",
    bathroom_count: "",
    square_feet: "",
  });

  useEffect(() => {
    loadUnitConfigurations();
  }, []);

  const loadUnitConfigurations = async () => {
    try {
      setLoading(true);
      const response = await unitConfigurationService.getAll();
      // Ensure data is an array
      setUnitConfigs(Array.isArray(response.data) ? response.data : []);
      console.log("Loaded unit configs:", response.data);
    } catch (error) {
      console.error("Error loading unit configurations:", error);
      toast.error("Failed to load unit configurations");
      // Set empty array on error
      setUnitConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting unit config form data:", formData);

      if (editingConfig) {
        const response = await unitConfigurationService.update(
          editingConfig.id,
          formData
        );
        console.log("Update response:", response);
        toast.success("Unit configuration updated successfully");
      } else {
        const response = await unitConfigurationService.create(formData);
        console.log("Create response:", response);
        toast.success("Unit configuration created successfully");
      }

      setShowModal(false);
      setEditingConfig(null);
      setFormData({
        name: "",
        description: "",
        bedroom_count: "",
        bathroom_count: "",
        square_feet: "",
      });
      loadUnitConfigurations();
    } catch (error) {
      console.error("Error saving unit configuration:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      toast.error("Failed to save unit configuration");
    }
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      description: config.description || "",
      bedroom_count: config.bedroom_count || "",
      bathroom_count: config.bathroom_count || "",
      square_feet: config.square_feet || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this unit configuration?")
    ) {
      try {
        await unitConfigurationService.delete(id);
        toast.success("Unit configuration deleted successfully");
        loadUnitConfigurations();
      } catch (error) {
        console.error("Error deleting unit configuration:", error);
        toast.error("Failed to delete unit configuration");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openCreateModal = () => {
    setEditingConfig(null);
    setFormData({
      name: "",
      description: "",
      bedroom_count: "",
      bathroom_count: "",
      square_feet: "",
    });
    setShowModal(true);
  };

  if (loading) {
    return <Loading message="Loading unit configurations..." />;
  }

  return (
    <div className={onClose ? "w-full" : "flex"}>
      {!onClose && <Osr />}
      <div className="w-full mt-4 flex mx-3 mb-10 flex-col overflow-hidden">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h1>Unit Configurations</h1>
          <div style={{ display: "flex", gap: "10px" }}>
            {onClose && (
              <button
                className="btn btn-secondary"
                onClick={onClose}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#c82333",
                }}
              >
                Close
              </button>
            )}
            <button
              className="btn btn-primary !bg-gray-600"
              onClick={openCreateModal}
            >
              Add Configuration
            </button>
          </div>
        </div>

        {unitConfigs?.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                {/* <th>Bedrooms</th>
                <th>Bathrooms</th>
                <th>Square Feet</th> */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(unitConfigs) &&
                unitConfigs.map((config) => (
                  <tr key={config.id}>
                    <td>{config.name}</td>
                    <td>{config.description}</td>
                    {/* <td>{config.bedroom_count}</td>
                    <td>{config.bathroom_count}</td>
                    <td>{config.square_feet}</td> */}
                    <td>
                      <button
                        className="btn  btn-warning"
                        onClick={() => handleEdit(config)}
                        style={{ marginRight: "10px" }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(config.id)}
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
            No unit configurations found. Create your first configuration to get
            started.
          </p>
        )}
      </div>

      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        title={
          editingConfig
            ? "Edit Unit Configuration"
            : "Create Unit Configuration"
        }
        footer={null}
      >
        <form onSubmit={handleSubmit} style={{ padding: "20px 0" }}>
          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label
              className="form-label"
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-control"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
              required
              placeholder="e.g., 1 BHK, 2 BHK"
            />
          </div>

          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label
              className="form-label"
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-control"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
              rows="3"
              placeholder="Description of the unit configuration"
            />
          </div>

          {/* <div className="form-group" style={{ marginBottom: "15px" }}>
            <label
              className="form-label"
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Bedroom Count
            </label>
            <input
              type="number"
              name="bedroom_count"
              value={formData.bedroom_count}
              onChange={handleInputChange}
              className="form-control"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
              min="0"
            />
          </div>

          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label
              className="form-label"
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Bathroom Count
            </label>
            <input
              type="number"
              name="bathroom_count"
              value={formData.bathroom_count}
              onChange={handleInputChange}
              className="form-control"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
              min="0"
            />
          </div>

          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label
              className="form-label"
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Square Feet
            </label>
            <input
              type="number"
              name="square_feet"
              value={formData.square_feet}
              onChange={handleInputChange}
              className="form-control"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
              min="0"
            />
          </div> */}

          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end",
              marginTop: "20px",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              style={{
                padding: "8px 16px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "#F44336",
              }}
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: "#43A047",
                color: "white",
              }}
            >
              {editingConfig ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

UnitConfigurations.propTypes = {
  onClose: PropTypes.func,
};

export default UnitConfigurations;
