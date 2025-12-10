import React from 'react';
import { ChevronDown } from 'lucide-react';

export type StatusType = 'in-use' | 'maintenance' | 'breakdown' | 'in-store' | 'checked-in' | 'checked-out' | 'pending' | 'approved' | 'rejected';

interface StatusConfig {
  label: string;
  className: string;
}

const statusConfigs: Record<StatusType, StatusConfig> = {
  'in-use': {
    label: 'In Use',
    className: 'bg-success-light text-success',
  },
  'maintenance': {
    label: 'Maintenance',
    className: 'bg-warning-light text-warning',
  },
  'breakdown': {
    label: 'Breakdown',
    className: 'bg-error-light text-error',
  },
  'in-store': {
    label: 'In Store',
    className: 'bg-[hsl(24,100%,95%)] text-[hsl(24,100%,50%)]',
  },
  'checked-in': {
    label: 'Checked In',
    className: 'bg-success-light text-success',
  },
  'checked-out': {
    label: 'Checked Out',
    className: 'bg-secondary text-muted-foreground',
  },
  'pending': {
    label: 'Pending',
    className: 'bg-warning-light text-warning',
  },
  'approved': {
    label: 'Approved',
    className: 'bg-success-light text-success',
  },
  'rejected': {
    label: 'Rejected',
    className: 'bg-error-light text-error',
  },
};

interface StatusBadgeProps {
  status: StatusType;
  showDropdown?: boolean;
  size?: 'sm' | 'md';
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(({ 
  status, 
  showDropdown = false,
  size = 'md'
}, ref) => {
  const config = statusConfigs[status] || statusConfigs['pending'];
  
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-3 py-1 text-sm';

  return (
    <span 
      ref={ref}
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses} ${config.className}`}
    >
      {config.label}
      {showDropdown && <ChevronDown className="w-3 h-3" />}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;