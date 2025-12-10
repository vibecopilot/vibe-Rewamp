import { getItemInLocalStorage } from "./localStorage";

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");
export const formattedDate = `${year}-${month}-${day}`;

const siteID = getItemInLocalStorage<string>("SITEID");

export interface AssetFormData {
  site_id: string | null;
  building_id: string;
  floor_id: string;
  unit_id: string;
  name: string;
  serial_number: string;
  model_number: string;
  purchase_cost: string;
  capacity: string;
  unit: string;
  asset_group_id: string;
  asset_sub_group_id: string;
  asset_type: string;
  purchased_on: string;
  breakdown: boolean;
  critical: boolean;
  installation: string;
  warranty: boolean;
  warranty_start: string;
  warranty_expiry: string;
  is_meter: boolean;
  applicable_meter_category: string;
  parent_meter: string;
  meter_category: string;
  vendor_id: string;
  oem_name: string;
  parent_asset_id: string;
  complianceApplicable: boolean;
  invoice: File[];
  insurance: File[];
  manuals: File[];
  others: File[];
}

export const initialAddAssetFormData: AssetFormData = {
  site_id: siteID,
  building_id: "",
  floor_id: "",
  unit_id: "",
  name: "",
  serial_number: "",
  model_number: "",
  purchase_cost: "",
  capacity: "",
  unit: "",
  asset_group_id: "",
  asset_sub_group_id: "",
  asset_type: "",
  purchased_on: "",
  breakdown: false,
  critical: false,
  installation: "",
  warranty: false,
  warranty_start: "",
  warranty_expiry: "",
  is_meter: false,
  applicable_meter_category: "",
  parent_meter: "",
  meter_category: "",
  vendor_id: "",
  oem_name: "",
  parent_asset_id: "",
  complianceApplicable: false,
  invoice: [],
  insurance: [],
  manuals: [],
  others: [],
};

export interface DaySchedule {
  selected: boolean;
  start_time: string;
  end_time: string;
}

export interface RestaurantDaySchedule extends DaySchedule {
  break_start_time: string;
  break_end_time: string;
  booking_allowed: boolean;
  order_allowed: boolean;
  last_booking_order_time: string;
}

export type WeekSchedule = Record<string, DaySchedule>;
export type RestaurantWeekSchedule = Record<string, RestaurantDaySchedule>;

export const initialSchedule: WeekSchedule = {
  Sunday: { selected: false, start_time: "", end_time: "" },
  Monday: { selected: false, start_time: "", end_time: "" },
  Tuesday: { selected: false, start_time: "", end_time: "" },
  Wednesday: { selected: false, start_time: "", end_time: "" },
  Thursday: { selected: false, start_time: "", end_time: "" },
  Friday: { selected: false, start_time: "", end_time: "" },
  Saturday: { selected: false, start_time: "", end_time: "" },
};

export const restaurantSchedule: RestaurantWeekSchedule = {
  Sunday: {
    selected: false,
    start_time: "",
    end_time: "",
    break_start_time: "",
    break_end_time: "",
    booking_allowed: false,
    order_allowed: false,
    last_booking_order_time: "",
  },
  Monday: {
    selected: false,
    start_time: "",
    end_time: "",
    break_start_time: "",
    break_end_time: "",
    booking_allowed: false,
    order_allowed: false,
    last_booking_order_time: "",
  },
  Tuesday: {
    selected: false,
    start_time: "",
    end_time: "",
    break_start_time: "",
    break_end_time: "",
    booking_allowed: false,
    order_allowed: false,
    last_booking_order_time: "",
  },
  Wednesday: {
    selected: false,
    start_time: "",
    end_time: "",
    break_start_time: "",
    break_end_time: "",
    booking_allowed: false,
    order_allowed: false,
    last_booking_order_time: "",
  },
  Thursday: {
    selected: false,
    start_time: "",
    end_time: "",
    break_start_time: "",
    break_end_time: "",
    booking_allowed: false,
    order_allowed: false,
    last_booking_order_time: "",
  },
  Friday: {
    selected: false,
    start_time: "",
    end_time: "",
    break_start_time: "",
    break_end_time: "",
    booking_allowed: false,
    order_allowed: false,
    last_booking_order_time: "",
  },
  Saturday: {
    selected: false,
    start_time: "",
    end_time: "",
    break_start_time: "",
    break_end_time: "",
    booking_allowed: false,
    order_allowed: false,
    last_booking_order_time: "",
  },
};
