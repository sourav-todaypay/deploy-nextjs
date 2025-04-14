import { useState } from 'react';
import { createPortal } from 'react-dom';

export default function InputLabelWithPopover({
  label,
  description,
}: {
  label?: string;
  description?: string;
}) {
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const showPopover = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopoverPosition({
      top: rect.top + window.scrollY + rect.height - 25,
      left: rect.left + window.scrollX + rect.width,
    });
    setIsHovered(true);
  };

  return (
    <label className="text-sm font-medium text-black dark:!text-white mb-1 flex items-center">
      {label}
      {description && (
        <div className="relative flex items-center">
          <button
            type="button"
            className="focus:outline-none"
            onMouseEnter={showPopover}
            onMouseLeave={() => setIsHovered(false)}
          >
            <svg
              className="w-4 h-4 ms-2 text-gray-400 hover:text-gray-500"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>

          {isHovered &&
            createPortal(
              <div
                className="fixed p-2 bg-white border rounded-lg shadow-md dark:!bg-gray-800 dark:!border-gray-600 dark:!text-gray-200 z-[9999] whitespace-nowrap"
                style={{
                  top: popoverPosition.top,
                  left: popoverPosition.left,
                }}
              >
                {description}
              </div>,
              document.body,
            )}
        </div>
      )}
    </label>
  );
}
