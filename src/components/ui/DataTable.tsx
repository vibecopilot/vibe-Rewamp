import React from 'react';
import { Eye, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge, { StatusType } from './StatusBadge';

export interface TableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  selectable?: boolean;
  selectedRows?: string[];
  onSelectRow?: (id: string) => void;
  onSelectAll?: () => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  getRowId?: (row: T) => string;
  viewPath?: (row: T) => string;
  onView?: (row: T) => void;
}

// Custom Checkbox component for better styling
const Checkbox: React.FC<{
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  className?: string;
}> = ({ checked, indeterminate, onChange, className = '' }) => {
  return (
    <label className={`relative inline-flex items-center cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className={`
        w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center
        ${checked || indeterminate 
          ? 'bg-primary border-primary' 
          : 'bg-background border-border hover:border-primary/50'
        }
      `}>
        {checked && <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />}
        {indeterminate && !checked && <div className="w-2.5 h-0.5 bg-primary-foreground rounded" />}
      </div>
    </label>
  );
};

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  selectable = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  sortColumn,
  sortDirection,
  onSort,
  getRowId = (row) => row.id,
  viewPath,
  onView,
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/50 border-b border-border">
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={() => onSelectAll?.()}
                  />
                </th>
              )}
              <th className="w-16 px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Actions
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase ${column.sortable ? 'cursor-pointer hover:text-foreground' : ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && onSort?.(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && (
                      <span className="flex flex-col">
                        {sortColumn === column.key ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )
                        ) : (
                          <ChevronDown className="w-3 h-3 opacity-30" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => {
              const rowId = String(getRowId(row));
              const isSelected = selectedRows.includes(rowId);
              
              return (
                <tr 
                  key={rowId} 
                  className={`border-b border-border hover:bg-accent/30 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => onSelectRow?.(rowId)}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    {viewPath ? (
                      <Link 
                        to={viewPath(row)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    ) : onView ? (
                      <button
                        onClick={() => onView(row)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    ) : null}
                  </td>
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-sm text-foreground">
                      {column.render 
                        ? column.render(row[column.key], row, rowIndex)
                        : row[column.key] ?? '-'
                      }
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  );
}

export default DataTable;