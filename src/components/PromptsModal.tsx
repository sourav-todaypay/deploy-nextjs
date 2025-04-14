/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DynamicForm from '@/components/DynamicForm';
import toast from 'react-hot-toast';
import { PromptsFormConfig } from '@/types/formConfig';
import Modal from './Modal';
import { useParams } from 'next/navigation';
import { PromptsFormValues } from '@/types/schemas/promptsSchema';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';

interface PromptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: Partial<PromptsFormValues>;
}

export default function PromptsModal({
  isOpen,
  onClose,
  initialValues,
  onSuccess,
}: PromptsModalProps) {
  const { id } = useParams<{ id: string }>();
  const api = useApiInstance();
  const isEditing = !!initialValues;

  const methods = useForm<PromptsFormValues>({
    resolver: zodResolver(PromptsFormConfig.schema),
    mode: 'onTouched',
    defaultValues: initialValues ?? {
      name: '',
      content: '',
    },
  });

  const { handleSubmit, reset, formState } = methods;

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [isOpen]);

  const onSubmit = async (data: PromptsFormValues) => {
    try {
      let response;
      if (isEditing) {
        response = await handleResponse(
          api.authenticatedPut(`/internal/llm/prompts/${id}`, data),
        );
      } else {
        response = await handleResponse(
          api.authenticatedPost('/internal/llm/prompts', data),
        );
      }
      if (response) {
        toast.success('Action successfull!');
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
      title={isEditing ? 'Update LLM Prompt' : 'Create LLM Prompt'}
      onConfirm={handleSubmit(onSubmit)}
      isLoading={formState.isSubmitting}
      disableButtons={!formState.isValid || (isEditing && !formState.isDirty)}
      width="w-[27rem]"
      height="h-[31.7rem]"
    >
      <FormProvider {...methods}>
        <div className="max-h-[400px] overflow-y-auto">
          <DynamicForm fields={PromptsFormConfig.fields} />
        </div>
      </FormProvider>
    </Modal>
  );
}
