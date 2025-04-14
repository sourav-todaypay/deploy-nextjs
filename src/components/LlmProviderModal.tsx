/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DynamicForm from '@/components/DynamicForm';
import toast from 'react-hot-toast';
import { llmProviderFormConfig } from '@/types/formConfig';
import Modal from './Modal';
import { useParams } from 'next/navigation';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { LlmProviderFormValues } from '@/types/schemas/llmProviderSchema';
import { isFailureResponse } from '@/utils/isFailureResponse';

interface LlmProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: Partial<LlmProviderFormValues>;
}

export default function LlmProviderModal({
  isOpen,
  onClose,
  initialValues,
  onSuccess,
}: LlmProviderModalProps) {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!initialValues;
  const api = useApiInstance();
  const formConfig = useMemo(() => llmProviderFormConfig(api), []);

  const methods = useForm<LlmProviderFormValues>({
    resolver: zodResolver(formConfig.schema),
    mode: 'onTouched',
    defaultValues: initialValues ?? {
      name: '',
      key: '',
      weight: undefined,
      prompt_id: 0,
    },
  });

  const { handleSubmit, reset, formState } = methods;

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [isOpen]);

  const onSubmit = async (data: LlmProviderFormValues) => {
    try {
      let response;
      if (isEditing) {
        response = await handleResponse(
          api.authenticatedPut(`/internal/llm/providers/${id}`, data),
        );
      } else {
        response = await handleResponse(
          api.authenticatedPost('/internal/llm/providers', data),
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
      title="Update LLM Provider"
      onConfirm={handleSubmit(onSubmit)}
      isLoading={formState.isSubmitting}
      disableButtons={!formState.isValid || (isEditing && !formState.isDirty)}
      width="w-[27rem]"
      height="h-[25.7rem]"
    >
      <FormProvider {...methods}>
        <div className="max-h-[400px] overflow-y-auto">
          <DynamicForm fields={formConfig.fields} />
        </div>
      </FormProvider>
    </Modal>
  );
}
