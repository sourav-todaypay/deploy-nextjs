/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DynamicForm from '@/components/DynamicForm';
import toast from 'react-hot-toast';
import { merchantSettingsFormConfig } from '@/types/formConfig';
import Modal from './Modal';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { MerchantSettingsFormValues } from '@/types/schemas/merchantSettingsSchema';
import { useParams } from 'next/navigation';

interface MerchantSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: Partial<MerchantSettingsFormValues>;
}

export default function MerchantSettingsModal({
  isOpen,
  onClose,
  initialValues,
  onSuccess,
}: MerchantSettingsModalProps) {
  const api = useApiInstance();
  const { id } = useParams();

  const methods = useForm<MerchantSettingsFormValues>({
    resolver: zodResolver(merchantSettingsFormConfig.schema),
    mode: 'onTouched',
    defaultValues: initialValues ?? {
      merchant_name: '',
      delayed_by: undefined,
      minimum_refund_amount_in_cents: null,
      maximum_refund_amount_in_cents: null,
      sftp_value: false,
      notification_value: false,
    },
  });

  const { handleSubmit, reset, formState } = methods;

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [isOpen]);

  const onSubmit = async (data: MerchantSettingsFormValues) => {
    if (!id) return;
    try {
      const formattedData = {
        ...data,
        merchant_uuid: id,
        merchant_name: undefined,
      };

      const response = await handleResponse(
        api.authenticatedPost('/internal/merchants/update', formattedData),
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
      title={'Update Merchant Settings'}
      onConfirm={handleSubmit(onSubmit)}
      isLoading={formState.isSubmitting}
      disableButtons={
        !formState.isValid && Object.keys(formState.dirtyFields).length === 0
      }
      width="w-[27rem]"
      height="h-[25rem]"
    >
      <FormProvider {...methods}>
        <div className="overflow-y-auto">
          <DynamicForm fields={merchantSettingsFormConfig.fields} />
        </div>
      </FormProvider>
    </Modal>
  );
}
