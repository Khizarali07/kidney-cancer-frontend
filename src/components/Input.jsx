import React from 'react';

const Input = ({
  label,
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error = '',
  helperText = '',
  className = '',
  required = false,
  disabled = false,
  fullWidth = false,
  startIcon,
  endIcon,
  ...props
}) => {
  const inputClass = `block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500' : ''} ${disabled ? 'bg-gray-100' : ''} ${startIcon ? 'pl-10' : ''} ${endIcon ? 'pr-10' : ''}`;
  const wrapperClass = `relative ${fullWidth ? 'w-full' : 'max-w-md'} ${className}`;

  return (
    <div className={wrapperClass}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative rounded-md shadow-sm">
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {startIcon}
          </div>
        )}
        
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          className={inputClass}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        
        {endIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {endIcon}
          </div>
        )}
      </div>
      
      {error ? (
        <p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-sm text-gray-500" id={`${id}-helper`}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default Input;
