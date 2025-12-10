import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Settings, MapPin, Package, Calendar, FileText, Shield, Plus, X } from "lucide-react";
import FormSection from "../ui/FormSection";
import FormInput from "../ui/FormInput";
import FormGrid from "../ui/FormGrid";
import FormToggle from "../ui/FormToggle";
import Button from "@/components/ui/Button";
import { getItemInLocalStorage } from "../../utils/localStorage";
import {
  getAssetGroups,
  getAssetSubGroups,
  getFloors,
  getParentAsset,
  getUnits,
  getVendors,
  postSiteAsset,
} from "../../api";

const AssetCreateForm: React.FC = () => {
  const navigate = useNavigate();
  const buildings = getItemInLocalStorage("Building") || [];
  const themeColor = useSelector((state: any) => state.theme.color);

  const [floors, setFloors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [assetGroups, setAssetGroup] = useState<any[]>([]);
  const [assetSubGoups, setAssetSubGroups] = useState<any[]>([]);
  const [parentAsset, setParentAsset] = useState<any[]>([]);
  const [consumptionData, setConsumptionData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    site_id: getItemInLocalStorage("SITEID") || "",
    building_id: "",
    floor_id: "",
    unit_id: "",
    name: "",
    oem_name: "",
    latitude: "",
    longitude: "",
    asset_number: "",
    equipment_id: "",
    serial_number: "",
    model_number: "",
    purchased_on: "",
    purchase_cost: "",
    comprehensive: "",
    asset_group_id: "",
    asset_sub_group_id: "",
    parent_asset_id: "",
    installation: "",
    warranty_expiry: "",
    warranty_start: "",
    critical: false,
    capacity: "",
    breakdown: false,
    is_meter: false,
    asset_type: "",
    vendor_id: "",
    unit: "",
    invoice: [] as File[],
    insurance: [] as File[],
    manuals: [] as File[],
    others: [] as File[],
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [vendorResp, assetGroupResp] = await Promise.all([
          getVendors(),
          getAssetGroups()
        ]);
        setVendors(vendorResp.data || []);
        setAssetGroup(assetGroupResp.data || []);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name === "building_id") {
      const BuildID = Number(value);
      try {
        const build = await getFloors(BuildID);
        setFloors(build.data?.map((item: any) => ({ name: item.name, id: item.id })) || []);
      } catch (e) {
        console.log(e);
      }
      setFormData(prev => ({ ...prev, building_id: value, floor_id: "", unit_id: "" }));
    } else if (name === "floor_id") {
      const floorId = Number(value);
      try {
        const unit = await getUnits(floorId);
        setUnits(unit.data?.map((item: any) => ({ name: item.name, id: item.id })) || []);
      } catch (error) {
        console.log(error);
      }
      setFormData(prev => ({ ...prev, floor_id: value, unit_id: "" }));
    } else if (name === "asset_group_id") {
      const groupId = Number(value);
      try {
        const [subGroupResp, parentAssetResp] = await Promise.all([
          getAssetSubGroups(groupId),
          getParentAsset(groupId)
        ]);
        setAssetSubGroups(subGroupResp?.map((item: any) => ({ name: item.name, id: item.id })) || []);
        setParentAsset(parentAssetResp.data?.site_assets || []);
      } catch (error) {
        console.log(error);
      }
      setFormData(prev => ({ ...prev, asset_group_id: value, asset_sub_group_id: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleToggleChange = (field: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (files: FileList | null, fieldName: string) => {
    if (files) {
      setFormData(prev => ({ ...prev, [fieldName]: Array.from(files) }));
    }
  };

  const handleAddConsumption = () => {
    setConsumptionData(prev => [
      ...prev,
      {
        name: "",
        order: "",
        unit_type: "",
        digit: "",
        alert_below: "",
        alert_above: "",
        min_val: "",
        max_val: "",
        multiplier_factor: "",
        dashboard_view: false,
        consumption_view: false,
        check_prev: false,
      },
    ]);
  };

  const handleRemoveConsumption = (index: number) => {
    setConsumptionData(prev => prev.filter((_, i) => i !== index));
  };

  const handleConsumptionChange = (index: number, field: string, value: any) => {
    setConsumptionData(prev =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async () => {
    // Validations
    if (!formData.building_id) return toast.error("Please Select Building Name");
    if (!formData.name) return toast.error("Please Enter Asset Name");
    if (!formData.oem_name) return toast.error("Please Enter OEM Name");
    if (!formData.asset_number) return toast.error("Please Enter Asset Number");
    if (!formData.equipment_id) return toast.error("Please Enter Equipment ID");
    if (!formData.purchase_cost) return toast.error("Please Enter Purchase Cost");
    if (!formData.asset_group_id) return toast.error("Please Select Group");
    if (!formData.asset_sub_group_id) return toast.error("Please Select Sub Group");

    if (formData.warranty_start && formData.warranty_expiry && formData.warranty_start >= formData.warranty_expiry) {
      return toast.error("Warranty Start Date must be before Expiry Date.");
    }

    if (formData.warranty_start && formData.purchased_on && formData.warranty_start < formData.purchased_on) {
      return toast.error("Warranty Start Date must be after or equal to Purchase Date.");
    }

    if (formData.installation && formData.purchased_on && formData.installation < formData.purchased_on) {
      return toast.error("Installation Date must be after or equal to Purchase Date.");
    }

    setIsSubmitting(true);
    try {
      toast.loading("Creating Asset Please Wait!");
      const formDataSend = new FormData();

      // Append all form fields
      formDataSend.append("site_asset[site_id]", formData.site_id);
      formDataSend.append("site_asset[building_id]", formData.building_id);
      formDataSend.append("site_asset[floor_id]", formData.floor_id);
      formDataSend.append("site_asset[unit_id]", formData.unit_id);
      formDataSend.append("site_asset[name]", formData.name);
      formDataSend.append("site_asset[oem_name]", formData.oem_name);
      formDataSend.append("site_asset[latitude]", formData.latitude);
      formDataSend.append("site_asset[longitude]", formData.longitude);
      formDataSend.append("site_asset[asset_number]", formData.asset_number);
      formDataSend.append("site_asset[equipemnt_id]", formData.equipment_id);
      formDataSend.append("site_asset[serial_number]", formData.serial_number);
      formDataSend.append("site_asset[model_number]", formData.model_number);
      formDataSend.append("site_asset[purchased_on]", formData.purchased_on);
      formDataSend.append("site_asset[purchase_cost]", formData.purchase_cost);
      formDataSend.append("site_asset[comprehensive]", formData.comprehensive);
      formDataSend.append("site_asset[asset_group_id]", formData.asset_group_id);
      formDataSend.append("site_asset[asset_sub_group_id]", formData.asset_sub_group_id);
      formDataSend.append("site_asset[parent_asset_id]", formData.parent_asset_id);
      formDataSend.append("site_asset[installation]", formData.installation);
      formDataSend.append("site_asset[warranty_expiry]", formData.warranty_expiry);
      formDataSend.append("site_asset[warranty_start]", formData.warranty_start);
      formDataSend.append("site_asset[critical]", String(formData.critical));
      formDataSend.append("site_asset[capacity]", formData.capacity);
      formDataSend.append("site_asset[breakdown]", String(formData.breakdown));
      formDataSend.append("site_asset[is_meter]", String(formData.is_meter));
      formDataSend.append("site_asset[asset_type]", formData.asset_type);
      formDataSend.append("site_asset[vendor_id]", formData.vendor_id);
      formDataSend.append("site_asset[uom]", formData.unit);

      // Consumption data
      consumptionData.forEach((item) => {
        formDataSend.append("asset_params[][name]", item.name);
        formDataSend.append("asset_params[][order]", item.order);
        formDataSend.append("asset_params[][unit_type]", item.unit_type);
        formDataSend.append("asset_params[][digit]", item.digit);
        formDataSend.append("asset_params[][alert_below]", item.alert_below);
        formDataSend.append("asset_params[][alert_above]", item.alert_above);
        formDataSend.append("asset_params[][min_val]", item.min_val);
        formDataSend.append("asset_params[][max_val]", item.max_val);
        formDataSend.append("asset_params[][multiplier_factor]", item.multiplier_factor);
        formDataSend.append("asset_params[][dashboard_view]", String(item.dashboard_view));
        formDataSend.append("asset_params[][consumption_view]", String(item.consumption_view));
        formDataSend.append("asset_params[][check_prev]", String(item.check_prev));
      });

      // Files
      formData.invoice.forEach((file) => formDataSend.append("purchase_invoices[]", file));
      formData.insurance.forEach((file) => formDataSend.append("insurances[]", file));
      formData.manuals.forEach((file) => formDataSend.append("manuals[]", file));
      formData.others.forEach((file) => formDataSend.append("other_files[]", file));

      const response = await postSiteAsset(formDataSend);
      toast.dismiss();
      toast.success("Asset Created Successfully");
      navigate(`/assets/asset-details/${response.data.id}`);
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to create asset");
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildingOptions = buildings.map((b: any) => ({ value: String(b.id), label: b.name }));
  const floorOptions = floors.map((f: any) => ({ value: String(f.id), label: f.name }));
  const unitOptions = units.map((u: any) => ({ value: String(u.id), label: u.name }));
  const groupOptions = assetGroups.map((g: any) => ({ value: String(g.id), label: g.name }));
  const subGroupOptions = assetSubGoups.map((s: any) => ({ value: String(s.id), label: s.name }));
  const parentOptions = parentAsset.map((p: any) => ({ value: String(p.id), label: p.name }));
  const vendorOptions = vendors.map((v: any) => ({ value: String(v.id), label: v.name || v.vendor_name }));

  return (
    <div className="space-y-6">
      {/* Location Details */}
      <FormSection title="Location Details" icon={MapPin}>
        <FormGrid columns={3}>
          <FormInput
            label="Building"
            name="building_id"
            type="select"
            value={formData.building_id}
            onChange={handleChange}
            options={buildingOptions}
            required
            placeholder="Select Building"
          />
          <FormInput
            label="Floor"
            name="floor_id"
            type="select"
            value={formData.floor_id}
            onChange={handleChange}
            options={floorOptions}
            placeholder="Select Floor"
          />
          <FormInput
            label="Unit"
            name="unit_id"
            type="select"
            value={formData.unit_id}
            onChange={handleChange}
            options={unitOptions}
            placeholder="Select Unit"
          />
          <FormInput
            label="Latitude"
            name="latitude"
            type="number"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="Enter Latitude"
          />
          <FormInput
            label="Longitude"
            name="longitude"
            type="number"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="Enter Longitude"
          />
        </FormGrid>
      </FormSection>

      {/* Asset Details */}
      <FormSection title="Asset Details" icon={Package}>
        <FormGrid columns={3}>
          <FormInput
            label="Asset Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter Asset Name"
          />
          <FormInput
            label="OEM Name"
            name="oem_name"
            value={formData.oem_name}
            onChange={handleChange}
            required
            placeholder="Enter OEM Name"
          />
          <FormInput
            label="Asset Number"
            name="asset_number"
            value={formData.asset_number}
            onChange={handleChange}
            required
            placeholder="Enter Asset Number"
          />
          <FormInput
            label="Equipment ID"
            name="equipment_id"
            value={formData.equipment_id}
            onChange={handleChange}
            required
            placeholder="Enter Equipment ID"
          />
          <FormInput
            label="Serial Number"
            name="serial_number"
            value={formData.serial_number}
            onChange={handleChange}
            placeholder="Enter Serial Number"
          />
          <FormInput
            label="Model Number"
            name="model_number"
            value={formData.model_number}
            onChange={handleChange}
            placeholder="Enter Model Number"
          />
          <FormInput
            label="Group"
            name="asset_group_id"
            type="select"
            value={formData.asset_group_id}
            onChange={handleChange}
            options={groupOptions}
            required
            placeholder="Select Group"
          />
          <FormInput
            label="Sub Group"
            name="asset_sub_group_id"
            type="select"
            value={formData.asset_sub_group_id}
            onChange={handleChange}
            options={subGroupOptions}
            required
            placeholder="Select Sub Group"
          />
          <FormInput
            label="Parent Asset"
            name="parent_asset_id"
            type="select"
            value={formData.parent_asset_id}
            onChange={handleChange}
            options={parentOptions}
            placeholder="Select Parent Asset"
          />
          <FormInput
            label="Asset Type"
            name="asset_type"
            type="select"
            value={formData.asset_type}
            onChange={handleChange}
            options={[
              { value: "fixed", label: "Fixed" },
              { value: "movable", label: "Movable" },
            ]}
            placeholder="Select Asset Type"
          />
          <FormInput
            label="Vendor"
            name="vendor_id"
            type="select"
            value={formData.vendor_id}
            onChange={handleChange}
            options={vendorOptions}
            placeholder="Select Vendor"
          />
          <FormInput
            label="Capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="Enter Capacity"
          />
          <FormInput
            label="Unit of Measurement"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            placeholder="Enter UOM"
          />
        </FormGrid>
        <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-border">
          <FormToggle label="Critical Asset" checked={formData.critical} onChange={(v) => handleToggleChange("critical", v)} />
          <FormToggle label="Breakdown" checked={formData.breakdown} onChange={(v) => handleToggleChange("breakdown", v)} />
          <FormToggle label="Is Meter" checked={formData.is_meter} onChange={(v) => handleToggleChange("is_meter", v)} />
        </div>
      </FormSection>

      {/* Purchase & Warranty Details */}
      <FormSection title="Purchase & Warranty Details" icon={Calendar}>
        <FormGrid columns={3}>
          <FormInput
            label="Purchase Date"
            name="purchased_on"
            type="date"
            value={formData.purchased_on}
            onChange={handleChange}
          />
          <FormInput
            label="Purchase Cost"
            name="purchase_cost"
            type="number"
            value={formData.purchase_cost}
            onChange={handleChange}
            required
            placeholder="Enter Purchase Cost"
          />
          <FormInput
            label="Installation Date"
            name="installation"
            type="date"
            value={formData.installation}
            onChange={handleChange}
          />
          <FormInput
            label="Warranty Start"
            name="warranty_start"
            type="date"
            value={formData.warranty_start}
            onChange={handleChange}
          />
          <FormInput
            label="Warranty Expiry"
            name="warranty_expiry"
            type="date"
            value={formData.warranty_expiry}
            onChange={handleChange}
          />
          <FormInput
            label="Comprehensive"
            name="comprehensive"
            type="select"
            value={formData.comprehensive}
            onChange={handleChange}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            placeholder="Select"
          />
        </FormGrid>
      </FormSection>

      {/* Meter Parameters */}
      {formData.is_meter && (
        <FormSection title="Meter Parameters" icon={Settings}>
          <div className="space-y-4">
            {consumptionData.map((item, index) => (
              <div key={index} className="p-4 border border-border rounded-lg relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => handleRemoveConsumption(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <FormGrid columns={4}>
                  <FormInput
                    label="Name"
                    name="name"
                    value={item.name}
                    onChange={(e) => handleConsumptionChange(index, "name", e.target.value)}
                    placeholder="Parameter Name"
                  />
                  <FormInput
                    label="Order"
                    name="order"
                    type="number"
                    value={item.order}
                    onChange={(e) => handleConsumptionChange(index, "order", e.target.value)}
                    placeholder="Order"
                  />
                  <FormInput
                    label="Unit Type"
                    name="unit_type"
                    value={item.unit_type}
                    onChange={(e) => handleConsumptionChange(index, "unit_type", e.target.value)}
                    placeholder="Unit Type"
                  />
                  <FormInput
                    label="Digits"
                    name="digit"
                    type="number"
                    value={item.digit}
                    onChange={(e) => handleConsumptionChange(index, "digit", e.target.value)}
                    placeholder="Digits"
                  />
                  <FormInput
                    label="Min Value"
                    name="min_val"
                    type="number"
                    value={item.min_val}
                    onChange={(e) => handleConsumptionChange(index, "min_val", e.target.value)}
                    placeholder="Min Value"
                  />
                  <FormInput
                    label="Max Value"
                    name="max_val"
                    type="number"
                    value={item.max_val}
                    onChange={(e) => handleConsumptionChange(index, "max_val", e.target.value)}
                    placeholder="Max Value"
                  />
                  <FormInput
                    label="Alert Below"
                    name="alert_below"
                    type="number"
                    value={item.alert_below}
                    onChange={(e) => handleConsumptionChange(index, "alert_below", e.target.value)}
                    placeholder="Alert Below"
                  />
                  <FormInput
                    label="Alert Above"
                    name="alert_above"
                    type="number"
                    value={item.alert_above}
                    onChange={(e) => handleConsumptionChange(index, "alert_above", e.target.value)}
                    placeholder="Alert Above"
                  />
                </FormGrid>
                <div className="flex gap-4 mt-3">
                  <FormToggle
                    label="Dashboard View"
                    checked={item.dashboard_view}
                    onChange={(v) => handleConsumptionChange(index, "dashboard_view", v)}
                  />
                  <FormToggle
                    label="Consumption View"
                    checked={item.consumption_view}
                    onChange={(v) => handleConsumptionChange(index, "consumption_view", v)}
                  />
                  <FormToggle
                    label="Check Previous"
                    checked={item.check_prev}
                    onChange={(v) => handleConsumptionChange(index, "check_prev", v)}
                  />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddConsumption}>
              <Plus className="w-4 h-4 mr-2" /> Add Parameter
            </Button>
          </div>
        </FormSection>
      )}

      {/* Documents */}
      <FormSection title="Documents" icon={FileText}>
        <FormGrid columns={2}>
          <FormInput
            label="Purchase Invoice"
            name="invoice"
            type="file"
            onFileChange={(files) => handleFileChange(files, "invoice")}
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <FormInput
            label="Insurance Documents"
            name="insurance"
            type="file"
            onFileChange={(files) => handleFileChange(files, "insurance")}
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <FormInput
            label="Manuals"
            name="manuals"
            type="file"
            onFileChange={(files) => handleFileChange(files, "manuals")}
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <FormInput
            label="Other Documents"
            name="others"
            type="file"
            onFileChange={(files) => handleFileChange(files, "others")}
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
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Asset"}
        </Button>
      </div>
    </div>
  );
};

export default AssetCreateForm;
