// API-specific type definitions

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string | number;
    email: string;
    name: string;
    role: string;
  };
}

// Ticket types
export interface Ticket {
  id: string | number;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  category?: string;
}

// Asset types
export interface Asset {
  id: string | number;
  name: string;
  asset_number: string;
  serial_number?: string;
  model_number?: string;
  building_name?: string;
  floor_name?: string;
  unit_name?: string;
  oem_name?: string;
  status: string;
  purchase_date?: string;
  purchase_cost?: number;
  created_at: string;
  updated_at: string;
}

// Vendor types
export interface Vendor {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  category?: string;
  status: string;
}

// Employee types
export interface Employee {
  id: string | number;
  employee_id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  status: string;
  joining_date?: string;
}

// Booking types
export interface Booking {
  id: string | number;
  facility_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  booked_by: string;
}

// Communication types
export interface Event {
  id: string | number;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  location?: string;
  status: string;
}

export interface Broadcast {
  id: string | number;
  title: string;
  message: string;
  created_at: string;
  sent_to: string[];
}

// Visitor types
export interface Visitor {
  id: string | number;
  name: string;
  mobile: string;
  email?: string;
  company?: string;
  purpose: string;
  host_name: string;
  check_in_time?: string;
  check_out_time?: string;
  status: string;
}
