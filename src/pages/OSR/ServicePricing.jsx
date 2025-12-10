import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  serviceCategoryService,
  servicePricingService,
  serviceSubcategoryService,
  unitConfigurationService,
} from "./additionalServices";
import OsrModal from "./OsrModal";
import PropTypes from "prop-types";
import { FaEdit, FaTrash } from "react-icons/fa";
import Loading from "../../utils/Loading";

const ServicePricing = ({ onClose = null }) => {
  const [pricings, setPricings] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [unitConfigs, setUnitConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingPricing, setEditingPricing] = useState(null);
  const [formData, setFormData] = useState({
    service_subcategory_id: "",
    unit_configuration_id: "",
    price: "",
    discount_percentage: 0,
    active: true,
  });
  const [bulkFormData, setBulkFormData] = useState({
    service_subcategory_id: "",
    pricing_data: [],
  });

  console.log("formDta", formData);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // First load categories, subcategories, and unit configs
      const [subcategoriesRes, categoriesRes, unitConfigsRes] =
        await Promise.all([
          serviceSubcategoryService.getAll(),
          serviceCategoryService.getAll(),
          unitConfigurationService.getAll(),
        ]);

      // Ensure all data is arrays
      const subcategoriesData = Array.isArray(subcategoriesRes.data)
        ? subcategoriesRes.data
        : [];
      const categoriesData = Array.isArray(categoriesRes.data)
        ? categoriesRes.data
        : [];
      const unitConfigsData = Array.isArray(unitConfigsRes.data)
        ? unitConfigsRes.data
        : [];

      setSubcategories(subcategoriesData);
      setCategories(categoriesData);
      setUnitConfigs(unitConfigsData);

      // Then load pricing for each subcategory
      let allPricings = [];
      if (subcategoriesData.length > 0) {
        const pricingPromises = subcategoriesData.map((subcategory) =>
          servicePricingService
            .getBySubcategoryId(subcategory.id)
            .catch((error) => {
              console.warn(
                `Failed to load pricing for subcategory ${subcategory.id}:`,
                error
              );
              return { data: [] };
            })
        );

        const pricingResults = await Promise.all(pricingPromises);
        allPricings = pricingResults.flatMap((result) =>
          Array.isArray(result.data) ? result.data : []
        );

        // Remove duplicates based on pricing ID
        const uniquePricings = allPricings.filter(
          (pricing, index, self) =>
            index === self.findIndex((p) => p.id === pricing.id)
        );

        setPricings(uniquePricings);
      } else {
        setPricings([]);
      }

      console.log("Loaded data:", {
        pricings: allPricings,
        subcategories: subcategoriesData,
        categories: categoriesData,
        unitConfigs: unitConfigsData,
      });
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
      // Set empty arrays on error
      setPricings([]);
      setSubcategories([]);
      setCategories([]);
      setUnitConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPricing) {
        await servicePricingService.update(editingPricing.id, formData);
        toast.success("Pricing updated successfully");
      } else {
        await servicePricingService.create(formData);
        toast.success("Pricing created successfully");
      }

      setShowModal(false);
      setEditingPricing(null);
      resetFormData();
      loadData();
    } catch (error) {
      console.error("Error saving pricing:", error);
      toast.error("Failed to save pricing");
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    try {
      await servicePricingService.bulkCreate(bulkFormData);
      toast.success("Bulk pricing created successfully");
      setShowBulkModal(false);
      setBulkFormData({
        service_subcategory_id: "",
        pricing_data: [],
      });
      loadData();
    } catch (error) {
      console.error("Error creating bulk pricing:", error);
      toast.error("Failed to create bulk pricing");
    }
  };

  const handleEdit = (pricing) => {
    setEditingPricing(pricing);
    setFormData({
      service_subcategory_id: pricing.service_subcategory_id,
      unit_configuration_id: pricing.unit_configuration_id,
      price: pricing.price,
      discount_percentage: pricing.discount_percentage || 0,
      active: pricing.active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this pricing?")) {
      try {
        await servicePricingService.delete(id);
        toast.success("Pricing deleted successfully");
        loadData();
      } catch (error) {
        console.error("Error deleting pricing:", error);
        toast.error("Failed to delete pricing");
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
      unit_configuration_id: "",
      price: "",
      discount_percentage: 0,
      active: true,
    });
  };

  const openCreateModal = () => {
    setEditingPricing(null);
    resetFormData();
    setShowModal(true);
  };

  const openBulkModal = () => {
    setBulkFormData({
      service_subcategory_id: "",
      pricing_data: Array.isArray(unitConfigs)
        ? unitConfigs.map((config) => ({
            unit_configuration_id: config.id,
            price: "",
            discount_percentage: 0,
          }))
        : [],
    });
    setShowBulkModal(true);
  };

  const updateBulkPricingData = (index, field, value) => {
    setBulkFormData((prev) => ({
      ...prev,
      pricing_data: prev.pricing_data.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const getSubcategoryName = (subcategoryId) => {
    if (!Array.isArray(subcategories)) return "Unknown";
    const subcategory = subcategories.find((s) => s.id === subcategoryId);
    return subcategory ? subcategory.name : "Unknown";
  };

  const getCategoryName = (subcategoryId) => {
    if (!Array.isArray(subcategories) || !Array.isArray(categories))
      return "Unknown";
    const subcategory = subcategories.find((s) => s.id === subcategoryId);
    if (!subcategory) return "Unknown";
    const category = categories.find(
      (c) => c.id === subcategory.service_category_id
    );
    return category ? category.name : "Unknown";
  };

  const getUnitConfigName = (unitConfigId) => {
    if (!Array.isArray(unitConfigs)) return "Unknown";
    const unitConfig = unitConfigs.find((u) => u.id === unitConfigId);
    return unitConfig ? unitConfig.name : "Unknown";
  };

  const calculateFinalPrice = (basePrice, discount) => {
    const discountAmount = (basePrice * discount) / 100;
    return basePrice - discountAmount;
  };

  if (loading) {
    return <Loading message="Loading service pricing..." />;
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
          <h1>Service Pricing</h1>
          <div>
            {onClose && (
              <button
                className="btn btn-secondary"
                onClick={onClose}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#c82333",
                  marginRight: "10px",
                }}
              >
                Close
              </button>
            )}
            <button
              className="btn btn-secondary"
              onClick={openBulkModal}
              style={{ marginRight: "10px" }}
            >
              Bulk Pricing
            </button>
            <button
              className="btn btn-primary !bg-gray-800"
              onClick={openCreateModal}
            >
              Add Pricing
            </button>
          </div>
        </div>

        {Array.isArray(pricings) && pricings.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Unit Type</th>
                <th>Base Price</th>
                {/* <th>Discount %</th> */}
                {/* <th>Final Price</th> */}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pricings.map((pricing) => (
                <tr key={pricing.id}>
                  <td>{getCategoryName(pricing.service_subcategory_id)}</td>
                  <td>{getSubcategoryName(pricing.service_subcategory_id)}</td>
                  <td>{getUnitConfigName(pricing.unit_configuration_id)}</td>
                  <td>₹{pricing.final_price}</td>
                  {/* <td>{pricing.discount_percentage}%</td> */}
                  {/* <td>
                    ₹
                    {calculateFinalPrice(
                      pricing.price,
                      pricing.discount_percentage
                    ).toFixed(2)}
                  </td> */}
                  <td>
                    <span
                      className={`badge ${
                        pricing.active ? "badge-confirmed" : "badge-cancelled"
                      }`}
                    >
                      {pricing.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-warning"
                      onClick={() => handleEdit(pricing)}
                      style={{ marginRight: "10px" }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(pricing.id)}
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
            No service pricing found. Create your first pricing to get started.
          </p>
        )}
      </div>

      {/* Single Pricing Modal */}
      <OsrModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          editingPricing ? "Edit Service Pricing" : "Create Service Pricing"
        }
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
                    {getCategoryName(subcategory.id)} - {subcategory.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Unit Configuration *</label>
            <select
              name="unit_configuration_id"
              value={formData.unit_configuration_id}
              onChange={handleInputChange}
              className="form-control"
              required
            >
              <option value="">Select a unit type</option>
              {Array.isArray(unitConfigs) &&
                unitConfigs.map((config) => (
                  <option key={config.id} value={config.id}>
                    {config.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Base Price *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="form-control"
              min="0"
              step="0.01"
              required
              placeholder="Base price in rupees"
            />
          </div>

          {/* <div className="form-group">
            <label className="form-label">Discount Percentage</label>
            <input
              type="number"
              name="discount_percentage"
              value={formData.discount_percentage}
              onChange={handleInputChange}
              className="form-control"
              min="0"
              max="100"
              step="0.01"
            />
          </div> */}

          {formData.price && (
            <div className="form-group">
              <label className="form-label">Final Price</label>
              <div
                className="form-control"
                style={{ backgroundColor: "#f8f9fa" }}
              >
                ₹
                {calculateFinalPrice(
                  parseFloat(formData.price) || 0,
                  parseFloat(formData.discount_percentage) || 0
                ).toFixed(2)}
              </div>
            </div>
          )}

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
              {editingPricing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </OsrModal>

      {/* Bulk Create Modal */}
      <OsrModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Bulk Create Service Pricing"
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
                    {getCategoryName(subcategory.id)} - {subcategory.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Pricing for Each Unit Type</label>
            {Array.isArray(bulkFormData.pricing_data) &&
              bulkFormData.pricing_data.map((pricing, index) => {
                const unitConfig = Array.isArray(unitConfigs)
                  ? unitConfigs.find(
                      (u) => u.id === pricing.unit_configuration_id
                    )
                  : null;
                return (
                  <div
                    key={pricing.unit_configuration_id}
                    style={{
                      marginBottom: "15px",
                      padding: "15px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  >
                    <h4 style={{ marginBottom: "10px" }}>
                      {unitConfig?.name || "Unknown Unit"}
                    </h4>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <label className="form-label">Base Price</label>
                        <input
                          type="number"
                          value={pricing.price}
                          onChange={(e) =>
                            updateBulkPricingData(
                              index,
                              "price",
                              e.target.value
                            )
                          }
                          className="form-control"
                          min="0"
                          step="0.01"
                          placeholder="Base price"
                        />
                      </div>
                      {/* <div>
                        <label className="form-label">Discount %</label>
                        <input
                          type="number"
                          value={pricing.discount_percentage}
                          onChange={(e) =>
                            updateBulkPricingData(
                              index,
                              "discount_percentage",
                              e.target.value
                            )
                          }
                          className="form-control"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="Discount"
                        />
                      </div> */}
                      <div>
                        <label className="form-label">Final Price</label>
                        <div
                          className="form-control"
                          style={{ backgroundColor: "#f8f9fa" }}
                        >
                          ₹
                          {calculateFinalPrice(
                            parseFloat(pricing.price) || 0,
                            parseFloat(pricing.discount_percentage) || 0
                          ).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
              Create Pricing
            </button>
          </div>
        </form>
      </OsrModal>
    </div>
  );
};

ServicePricing.propTypes = {
  onClose: PropTypes.func,
};

export default ServicePricing;
