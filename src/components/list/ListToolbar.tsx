import React from 'react';
import { Search, QrCode, Filter, Download, Plus, Grid, List } from 'lucide-react';

interface ListToolbarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showQRCode?: boolean;
  onQRCodeClick?: () => void;
  showFilter?: boolean;
  onFilterClick?: () => void;
  showExport?: boolean;
  onExportClick?: () => void;
  showAddButton?: boolean;
  addButtonLabel?: string;
  onAddClick?: () => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  showViewToggle?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const ListToolbar: React.FC<ListToolbarProps> = ({
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  showQRCode = false,
  onQRCodeClick,
  showFilter = true,
  onFilterClick,
  showExport = true,
  onExportClick,
  showAddButton = false,
  addButtonLabel = 'Add New',
  onAddClick,
  viewMode = 'list',
  onViewModeChange,
  showViewToggle = false,
  className = '',
  children,
}) => {
  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 ${className}`}>
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {showQRCode && (
          <button
            onClick={onQRCodeClick}
            className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-accent transition-colors"
          >
            <QrCode size={18} />
            <span className="text-sm font-medium">QR Code</span>
          </button>
        )}

        {showFilter && (
          <button
            onClick={onFilterClick}
            className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
          >
            <Filter size={18} />
            <span className="text-sm font-medium">Filter</span>
          </button>
        )}

        {showExport && (
          <button
            onClick={onExportClick}
            className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
          >
            <Download size={18} />
            <span className="text-sm font-medium">Export</span>
          </button>
        )}

        {showViewToggle && (
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange?.('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-accent'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => onViewModeChange?.('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-accent'}`}
            >
              <List size={18} />
            </button>
          </div>
        )}

        {showAddButton && (
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">{addButtonLabel}</span>
          </button>
        )}

        {children}
      </div>
    </div>
  );
};

export default ListToolbar;
