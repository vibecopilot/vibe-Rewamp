import React from "react";
import DataTableComponent from "react-data-table-component";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

interface TableColumn {
  name: string;
  selector?: (row: any) => any;
  cell?: (row: any) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  minWidth?: string;
  center?: boolean;
  right?: boolean;
  wrap?: boolean;
  grow?: number;
}

interface TableProps {
  columns: TableColumn[];
  title?: string;
  height?: string;
  pagination?: boolean;
  data: any[];
  apiEndpoint?: string;
  customStyles?: any;
  onChangePage?: (page: number) => void;
  selectableRow?: boolean;
  onSelectedRows?: (rows: any[]) => void;
  paginationServer?: boolean;
  paginationTotalRows?: number;
  onChangeRowsPerPage?: (rows: number, page: number) => void;
  selectableRowsNoSelectAll?: boolean;
  clearSelectedRows?: boolean;
}

const Table: React.FC<TableProps> = ({
  columns,
  title,
  height,
  pagination = true,
  data,
  apiEndpoint,
  customStyles,
  onChangePage,
  selectableRow,
  onSelectedRows,
  paginationServer = false,
  paginationTotalRows = 0,
  onChangeRowsPerPage,
  selectableRowsNoSelectAll = false,
  clearSelectedRows = false,
}) => {
  const themeColor = useSelector((state: RootState) => state.theme.color);

  const customStyle = {
    headRow: {
      style: {
        background: themeColor,
        color: "white",
        fontSize: "12px",
        fontWeight: "600",
        textTransform: "uppercase" as const,
        borderRadius: "8px 8px 0 0",
        minHeight: "48px",
      },
    },
    headCells: {
      style: {
        paddingLeft: "16px",
        paddingRight: "16px",
        color: "white",
      },
    },
    rows: {
      style: {
        fontSize: "14px",
        minHeight: "52px",
        borderBottom: "1px solid hsl(var(--border))",
        "&:hover": {
          backgroundColor: "hsl(var(--accent))",
        },
      },
    },
    cells: {
      style: {
        paddingLeft: "16px",
        paddingRight: "16px",
        whiteSpace: "nowrap" as const,
        fontSize: "14px",
        lineHeight: "24px",
        color: "hsl(var(--muted-foreground))",
        fontWeight: 450
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid hsl(var(--border))",
      },
    },
  };

  const handleSelectedRowsChange = ({ selectedRows }: { selectedRows: any[] }) => {
    if (onSelectedRows) {
      onSelectedRows(selectedRows);
    }
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <DataTableComponent
        title={title}
        responsive
        columns={columns}
        data={data}
        customStyles={customStyles || customStyle}
        pagination={pagination}
        paginationServer={paginationServer}
        paginationTotalRows={paginationTotalRows}
        fixedHeader
        selectableRowsHighlight
        selectableRows={selectableRow}
        selectableRowsNoSelectAll={selectableRowsNoSelectAll}
        clearSelectedRows={clearSelectedRows}
        highlightOnHover
        onChangePage={onChangePage}
        onChangeRowsPerPage={onChangeRowsPerPage}
        onSelectedRowsChange={handleSelectedRowsChange}
      />
    </div>
  );
};

export default Table;
