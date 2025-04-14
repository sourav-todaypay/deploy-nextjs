'use client';

import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DynamicForm from '@/components/DynamicForm';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { useParams } from 'next/navigation';
import { handleResponse } from '@/utils/handleResponse';
import { useApiInstance } from '@/hooks/useApiInstance';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { cancleDisbursementFormConfig } from '@/types/formConfig';
import { CancleDisbursementFormValues } from '@/types/schemas/cancleDisbursementSchema';

interface CancleDisbursementProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CancleDisbursementModal({
  isOpen,
  onClose,
  onSuccess,
}: CancleDisbursementProps) {
  const { id } = useParams();
  const api = useApiInstance();
  const methods = useForm<CancleDisbursementFormValues>({
    resolver: zodResolver(cancleDisbursementFormConfig.schema),
    mode: 'onTouched',
    shouldUnregister: false,
    defaultValues: {
      note: '',
    },
  });

  const { handleSubmit, reset, formState } = methods;

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: CancleDisbursementFormValues) => {
    try {
      const response = await handleResponse(
        api.authenticatedDelete(`/payments/${id}`, data),
      );

      if (response) {
        toast.success(response.message || 'Action successful');
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
      title={'Cancel Disbursement'}
      onConfirm={handleSubmit(onSubmit)}
      isLoading={formState.isSubmitting}
      disableButtons={!formState.isValid}
      width="w-[27rem]"
      height="h-[16.7rem]"
    >
      <FormProvider {...methods}>
        <div className="max-h-[400px] overflow-y-auto">
          <DynamicForm fields={cancleDisbursementFormConfig.fields} />
        </div>
      </FormProvider>
    </Modal>
  );
}
