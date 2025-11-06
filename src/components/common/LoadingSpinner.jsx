import React from 'react';

/**
 * LoadingSpinner Component
 * 
 * A reusable loading spinner component used throughout the application.
 * Supports different sizes and custom messages.
 * 
 * @param {string} size - Size variant: 'small', 'medium', 'large' (default: 'medium')
 * @param {string} message - Optional loading message to display
 * @param {boolean} fullScreen - Whether to display as full screen (default: true)
 * @param {string} className - Additional CSS classes
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  fullScreen = true,
  className = ''
}) => {
  const sizeClasses = {
    small: 'h-8 w-8 border-2',
    medium: 'h-16 w-16 border-4',
    large: 'h-24 w-24 border-6'
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.medium;

  const containerClasses = fullScreen 
    ? 'min-h-screen flex items-center justify-center bg-gray-50'
    : 'flex items-center justify-center p-4';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <div 
          className={`animate-spin rounded-full ${spinnerSize} border-b-purple-600 mx-auto mb-4`}
          role="status"
          aria-label="Loading"
        ></div>
        {message && (
          <p className="text-gray-600 text-lg font-medium">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
