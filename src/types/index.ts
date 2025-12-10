// Global type definitions for the application

// User types
export interface User {
  id: string | number;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  perPage: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  total: number;
  currentPage: number;
  totalPages: number;
}

// Common form types
export interface SelectOption {
  value: string | number;
  label: string;
}

// Redux store types
export interface ThemeState {
  color: string;
}

export interface BackgroundState {
  background: string;
}

export interface FontSizeState {
  fontSize: string;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Table column type
export interface TableColumn<T = unknown> {
  key: string;
  title: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

// Navigation types
export interface MenuItem {
  name: string;
  link: string;
  icon?: React.ComponentType;
  children?: MenuItem[];
}

// Form field types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'file';
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
  validation?: Record<string, unknown>;
}
