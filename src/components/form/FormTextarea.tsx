import React from 'react';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
}

const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  error,
  required,
  containerClassName = '',
  className = '',
  rows = 4,
  ...props
}) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        className={`
          w-full px-4 py-2.5 
          border border-border rounded-lg 
          bg-background text-foreground
          placeholder:text-muted-foreground
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          transition-all duration-200
          resize-y min-h-[100px]
          disabled:bg-muted disabled:cursor-not-allowed
          ${error ? 'border-error focus:ring-error' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
};

export default FormTextarea;
