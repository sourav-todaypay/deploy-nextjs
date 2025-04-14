'use client';

import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DynamicForm from '@/components/DynamicForm';
import toast from 'react-hot-toast';
import { workFlowFormConfig } from '@/types/formConfig';
import Modal from './Modal';
import { WorkFlowFormValues } from '@/types/schemas/workFlowSchema';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';

interface WorkFlowModalProp {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: Partial<WorkFlowFormValues>;
}

export default function WorkFlowModal({
  isOpen,
  onClose,
  initialValues,
  onSuccess,
}: WorkFlowModalProp) {
  const isEditing = !!initialValues;
  const api = useApiInstance();

  const methods = useForm<WorkFlowFormValues>({
    resolver: zodResolver(workFlowFormConfig.schema),
    mode: 'onTouched',
    shouldUnregister: false,
    defaultValues: initialValues ?? {
      name: '',
      transaction_kind: '',
      sub_type: '',
      on_status_code: undefined,
      data: '{}',
      is_default: 'false',
    },
  });

  const { handleSubmit, reset, formState } = methods;

  useEffect(() => {
    if (isOpen) reset(initialValues);
  }, [isOpen, reset, initialValues, methods.trigger]);

  const onSubmit = async (data: WorkFlowFormValues) => {
    try {
      const formattedData = {
        ...data,
        is_default: data.is_default === 'true',
        data: typeof data.data === 'string' ? JSON.parse(data.data) : data.data,
      };

      const response = isEditing
        ? await handleResponse(
            api.authenticatedPut('/internal/workflows', formattedData),
          )
        : await handleResponse(
            api.authenticatedPost('/internal/workflows', formattedData),
          );

      if (response) {
        toast.success(
          isEditing
            ? 'WorkFlow updated successful'
            : 'WorkFlow created successful',
        );
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
      title={isEditing ? 'Edit WorkFlow' : 'Create WorkFlow'}
      onConfirm={handleSubmit(onSubmit)}
      isLoading={formState.isSubmitting}
      disableButtons={!formState.isValid || (isEditing && !formState.isDirty)}
      width="w-[27rem]"
      height="h-[32.9rem]"
    >
      <FormProvider {...methods}>
        <div className="max-h-[400px] overflow-y-auto">
          <DynamicForm fields={workFlowFormConfig.fields} />
        </div>
      </FormProvider>
    </Modal>
  );
}
