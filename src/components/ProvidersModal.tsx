/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DynamicForm from '@/components/DynamicForm';
import toast from 'react-hot-toast';
import { ProvidersFormConfig } from '@/types/formConfig';
import Modal from './Modal';
import { useParams } from 'next/navigation';
import { ProviderFormValues } from '@/types/schemas/providerSchema';
import { useApiInstance } from '@/hooks/useApiInstance';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { handleResponse } from '@/utils/handleResponse';

interface ProvidersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: Partial<ProviderFormValues>;
}

export default function ProvidersModal({
  isOpen,
  onClose,
  initialValues,
  onSuccess,
}: ProvidersModalProps) {
  const { id } = useParams<{ id: string }>();
  const api = useApiInstance();
  const isEditing = !!initialValues;

  const methods = useForm<ProviderFormValues>({
    resolver: zodResolver(ProvidersFormConfig.schema),
    mode: 'onTouched',
    defaultValues: initialValues ?? {
      name: '',
      description: '',
      config: '{}',
      weight: null,
    },
  });

  const { handleSubmit, reset, formState } = methods;

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [isOpen]);

  const onSubmit = async (data: ProviderFormValues) => {
    try {
      const formattedData = {
        ...data,
        config: JSON.parse(data.config),
      };
      let response;
      if (isEditing) {
        response = await handleResponse(
          api.authenticatedPut(
            `/internal/giftcards/service-providers/${id}`,
            formattedData,
          ),
        );
      } else {
        response = await handleResponse(
          api.authenticatedPost(
            '/internal/giftcards/service-providers',
            formattedData,
          ),
        );
      }
      if (response) {
        toast.success('Action successful');
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
      title={isEditing ? 'Update Provider' : 'Create provider'}
      onConfirm={handleSubmit(onSubmit)}
      isLoading={formState.isSubmitting}
      disableButtons={!formState.isValid || (isEditing && !formState.isDirty)}
      width="w-[27rem]"
      height="h-[27.7rem]"
    >
      <FormProvider {...methods}>
        <div className="max-h-[400px] overflow-y-auto">
          <DynamicForm fields={ProvidersFormConfig.fields} />
        </div>
      </FormProvider>
    </Modal>
  );
}
