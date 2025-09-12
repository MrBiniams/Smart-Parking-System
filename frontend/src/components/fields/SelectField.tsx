import React from 'react';

interface Option {
  id: string;
  name: string;
}

interface SelectFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  required?: boolean;
  allowClear?: boolean;
  onClear?: () => void;
}

export default function SelectField({
  id,
  name,
  label,
  value,
  onChange,
  options,
  required = false,
  allowClear = false,
  onClear
}: SelectFieldProps) {
  return (
    <div className="p-6 hover:bg-gray-50/50 transition group relative">
      <label 
        htmlFor={id}
        className="block text-xs font-medium text-gray-600 mb-1.5 group-hover:text-blue-600 transition"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full border-0 p-0 pr-8 focus:ring-0 text-lg text-gray-900 font-medium bg-transparent appearance-none cursor-pointer"
          required={required}
        >
          <option value="">Select {label}</option>
          {options.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center">
          {allowClear && value && (
            <button
              type="button"
              onClick={onClear}
              className="p-1 hover:text-blue-600 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
} 