import React from 'react';
import { Eye, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatusConfig {
  label: string;
  className: string;
}

interface ListCardItem {
  id: string | number;
  title: string;
  subtitle?: string;
  status?: string;
  fields: { label: string; value: string | number }[];
  viewPath?: string;
  editPath?: string;
}

interface ListCardViewProps {
  items: ListCardItem[];
  statusConfig?: Record<string, StatusConfig>;
  onView?: (item: ListCardItem) => void;
  onEdit?: (item: ListCardItem) => void;
  className?: string;
}

const defaultStatusConfig: Record<string, StatusConfig> = {
  'In Use': { label: 'In Use', className: 'status-in-use' },
  'Maintenance': { label: 'Maintenance', className: 'status-maintenance' },
  'Breakdown': { label: 'Breakdown', className: 'status-breakdown' },
  'In Store': { label: 'In Store', className: 'status-in-store' },
};

const ListCardView: React.FC<ListCardViewProps> = ({
  items,
  statusConfig = defaultStatusConfig,
  onView,
  onEdit,
  className = '',
}) => {
  const getStatusStyle = (status?: string) => {
    if (!status) return '';
    return statusConfig[status]?.className || 'bg-muted text-muted-foreground';
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return '';
    return statusConfig[status]?.label || status;
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-card border border-border rounded-lg p-4 hover:shadow-card-hover transition-shadow"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              {item.subtitle && (
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              )}
            </div>
            {item.status && (
              <span className={`status-badge ${getStatusStyle(item.status)}`}>
                {getStatusLabel(item.status)}
              </span>
            )}
          </div>

          {/* Fields */}
          <div className="space-y-2 py-3 border-b border-border">
            {item.fields.map((field, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{field.label}</span>
                <span className="font-medium text-primary">{field.value}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-around pt-3">
            {(item.viewPath || onView) && (
              item.viewPath ? (
                <Link
                  to={item.viewPath}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Eye size={16} />
                  View
                </Link>
              ) : (
                <button
                  onClick={() => onView?.(item)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Eye size={16} />
                  View
                </button>
              )
            )}
            {(item.editPath || onEdit) && (
              item.editPath ? (
                <Link
                  to={item.editPath}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Edit size={16} />
                  Edit
                </Link>
              ) : (
                <button
                  onClick={() => onEdit?.(item)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Edit size={16} />
                  Edit
                </button>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListCardView;
