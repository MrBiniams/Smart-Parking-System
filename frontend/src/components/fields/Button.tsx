import React from 'react';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
}

export default function Button({
  type = 'button',
  onClick,
  children,
  variant = 'primary',
  disabled = false,
  className = ''
}: ButtonProps) {
  const baseStyles = 'flex items-center gap-2 transition duration-200';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40',
    secondary: 'px-6 py-2 text-gray-600 hover:text-gray-800'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
} 