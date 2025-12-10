import React from 'react';
import { Settings } from 'lucide-react';

interface FormSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  icon,
  children,
  className = '' 
}) => {
  return (
    <div className={`bg-card rounded-xl border border-border p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
          {icon || <Settings size={20} className="text-primary" />}
        </div>
        <h2 className="text-lg font-semibold text-foreground uppercase tracking-wide">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
};

export default FormSection;
