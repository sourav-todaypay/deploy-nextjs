import { useFormContext, Controller } from 'react-hook-form';
import dynamic from 'next/dynamic';
import InputLabelWithPopover from './InputLabelWithPopover';
import dayjs from 'dayjs';
import Select from 'react-select';

const Cleave = dynamic(() => import('cleave.js/react'), { ssr: false });

export type Option = { label: string; value: string | number };

type InputFieldProps = {
  name: string;
  label: string;
  type?: string;
  options?: Option[];
  asyncOptions?: Option[] | null;
  placeholder?: string;
  isTextOnly?: boolean;
  autoFocus?: boolean;
  maskOptions?: unknown;
  helperText: string;
  valueAsNumber?: boolean;
  disabled?: boolean;
  height?: string;
  checkboxLabel?: string;
};

export default function InputField({
  name,
  label,
  type = 'text',
  options = [],
  asyncOptions = null,
  placeholder = '',
  isTextOnly = false,
  maskOptions,
  helperText,
  valueAsNumber = false,
  disabled,
  height,
  checkboxLabel,
}: InputFieldProps) {
  const {
    register,
    control,
    watch,
    formState: { errors },
    setValue,
  } = useFormContext();

  const mergedOptions =
    asyncOptions && asyncOptions.length > 0 ? asyncOptions : options;

  const handleDateInputClick = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget as HTMLInputElement & {
      showPicker?: () => void;
    };

    if (input.showPicker) {
      try {
        input.showPicker();
      } catch (err) {
        console.error(err);
      }
    } else {
      input.focus();
    }
  };

  return (
    <div className="mb-1 mx-2">
      <InputLabelWithPopover label={label} description={helperText} />

      {isTextOnly ? (
        <p className="text-black dark:!text-white">{placeholder}</p>
      ) : (
        (() => {
          switch (type) {
            case 'text':
            case 'email':
            case 'password':
            case 'tel':
            case 'url':
            case 'time':
              return maskOptions ? (
                <Controller
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <Cleave
                      {...field}
                      options={maskOptions}
                      placeholder={placeholder}
                      className={`w-full px-2 py-1 border rounded-md bg-white dark:!bg-black text-black dark:!text-white 
                        focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 
                        ${
                          errors[name]
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-500'
                        }
                      `}
                    />
                  )}
                />
              ) : (
                <input
                  {...register(name)}
                  type="text"
                  placeholder={placeholder}
                  disabled={disabled}
                  className={`
                    w-full px-2 py-1 border rounded-md
                    text-black dark:!text-white 
                    focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500
                    ${
                      errors[name]
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-500'
                    }
                    ${
                      disabled
                        ? '!cursor-not-allowed !opacity-50 !bg-gray-200 dark:!bg-gray-800 dark:!text-white'
                        : 'bg-white dark:!bg-black'
                    }
                  `}
                />
              );

            case 'number':
              return maskOptions ? (
                <Controller
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <Cleave
                      {...field}
                      options={{ ...maskOptions, numeral: true }}
                      placeholder={placeholder}
                      className={`w-full px-2 py-1 border rounded-md bg-white dark:!bg-black text-black dark:!text-white 
                          focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 
                          ${
                            errors[name]
                              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-500'
                          }
                        `}
                      onChange={e => {
                        const rawValue = e.target.rawValue ?? e.target.value;
                        field.onChange(
                          rawValue === '-'
                            ? rawValue
                            : rawValue
                              ? Number(rawValue)
                              : null,
                        );
                      }}
                    />
                  )}
                />
              ) : (
                <input
                  {...register(name, { valueAsNumber: true })}
                  type="number"
                  placeholder={placeholder}
                  inputMode="decimal"
                  pattern="-?\d*"
                  className={`w-full px-2 py-1 border rounded-md bg-white dark:!bg-black text-black dark:!text-white 
                    focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 
                    ${
                      errors[name]
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-500'
                    }
                  `}
                  style={{
                    appearance: 'textfield',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield',
                  }}
                  onWheel={e => e.currentTarget.blur()}
                  onKeyDown={e => {
                    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                      e.preventDefault();
                    }
                  }}
                />
              );

            case 'textarea':
              return (
                <textarea
                  {...register(name)}
                  placeholder={placeholder}
                  className={`w-full px-2 py-1 border rounded-md bg-white dark:!bg-black text-black dark:!text-white
                                focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500
                                ${
                                  errors[name]
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-500'
                                }`}
                  style={{ height: height || 'auto' }}
                />
              );

            case 'select':
              return (
                <select
                  {...register(name, {
                    setValueAs: val => {
                      if (valueAsNumber && val === '') return null;

                      return valueAsNumber ? Number(val) : String(val);
                    },
                  })}
                  className={`w-full px-2 py-1 border rounded-md bg-white dark:!bg-black text-black dark:!text-white 
                    focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 
                    ${
                      errors[name]
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-500'
                    }
                  `}
                  value={watch(name) || ''}
                >
                  <option value="">Select...</option>
                  {mergedOptions.map((option, index) => (
                    <option
                      key={`${option.value}-${index}`}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              );

            case 'radio':
              return (
                <div className="flex w-full">
                  {options.map((option, index) => (
                    <label
                      key={`${option.value}-${index}`}
                      htmlFor={`${name}-${option.value}`}
                      className="flex items-center w-1/2 space-x-2 cursor-pointer"
                    >
                      <input
                        {...register(name)}
                        id={`${name}-${option.value}`}
                        type="radio"
                        value={option.value}
                        name={name}
                        className="w-4 h-4 accent-purple-600 
                                     dark:ring-offset-gray-800 dark:bg-gray-700"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              );
            case 'date':
              return (
                <div className="relative w-full">
                  <input
                    {...register(name, {
                      setValueAs: val =>
                        val ? dayjs(val).format('YYYY-MM-DD') : '',
                    })}
                    type="date"
                    id={`${name}-date`}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    value={
                      watch(name) ? dayjs(watch(name)).format('YYYY-MM-DD') : ''
                    }
                    onChange={e => {
                      const formattedDate = dayjs(
                        e.target.value,
                        'YYYY-MM-DD',
                      ).format('YYYY-MM-DD');
                      setValue(name, formattedDate, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    onClick={handleDateInputClick}
                  />
                  <span
                    className="px-2 py-1 block w-full border rounded-md bg-white dark:!bg-black text-black dark:!text-white 
  focus:ring-1 focus:ring-gray-500 focus:border-gray-500 cursor-pointer"
                  >
                    {watch(name) &&
                    dayjs(watch(name), 'YYYY-MM-DD', true).isValid() ? (
                      dayjs(watch(name)).format('MM/DD/YYYY')
                    ) : (
                      <span className="text-gray-400">{placeholder}</span>
                    )}
                  </span>
                </div>
              );

            case 'datetime-local':
              return (
                <div className="relative w-full">
                  <input
                    {...register(name, {
                      setValueAs: val => (val ? dayjs(val).toISOString() : ''),
                    })}
                    type="datetime-local"
                    id={`${name}-datetime`}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    value={
                      watch(name)
                        ? dayjs(watch(name)).format('YYYY-MM-DDTHH:mm')
                        : ''
                    }
                    onChange={e => {
                      const formattedDateTime = dayjs(
                        e.target.value,
                      ).toISOString();
                      setValue(name, formattedDateTime, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    onClick={handleDateInputClick}
                  />
                  <span
                    className="px-2 py-1 block w-full border rounded-md bg-white dark:!bg-black text-black dark:!text-white 
                                     focus:ring-1 focus:ring-gray-500 focus:border-gray-500 cursor-pointer"
                  >
                    {watch(name) &&
                    dayjs(watch(name), 'YYYY-MM-DDTHH:mm', true).isValid() ? (
                      dayjs(watch(name)).format('MM/DD/YYYY hh:mm A')
                    ) : (
                      <span className="text-gray-400">{placeholder}</span>
                    )}
                  </span>
                </div>
              );

            case 'checkbox':
              return (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register(name)}
                    onChange={e => {
                      const checked = e.target.checked;
                      setValue(name, checked, {
                        shouldTouch: true,
                        shouldDirty: true,
                      });
                    }}
                    checked={watch(name) ?? false}
                    className="w-4 h-4 accent-purple-600 dark:ring-offset-gray-800 dark:bg-gray-700"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
                    {checkboxLabel}
                  </span>
                </label>
              );

            case 'multi-select':
              return (
                <Controller
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={mergedOptions}
                      isMulti
                      placeholder={placeholder}
                      isDisabled={disabled}
                      className="text-black dark:!text-white"
                      classNamePrefix="react-select"
                      closeMenuOnSelect={false}
                      styles={{
                        control: provided => ({
                          ...provided,
                          minHeight: '31px',
                        }),
                        valueContainer: provided => ({
                          ...provided,
                          paddingLeft: '8px',
                        }),
                        input: provided => ({
                          ...provided,
                          margin: 0,
                          padding: 0,
                        }),
                        indicatorsContainer: provided => ({
                          ...provided,
                          height: '31px',
                          padding: '4px',
                        }),
                      }}
                      onChange={selectedOptions => {
                        setValue(
                          name,
                          selectedOptions
                            ? selectedOptions.map(opt => opt.value)
                            : [],
                          { shouldValidate: true, shouldDirty: true },
                        );
                      }}
                      value={mergedOptions.filter(option =>
                        field.value?.includes(option.value),
                      )}
                    />
                  )}
                />
              );

            default:
              return (
                <input
                  {...register(name)}
                  type="text"
                  placeholder={placeholder}
                  disabled={disabled}
                  className={`w-full px-2 py-1 border rounded-md bg-white dark:!bg-black text-black dark:!text-white 
                        focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 
                        ${
                          errors[name]
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-500'
                        }
                        ${
                          disabled
                            ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed opacity-50'
                            : ''
                        }
                      `}
                />
              );
          }
        })()
      )}

      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
}
