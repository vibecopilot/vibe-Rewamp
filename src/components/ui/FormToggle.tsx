import React from 'react';

interface FormToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const FormToggle: React.FC<FormToggleProps> = ({ label, checked, onChange, disabled = false }) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-primary' : 'bg-border'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

export default FormToggle;
