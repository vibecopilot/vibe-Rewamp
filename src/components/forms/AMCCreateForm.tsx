import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, FileText, Calendar } from "lucide-react";
import FormSection from "../ui/FormSection";
import FormInput from "../ui/FormInput";
import FormGrid from "../ui/FormGrid";
import Button from "@/components/ui/Button";

const AMCCreateForm: React.FC = () => {
  const navigate = useNavigate();
  const [amcFor, setAmcFor] = useState<"asset" | "service">("asset");
  
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    asset: "",
    service: "",
    supplier: "",
    cost: "",
    start_date: formattedDate,
    end_date: formattedDate,
    first_service: formattedDate,
    payment_term: "",
    visits: "",
    remarks: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // API integration would go here
    console.log("AMC Form Data:", formData);
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <FormSection title="Configuration" icon={Settings}>
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="font-medium text-foreground">AMC for:</span>
          <button
            type="button"
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              amcFor === "asset" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
            onClick={() => setAmcFor("asset")}
          >
            Asset
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              amcFor === "service" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
            onClick={() => setAmcFor("service")}
          >
            Service
          </button>
        </div>

        <FormGrid columns={2}>
          {amcFor === "asset" ? (
            <FormInput
              label="Asset"
              name="asset"
              type="select"
              value={formData.asset}
              onChange={handleChange}
              options={[
                { value: "asset1", label: "Asset 1" },
                { value: "asset2", label: "Asset 2" },
                { value: "asset3", label: "Asset 3" },
              ]}
              placeholder="Select Asset"
            />
          ) : (
            <FormInput
              label="Service"
              name="service"
              type="select"
              value={formData.service}
              onChange={handleChange}
              options={[
                { value: "service1", label: "Service 1" },
                { value: "service2", label: "Service 2" },
                { value: "service3", label: "Service 3" },
              ]}
              placeholder="Select Service"
            />
          )}
          <FormInput
            label="Supplier"
            name="supplier"
            type="select"
            value={formData.supplier}
            onChange={handleChange}
            options={[
              { value: "supplier1", label: "Supplier 1" },
              { value: "supplier2", label: "Supplier 2" },
              { value: "supplier3", label: "Supplier 3" },
            ]}
            placeholder="Select Supplier"
          />
        </FormGrid>
      </FormSection>

      {/* AMC Details */}
      <FormSection title="AMC Details" icon={Calendar}>
        <FormGrid columns={3}>
          <FormInput
            label="Cost"
            name="cost"
            type="number"
            value={formData.cost}
            onChange={handleChange}
            placeholder="Enter Cost"
          />
          <FormInput
            label="Start Date"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
          />
          <FormInput
            label="End Date"
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={handleChange}
          />
          <FormInput
            label="First Service"
            name="first_service"
            type="date"
            value={formData.first_service}
            onChange={handleChange}
          />
          <FormInput
            label="Payment Term"
            name="payment_term"
            type="select"
            value={formData.payment_term}
            onChange={handleChange}
            options={[
              { value: "yearly", label: "Yearly" },
              { value: "half_yearly", label: "Half Yearly" },
              { value: "quarterly", label: "Quarterly" },
              { value: "monthly", label: "Monthly" },
              { value: "full_payment", label: "Full Payment" },
              { value: "visit_payment", label: "Visit Based Payment" },
            ]}
            placeholder="Select Payment Term"
          />
          <FormInput
            label="No. of Visits"
            name="visits"
            type="number"
            value={formData.visits}
            onChange={handleChange}
            placeholder="Enter Number of Visits"
          />
        </FormGrid>
        <div className="mt-4">
          <FormInput
            label="Remarks"
            name="remarks"
            type="textarea"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Enter Remarks"
            rows={4}
          />
        </div>
      </FormSection>

      {/* Documents */}
      <FormSection title="Documents" icon={FileText}>
        <FormGrid columns={2}>
          <FormInput
            label="AMC Contracts"
            name="contracts"
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <FormInput
            label="AMC Invoice"
            name="invoice"
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </FormGrid>
      </FormSection>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          Save & Show Details
        </Button>
      </div>
    </div>
  );
};

export default AMCCreateForm;
