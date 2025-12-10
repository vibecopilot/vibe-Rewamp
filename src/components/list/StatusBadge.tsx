import React from 'react';
import { ChevronDown } from 'lucide-react';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default';

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  showDropdown?: boolean;
  onClick?: () => void;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  success: 'bg-success-light text-success border-success/20',
  warning: 'bg-warning-light text-warning border-warning/20',
  error: 'bg-error-light text-error border-error/20',
  info: 'bg-info-light text-info border-info/20',
  default: 'bg-muted text-muted-foreground border-border',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'default',
  showDropdown = false,
  onClick,
  className = '',
}) => {
  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      onClick={onClick}
      className={`
        inline-flex items-center gap-1 px-3 py-1 
        text-xs font-medium rounded-md border
        ${statusStyles[type]}
        ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
        ${className}
      `}
    >
      {status}
      {showDropdown && <ChevronDown size={12} />}
    </Component>
  );
};

// Helper function to determine status type from common status strings
export const getStatusType = (status: string): StatusType => {
  const lowercaseStatus = status.toLowerCase();
  
  if (['active', 'approved', 'completed', 'in use', 'success', 'paid'].includes(lowercaseStatus)) {
    return 'success';
  }
  if (['pending', 'maintenance', 'in progress', 'warning', 'in store'].includes(lowercaseStatus)) {
    return 'warning';
  }
  if (['inactive', 'rejected', 'breakdown', 'failed', 'error', 'overdue'].includes(lowercaseStatus)) {
    return 'error';
  }
  if (['new', 'draft', 'info'].includes(lowercaseStatus)) {
    return 'info';
  }
  return 'default';
};

export default StatusBadge;
