import React from 'react';
import ReactDataTable, { TableColumn as RDTColumn, TableStyles } from 'react-data-table-component';
import { Eye, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface DataTableColumn<T> {
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
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  title?: string;
  loading?: boolean;
  pagination?: boolean;
  paginationServer?: boolean;
  paginationTotalRows?: number;
  paginationPerPage?: number;
  paginationRowsPerPageOptions?: number[];
  onChangePage?: (page: number) => void;
  onChangeRowsPerPage?: (rows: number, page: number) => void;
  selectableRows?: boolean;
  onSelectedRowsChange?: (selected: { selectedRows: T[] }) => void;
  onRowClicked?: (row: T) => void;
  expandableRows?: boolean;
  expandableRowsComponent?: React.FC<{ data: T }>;
  noDataComponent?: React.ReactNode;
  className?: string;
  highlightOnHover?: boolean;
  striped?: boolean;
  dense?: boolean;
  fixedHeader?: boolean;
  fixedHeaderScrollHeight?: string;
}

const customStyles: TableStyles = {
  table: {
    style: {
      backgroundColor: 'transparent',
    },
  },
  headRow: {
    style: {
      backgroundColor: 'hsl(267, 62%, 49%)',
      color: 'white',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase' as const,
      borderRadius: '8px 8px 0 0',
      minHeight: '48px',
    },
  },
  headCells: {
    style: {
      paddingLeft: '16px',
      paddingRight: '16px',
      color: 'white',
    },
  },
  rows: {
    style: {
      fontSize: '14px',
      color: 'hsl(var(--foreground))',
      backgroundColor: 'hsl(var(--card))',
      minHeight: '52px',
      borderBottom: '1px solid hsl(var(--border))',
      '&:hover': {
        backgroundColor: 'hsl(var(--accent))',
        cursor: 'pointer',
      },
    },
    highlightOnHoverStyle: {
      backgroundColor: 'hsl(var(--accent))',
      borderBottomColor: 'hsl(var(--border))',
      outline: 'none',
    },
  },
  cells: {
    style: {
      paddingLeft: '16px',
      paddingRight: '16px',
      color: 'hsl(var(--muted-foreground))',
    },
  },
  pagination: {
    style: {
      backgroundColor: 'hsl(var(--card))',
      borderTop: '1px solid hsl(var(--border))',
      color: 'hsl(var(--foreground))',
    },
  },
  noData: {
    style: {
      padding: '40px',
      color: 'hsl(var(--muted-foreground))',
      backgroundColor: 'hsl(var(--card))',
    },
  },
};

function DataTable<T extends object>({
  columns,
  data,
  title,
  loading = false,
  pagination = true,
  paginationServer = false,
  paginationTotalRows = 0,
  paginationPerPage = 10,
  paginationRowsPerPageOptions = [10, 25, 50, 100],
  onChangePage,
  onChangeRowsPerPage,
  selectableRows = false,
  onSelectedRowsChange,
  onRowClicked,
  expandableRows = false,
  expandableRowsComponent,
  noDataComponent,
  className = '',
  highlightOnHover = true,
  striped = false,
  dense = false,
  fixedHeader = true,
  fixedHeaderScrollHeight = '400px',
}: DataTableProps<T>) {
  // Convert our column format to react-data-table-component format
  const rdtColumns: RDTColumn<T>[] = columns.map((col) => ({
    name: col.name,
    selector: col.selector as (row: T) => string | number,
    cell: col.cell,
    sortable: col.sortable ?? true,
    width: col.width,
    minWidth: col.minWidth,
    maxWidth: col.maxWidth,
    center: col.center,
    right: col.right,
    wrap: col.wrap,
    grow: col.grow,
    hide: col.hide,
  }));

  return (
    <div className={`rounded-lg border border-border overflow-hidden ${className}`}>
      <ReactDataTable
        title={title}
        columns={rdtColumns}
        data={data}
        customStyles={customStyles}
        progressPending={loading}
        progressComponent={
          <div className="py-10 text-center text-muted-foreground">Loading...</div>
        }
        pagination={pagination}
        paginationServer={paginationServer}
        paginationTotalRows={paginationTotalRows}
        paginationPerPage={paginationPerPage}
        paginationRowsPerPageOptions={paginationRowsPerPageOptions}
        onChangePage={onChangePage}
        onChangeRowsPerPage={onChangeRowsPerPage}
        selectableRows={selectableRows}
        onSelectedRowsChange={onSelectedRowsChange}
        onRowClicked={onRowClicked}
        expandableRows={expandableRows}
        expandableRowsComponent={expandableRowsComponent}
        noDataComponent={noDataComponent || (
          <div className="py-10 text-center text-muted-foreground">No records found</div>
        )}
        highlightOnHover={highlightOnHover}
        striped={striped}
        dense={dense}
        fixedHeader={fixedHeader}
        fixedHeaderScrollHeight={fixedHeaderScrollHeight}
        responsive
        sortIcon={<ChevronDown size={14} className="ml-1" />}
      />
    </div>
  );
}

// Helper component for action column
interface ActionCellProps {
  viewPath?: string;
  editPath?: string;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ActionCell: React.FC<ActionCellProps> = ({
  viewPath,
  onView,
}) => {
  return (
    <div className="flex items-center gap-2">
      {viewPath ? (
        <Link
          to={viewPath}
          className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
        >
          <Eye size={18} />
        </Link>
      ) : onView ? (
        <button
          onClick={onView}
          className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
        >
          <Eye size={18} />
        </button>
      ) : null}
    </div>
  );
};

export default DataTable;
