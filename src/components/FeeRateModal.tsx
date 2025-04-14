'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DynamicForm from '@/components/DynamicForm';
import toast from 'react-hot-toast';
import { feeRateFormConfig } from '@/types/formConfig';
import Modal from './Modal';
import { useParams } from 'next/navigation';
import { customerFeeRateTypes, merchantFeeRateTypes } from '@/types/feeRate';
import { FeeRateFormValues } from '@/types/schemas/feeRateSchema';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';

interface FeeRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: Partial<FeeRateFormValues>;
}

export default function FeeRateModal({
  isOpen,
  onClose,
  initialValues,
  onSuccess,
}: FeeRateModalProps) {
  const { id } = useParams();
  const api = useApiInstance();
  const isEditing = !!initialValues;
  const [isFormDirty, setIsFormDirty] = useState(false);

  const methods = useForm<FeeRateFormValues>({
    resolver: zodResolver(feeRateFormConfig([]).schema),
    mode: 'onTouched',
    shouldUnregister: true,
    defaultValues: initialValues ?? {
      name: '',
      description: '',
      flat_rate_in_cents: undefined,
      percentage_rate: undefined,
      entity: undefined,
      type: '',
    },
  });

  const { handleSubmit, reset, control, formState, setValue, watch } = methods;

  const entity = useWatch({ control, name: 'entity' }) || '';
  const type = watch('type');

  const typeOptions = useMemo(() => {
    if (entity === 'CUSTOMER') return customerFeeRateTypes;
    if (entity === 'MERCHANT') return merchantFeeRateTypes;
    return [];
  }, [entity]);

  const formConfig = useMemo(
    () => feeRateFormConfig(typeOptions),
    [typeOptions],
  );

  useEffect(() => {
    if (isOpen) reset(initialValues);
  }, [isOpen, reset, initialValues]);

  useEffect(() => {
    setIsFormDirty(formState.isDirty);
  }, [formState.isDirty]);

  useEffect(() => {
    if (type && !typeOptions.some(option => option.value === type)) {
      setValue('type', '', { shouldValidate: true, shouldDirty: true });
    }
  }, [entity, typeOptions, type, setValue]);

  const onSubmit = async (data: FeeRateFormValues) => {
    try {
      const formattedData = {
        ...data,
        flat_rate_in_cents: data.flat_rate_in_cents * 100,
      };

      let response;

      if (isEditing) {
        response = await handleResponse(
          api.authenticatedPut(
            `/internal/instant-gratification-fee/${id}`,
            formattedData,
          ),
        );
      } else {
        response = await handleResponse(
          api.authenticatedPost(
            '/internal/instant-gratification-fee',
            formattedData,
          ),
        );
      }

      if (response) {
        toast.success('Action Successful');
      }

      onSuccess();
      onClose();
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Action Failed');
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        methods.clearErrors();
        onClose();
      }}
      title={isEditing ? 'Edit Fee Rate' : 'Create Fee Rate'}
      onConfirm={handleSubmit(onSubmit)}
      isLoading={formState.isSubmitting}
      disableButtons={!formState.isValid || !isFormDirty}
      width="w-[27rem]"
      height="h-[30.7rem]"
    >
      <FormProvider {...methods}>
        <div className="max-h-[400px] overflow-y-auto">
          <DynamicForm fields={formConfig.fields} />
        </div>
      </FormProvider>
    </Modal>
  );
}
