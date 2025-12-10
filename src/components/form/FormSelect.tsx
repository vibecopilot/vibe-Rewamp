import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
}

interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  required?: boolean;
  options: Option[];
  placeholder?: string;
  containerClassName?: string;
  onChange?: (value: string) => void;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  error,
  required,
  options,
  placeholder = 'Select option',
  containerClassName = '',
  className = '',
  onChange,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          className={`
            w-full px-4 py-2.5 pr-10
            border border-border rounded-lg 
            bg-background text-foreground
            appearance-none cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            transition-all duration-200
            disabled:bg-muted disabled:cursor-not-allowed
            ${error ? 'border-error focus:ring-error' : ''}
            ${className}
          `}
          onChange={handleChange}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown 
          size={18} 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" 
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
};

export default FormSelect;
