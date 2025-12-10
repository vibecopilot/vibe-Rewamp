// Table-related type definitions

export interface TableColumn<T = any> {
  name: string;
  selector?: (row: T) => string | number | React.ReactNode;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  center?: boolean;
  right?: boolean;
  wrap?: boolean;
  grow?: number;
  hide?: number | 'sm' | 'md' | 'lg';
  omit?: boolean;
  button?: boolean;
}

export interface PaginationOptions {
  enabled?: boolean;
  server?: boolean;
  totalRows?: number;
  perPage?: number;
  rowsPerPageOptions?: number[];
}

export interface TableStyles {
  headRow?: {
    style?: React.CSSProperties & { [key: string]: any };
  };
  headCells?: {
    style?: React.CSSProperties & { [key: string]: any };
  };
  rows?: {
    style?: React.CSSProperties & { [key: string]: any };
    highlightOnHoverStyle?: React.CSSProperties & { [key: string]: any };
  };
  cells?: {
    style?: React.CSSProperties & { [key: string]: any };
  };
  pagination?: {
    style?: React.CSSProperties & { [key: string]: any };
  };
}

export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

export interface TableFilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte';
  value: string | number | boolean;
}
