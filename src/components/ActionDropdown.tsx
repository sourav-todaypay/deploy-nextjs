/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Fragment, useRef, useState, useEffect } from 'react';
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from '@headlessui/react';
import { MoreVertical } from 'lucide-react';
import ReactDOM from 'react-dom';

export interface Column {
  label: string;
  actionOptions?: {
    label: string;
    onClick: (row: Record<string, any>) => void;
  }[];
}

export const ActionDropdown = ({
  options,
  row,
}: {
  options: Column['actionOptions'];
  row: Record<string, any>;
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 8,
          left: rect.left,
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, []);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        ref={buttonRef}
        className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 dark:!text-gray-300 dark:hover:!text-gray-100"
      >
        <MoreVertical className="w-5 h-5" />
      </MenuButton>

      {ReactDOM.createPortal(
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems
            className="absolute w-40 bg-white dark:!bg-gray-700 border border-gray-200 dark:!border-gray-600 rounded-lg shadow-lg focus:outline-none z-[1000]"
            style={{
              position: 'fixed',
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            {options?.map((option, index) => (
              <MenuItem key={index}>
                <button
                  onClick={() => option.onClick(row)}
                  className={`w-full px-4 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-300 ${
                    index > 0
                      ? 'border-t border-gray-200 dark:border-gray-600'
                      : ''
                  } ${index === 0 ? 'rounded-t-lg' : ''} ${
                    index === (options?.length ?? 0) - 1 ? 'rounded-b-lg' : ''
                  }`}
                >
                  {option.label}
                </button>
              </MenuItem>
            ))}
          </MenuItems>
        </Transition>,
        document.body,
      )}
    </Menu>
  );
};
