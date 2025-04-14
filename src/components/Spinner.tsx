'use client';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function Spinner({ size = 'medium', className = '' }: SpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-10 h-10 border-4',
    large: 'w-16 h-16 border-4',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`animate-spin inline-block border-[4.5px] border-current border-t-transparent text-gray-800 dark:!text-white rounded-full ${sizeClasses[size]}`}
      />
    </div>
  );
}
