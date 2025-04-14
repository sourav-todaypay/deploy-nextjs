/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DynamicForm from '@/components/DynamicForm';
import toast from 'react-hot-toast';
import { MerchantsD2cFormConfig } from '@/types/formConfig';
import Modal from './Modal';
import { useParams } from 'next/navigation';
import { useApiInstance } from '@/hooks/useApiInstance';
import { MerchantD2cFormValues } from '@/types/schemas/merchantD2cSchema';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';

interface MerchantsD2CModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: Partial<MerchantD2cFormValues>;
}

export default function MerchantsD2CModal({
  isOpen,
  onClose,
  initialValues,
  onSuccess,
}: MerchantsD2CModalProps) {
  const { id } = useParams<{ id: string }>();
  const api = useApiInstance();
  const isEditing = !!initialValues;
  const formConfig = MerchantsD2cFormConfig(api);

  const methods = useForm<MerchantD2cFormValues>({
    resolver: zodResolver(formConfig.schema),
    mode: 'onTouched',
    defaultValues: initialValues ?? {
      name: '',
      logo_path: '',
      return_url: '',
      order_number_regex: '',
      refund_processing_days: undefined,
      additional_data: '{}',
      action_state: '{}',
      brand_id: undefined,
      return_policy_link: '',
      is_featured: false,
    },
  });

  const { handleSubmit, reset, formState } = methods;

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [isOpen]);

  const onSubmit = async (data: MerchantD2cFormValues) => {
    try {
      const formattedData = {
        ...data,
        additional_data:
          typeof data.additional_data === 'string'
            ? JSON.parse(data.additional_data)
            : data.additional_data,
        action_state:
          typeof data.action_state === 'string'
            ? JSON.parse(data.action_state)
            : data.action_state,
        ...(isEditing ? { slug: id } : {}),
      };

      const response = isEditing
        ? await handleResponse(
            api.authenticatedPut('/internal/d2c-merchants', formattedData),
          )
        : await handleResponse(
            api.authenticatedPost('/internal/d2c-merchants', formattedData),
          );

      if (response) {
        toast.success('Action Successful');
      }

      onSuccess();
      onClose();
      reset();
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
      title={isEditing ? 'Update Merchant' : 'Create Merchant'}
      onConfirm={handleSubmit(onSubmit)}
      isLoading={formState.isSubmitting}
      disableButtons={
        !formState.isValid ||
        (isEditing && Object.keys(formState.dirtyFields).length === 0)
      }
      width="w-[27rem]"
      height="h-[39.7rem]"
    >
      <FormProvider {...methods}>
        <div className="overflow-y-auto">
          <DynamicForm fields={formConfig.fields} />
        </div>
      </FormProvider>
    </Modal>
  );
}
