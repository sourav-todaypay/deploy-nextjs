'use client';
import { ChevronDown } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { FiltersState, useFilters } from '@/providers/FiltersProvider';
import dayjs from 'dayjs';

type FilterType = 'search' | 'multi-select' | 'date' | 'radio';

type FilterOption = {
  value: string | boolean;
  label: string;
};

export type FilterConfig = {
  key: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  getOptions?: (currentFilters: Record<string, unknown>) => FilterOption[];
};

interface FilterProps {
  filterCategory: keyof FiltersState;
  filtersConfig: FilterConfig[];
  searchPlaceholders?: Record<string, string>;
  formatFilterValue?: (key: string, value: string) => string;
}

const FilterComponent = ({
  filterCategory,
  filtersConfig,
  searchPlaceholders = {},
  formatFilterValue = (key, value) => value,
}: FilterProps) => {
  const { filters, setFilter } = useFilters();
  const [isSelectedFilter, setIsSelectedFilter] = useState(false);
  const [currActive, setCurrActive] = useState('Add Filter');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateValue, setDateValue] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const appliedFilters: Record<string, unknown> = filters[filterCategory] || {};

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSelectedFilter(false);
        setSearchTerm('');
        setDateValue('');
        setCurrActive('Add Filter');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.currentTarget as HTMLInputElement & {
      showPicker?: () => void;
    };

    if (input.showPicker) {
      input.showPicker();
    } else {
      input.focus();
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateValue(value);
    if (value) {
      const formattedDate = dayjs(value).format('YYYY-MM-DD');
      setFilter(filterCategory, currActive as never, formattedDate as never);
    }
  };

  const handleSearchClick = () => {
    const activeFilter = filtersConfig.find(f => f.key === currActive);
    if (activeFilter) {
      setFilter(
        filterCategory,
        activeFilter.key as never,
        searchTerm.trim() as never,
      );
      setSearchTerm('');
    }
  };

  const handleMultiSelect = (value: string | boolean) => {
    const currentValues =
      (appliedFilters[currActive] as (string | boolean)[]) || [];

    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    setFilter(filterCategory, currActive as never, newValues as never);
  };

  const handleRadioSelect = (value: string | boolean) => {
    setFilter(filterCategory, currActive as never, value as never);
  };

  const removeFilter = (key: string, index?: number) => {
    if (index !== undefined) {
      const currentValues = (appliedFilters[key] as (string | boolean)[]) || [];
      const newValues = currentValues.filter((_, i) => i !== index);

      setFilter(
        filterCategory,
        key as never,
        newValues.length > 0 ? (newValues as never) : (undefined as never),
      );
    } else {
      const currentValue = appliedFilters[key];

      setFilter(
        filterCategory,
        key as never,
        typeof currentValue === 'boolean'
          ? (undefined as never)
          : ('' as never),
      );
    }
  };

  const getOptions = (): FilterOption[] => {
    const filterConfig = filtersConfig.find(f => f.key === currActive);
    if (!filterConfig) return [];

    if (filterConfig.getOptions) {
      return filterConfig.getOptions(appliedFilters);
    }
    return filterConfig.options || [];
  };

  return (
    <div className="flex items-center mt-2 relative" ref={dropdownRef}>
      <div className="flex gap-2">
        <button
          className="border border-gray-400 dark:border-gray-600 px-4 py-2 rounded-md text-sm text-gray-700 dark:text-gray-200 bg-white dark:!bg-gray-800 hover:!bg-gray-100 dark:!hover:bg-gray-700 flex items-center transition-all duration-200"
          onClick={() => setIsSelectedFilter(!isSelectedFilter)}
        >
          <span>
            {currActive === 'Add Filter'
              ? 'Add Filter'
              : filtersConfig.find(f => f.key === currActive)?.label}
          </span>
          <ChevronDown className="ml-2 w-4 h-4 transition-transform duration-200 transform" />
        </button>

        <div className="flex gap-2 ml-4">
          {filtersConfig.map(filter => {
            if (filter.type === 'multi-select') {
              return ((appliedFilters[filter.key] as string[]) || []).map(
                (value: string, index: number) => {
                  const option = filter.options?.find(
                    opt => opt.value === value,
                  );
                  return (
                    <div
                      key={index}
                      className="flex items-center px-3 py-1 border border-gray-400 dark:border-gray-600 rounded-md text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all duration-200"
                    >
                      <span className="mr-2">
                        {filter.label}:{' '}
                        {formatFilterValue(filter.key, option?.label || value)}
                      </span>
                      <button
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-all duration-200"
                        onClick={() => removeFilter(filter.key, index)}
                      >
                        ✕
                      </button>
                    </div>
                  );
                },
              );
            }
            if (filter.type === 'search' && appliedFilters[filter.key]) {
              return (
                <div
                  key={filter.key}
                  className="flex items-center px-3 py-1 border border-gray-400 dark:border-gray-600 rounded-md text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all duration-200"
                >
                  <span className="mr-2">
                    {filter.label}:{' '}
                    {appliedFilters[filter.key as string] as string}
                  </span>
                  <button
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-all duration-200"
                    onClick={() => removeFilter(filter.key)}
                  >
                    ✕
                  </button>
                </div>
              );
            }
            if (filter.type === 'date' && appliedFilters[filter.key]) {
              return (
                <div
                  key={filter.key}
                  className="flex items-center px-3 py-1 border border-gray-400 dark:border-gray-600 rounded-md text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all duration-200"
                >
                  <span className="mr-2">
                    {filter.label}:{' '}
                    {dayjs(
                      appliedFilters[filter.key as string] as string,
                    ).format('MM/DD/YYYY')}
                  </span>
                  <button
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-all duration-200"
                    onClick={() => removeFilter(filter.key)}
                  >
                    ✕
                  </button>
                </div>
              );
            }
            {
              if (
                filter.type === 'radio' &&
                (appliedFilters[filter.key] ||
                  appliedFilters[filter.key] === false) &&
                appliedFilters[filter.key] !== undefined
              ) {
                const value = appliedFilters[filter.key as string];
                const options = filter.options;
                if (options) {
                  return (
                    <div
                      key={filter.key}
                      className="flex items-center px-3 py-1 border border-gray-400 dark:border-gray-600 rounded-md text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all duration-200"
                    >
                      <span className="mr-2">
                        {filter.label}:{' '}
                        {typeof value === 'boolean'
                          ? value
                            ? options[0].label
                            : options[1].label
                          : formatFilterValue(filter.key, value as string)}
                      </span>
                      <button
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-all duration-200"
                        onClick={() => removeFilter(filter.key)}
                      >
                        ✕
                      </button>
                    </div>
                  );
                }
              }

              return null;
            }
          })}
        </div>
      </div>

      {isSelectedFilter && currActive === 'Add Filter' && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:!bg-gray-800 border border-gray-200 dark:!border-gray-700 rounded-md shadow-lg p-2 z-50 transition-all duration-200">
          <ul className="text-gray-800 dark:text-gray-200 pl-0 mb-0">
            {filtersConfig.map(filter => (
              <li
                key={filter.key}
                className="cursor-pointer p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-all duration-200"
                onClick={() => setCurrActive(filter.key)}
              >
                {filter.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {currActive !== 'Add Filter' && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:!bg-gray-800 border border-gray-200 dark:!border-gray-700 rounded-md shadow-lg p-2 transition-all duration-200">
          {filtersConfig.find(f => f.key === currActive)?.type === 'date' ? (
            <div className="relative">
              <input
                type="date"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                value={dateValue}
                onChange={handleDateChange}
                onClick={handleDateInputClick}
              />
              <span className="px-2 py-1 block w-full border rounded-md bg-white dark:bg-gray-900 text-black dark:text-white cursor-pointer">
                {dateValue ? (
                  dayjs(dateValue).format('MM/DD/YYYY')
                ) : (
                  <span className="text-gray-400">Select date</span>
                )}
              </span>
            </div>
          ) : filtersConfig.find(f => f.key === currActive)?.type ===
            'search' ? (
            <>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:!text-gray-200 bg-white dark:!bg-gray-900"
                placeholder={searchPlaceholders[currActive] || 'Search...'}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white p-2 rounded-md transition-all duration-200"
                onClick={handleSearchClick}
              >
                Search
              </button>
            </>
          ) : filtersConfig.find(f => f.key === currActive)?.type ===
            'radio' ? (
            <div className="space-y-2">
              {getOptions().map(option => (
                <label
                  key={option.label}
                  className="flex items-center p-2 text-gray-700 dark:text-gray-200"
                >
                  <input
                    type="radio"
                    name={currActive}
                    value={
                      typeof option.value === 'boolean'
                        ? String(option.value)
                        : option.value
                    }
                    checked={appliedFilters[currActive] === option.value}
                    onChange={() => handleRadioSelect(option.value)}
                    className="mr-2"
                  />

                  {option.label}
                </label>
              ))}
            </div>
          ) : (
            getOptions().map(option => (
              <label
                key={option.label}
                className="flex items-center p-2 text-gray-700 dark:text-gray-200"
              >
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={
                    Array.isArray(appliedFilters[currActive]) &&
                    appliedFilters[currActive].includes(option.value)
                  } // Works for both boolean & string arrays
                  onChange={() => handleMultiSelect(option.value)}
                />
                {option.label}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FilterComponent;
