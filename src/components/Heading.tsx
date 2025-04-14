'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { JSX } from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

interface DropdownItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface ButtonType {
  label: string;
  onClick?: () => void;
  navigateTo?: string;
  isDropdown?: boolean;
  dropdownItems?: DropdownItem[];
}

interface Props {
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
  headingText: string;
  showBackButton?: boolean;
  textSize?: string;
  buttons?: ButtonType[];
  navigateTo?: string;
}

export default function Heading({
  headingText,
  className,
  tag: Tag = 'div',
  buttons = [],
  showBackButton = true,
  navigateTo,
}: Props) {
  const router = useRouter();
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null,
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleNavigate = useCallback(() => {
    if (navigateTo) {
      router.push(navigateTo);
    } else {
      router.back();
    }
  }, [navigateTo, router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownIndex(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between select-none space-y-4 md:space-y-0">
      <Tag
        className={twMerge(
          'text-3xl font-bold leading-snug text-gray-900 dark:text-white transition-colors duration-300 px-4 pt-2 flex items-center',
          className,
        )}
      >
        {showBackButton && (
          <button
            className="p-2 rounded-full bg-white dark:!bg-gray-900 shadow-md 
                       hover:bg-gray-100 dark:hover:bg-gray-800 
                       active:scale-95 transition duration-300 ease-in-out mr-4"
            onClick={handleNavigate}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white transition-colors duration-300" />
          </button>
        )}
        {headingText}
      </Tag>

      {buttons.length > 0 && (
        <div className="flex flex-wrap space-x-2  justify-end pl-2 w-auto">
          {buttons.map((button, index) => {
            const validDropdownItems =
              button.dropdownItems?.filter(item => !item.disabled) ?? [];

            if (button.isDropdown && validDropdownItems.length === 0) {
              return null;
            }

            return (
              <div
                key={index}
                ref={dropdownRef}
                className="relative w-full md:w-auto"
              >
                {!button.isDropdown ? (
                  <button
                    onClick={() =>
                      button.navigateTo
                        ? router.push(button.navigateTo)
                        : button.onClick?.()
                    }
                    className="w-full md:w-auto px-4 py-2 text-sm font-medium border border-gray-900 dark:border-white 
                               text-gray-900 dark:text-white rounded-lg 
                               hover:bg-gray-100 dark:hover:bg-gray-800 
                               transition"
                  >
                    {button.label}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        setOpenDropdownIndex(
                          openDropdownIndex === index ? null : index,
                        )
                      }
                      aria-expanded={openDropdownIndex === index}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg border 
                                 border-gray-900 dark:border-white text-gray-900 dark:text-white 
                                 bg-gray-100 dark:!bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 
                                 transition-all duration-300 w-full md:w-auto"
                    >
                      <span>{button.label}</span>
                      <ChevronDown
                        className={clsx(
                          'w-5 h-5 transition-transform duration-300',
                          {
                            'rotate-180': openDropdownIndex === index,
                            'rotate-0': openDropdownIndex !== index,
                          },
                        )}
                      />
                    </button>

                    {openDropdownIndex === index && (
                      <div
                        role="menu"
                        className="absolute right-0 mt-2 w-48 bg-white dark:!bg-gray-900 shadow-lg rounded-lg z-10 border border-gray-200 dark:border-gray-800"
                      >
                        {validDropdownItems.map((item, idx, arr) => (
                          <button
                            key={idx}
                            onClick={item.onClick}
                            className={`w-full px-4 py-2 text-left text-sm text-gray-900 dark:text-white 
                                        hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-300 
                                        ${idx > 0 ? 'border-t border-gray-200 dark:border-gray-600' : ''} 
                                        ${idx === 0 ? 'rounded-t-lg' : ''} 
                                        ${idx === arr.length - 1 ? 'rounded-b-lg' : ''}`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
