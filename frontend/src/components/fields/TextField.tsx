import React from 'react';

interface TextFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: 'text' | 'date' | 'time';
  required?: boolean;
  min?: string;
  disabled?: boolean;
}

export default function TextField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  min,
  disabled = false
}: TextFieldProps) {
  return (
    <div className={`p-6 hover:bg-gray-50/50 transition group ${disabled ? 'opacity-75' : ''}`}>
      <label 
        htmlFor={id}
        className="block text-xs font-medium text-gray-600 mb-1.5 group-hover:text-blue-600 transition"
      >
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border-0 p-0 focus:ring-0 text-lg text-gray-900 font-medium placeholder-gray-400 disabled:bg-transparent disabled:cursor-not-allowed"
        placeholder={placeholder}
        required={required}
        min={min}
        disabled={disabled}
      />
    </div>
  );
} 