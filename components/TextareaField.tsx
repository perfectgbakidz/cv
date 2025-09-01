import React from 'react';

interface TextareaFieldProps {
  label: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
  className?: string;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  maxLength,
  className = ''
}) => {
  const finalPlaceholder = placeholder || `Enter ${label.toLowerCase()}`;
  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={finalPlaceholder}
        rows={4}
        maxLength={maxLength}
        className={`mt-1 block w-full px-4 py-2.5 bg-white border ${error ? 'border-red-400' : 'border-slate-300'} rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-indigo-500'} focus:border-transparent sm:text-sm transition-all duration-150 ease-in-out`}
      />
      <div className="flex justify-between items-center">
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          {maxLength && (
              <p className={`mt-2 text-sm ${value.length > maxLength * 0.9 ? 'text-red-500' : 'text-slate-500'} ml-auto`}>
                  {value.length} / {maxLength}
              </p>
          )}
      </div>
    </div>
  );
};