/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import InputField from '@/components/InputField';

export interface SelectOption {
  label: string;
  value: string | number;
}

interface Field {
  name: string;
  label?: string;
  type: string;
  helperText?: string;
  options?: SelectOption[];
  asyncOptions?: () => Promise<SelectOption[]>;
  maskOptions?: Record<string, unknown>;
  valueAsNumber?: boolean;
  placeholder?: string;
  disabled?: boolean;
  colSpan?: number;
  height?: string;
  checkboxLabel?: string;
}

interface DynamicFormProps {
  fields: Field[];
}

export default function DynamicForm({ fields }: DynamicFormProps) {
  const [asyncOptions, setAsyncOptions] = useState<
    Record<string, SelectOption[]>
  >({});
  const { control, setFocus } = useFormContext();

  useEffect(() => {
    const fetchAsyncOptions = async () => {
      const optionsMap: Record<string, SelectOption[]> = {};

      await Promise.all(
        fields.map(async field => {
          if (
            typeof field.asyncOptions === 'function' &&
            !asyncOptions[field.name]
          ) {
            optionsMap[field.name] = await field.asyncOptions();
          }
        }),
      );

      setAsyncOptions(prev => ({ ...prev, ...optionsMap }));
    };

    if (fields.length > 0) {
      fetchAsyncOptions();
    }
  }, [fields]);

  useEffect(() => {
    if (fields.length > 0) {
      const fieldName = String(fields[0]?.name);

      const timeout = setTimeout(() => {
        if (document.querySelector(`input[name="${fieldName}"]`)) {
          const inputElement = document.querySelector(
            `input[name="${fieldName}"]`,
          ) as HTMLInputElement;

          inputElement?.focus();
        } else {
          setFocus(fieldName, { shouldSelect: true });
        }
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [fields, setFocus]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 px-2">
      {fields.map(field => (
        <div
          key={field.name}
          className={field.colSpan === 2 ? 'col-span-2' : 'col-span-1'}
        >
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <InputField
                {...formField}
                helperText={field.helperText || ''}
                label={field.label || ''}
                type={field.type}
                options={field.options || []}
                asyncOptions={asyncOptions[field.name] || null}
                maskOptions={field.maskOptions || null}
                valueAsNumber={field.valueAsNumber}
                placeholder={field.placeholder || ''}
                disabled={field.disabled || false}
                height={field.height || ''}
                checkboxLabel={field.checkboxLabel || ''}
              />
            )}
          />
        </div>
      ))}
    </div>
  );
}
