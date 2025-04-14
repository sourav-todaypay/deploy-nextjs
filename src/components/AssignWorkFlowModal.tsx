/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DynamicForm from '@/components/DynamicForm';
import toast from 'react-hot-toast';
import { assignWorkFlowFormConfig } from '@/types/formConfig';
import Modal from './Modal';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { useParams } from 'next/navigation';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { AssignWorkFlowFormValues } from '@/types/schemas/assignWorkFlowSchema';

interface AssignWorkFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: Partial<AssignWorkFlowFormValues>;
}

export default function AssignWorkFlowModal({
  isOpen,
  onClose,
  initialValues,
  onSuccess,
}: AssignWorkFlowModalProps) {
  const api = useApiInstance();
  const { id } = useParams<{ id: string }>();
  const formConfig = useMemo(() => assignWorkFlowFormConfig(api), []);

  const methods = useForm<AssignWorkFlowFormValues>({
    resolver: zodResolver(formConfig.schema),
    mode: 'onTouched',
    defaultValues: initialValues ?? {
      merchant_name: '',
      name: '',
    },
  });

  const { handleSubmit, reset, formState } = methods;

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [isOpen]);

  const onSubmit = async (data: AssignWorkFlowFormValues) => {
    if (!id) return;
    try {
      const formattedData = {
        ...data,
        merchant_uuid: id,
        merchant_name: undefined,
      };
      const response = await handleResponse(
        api.authenticatedPost(
          '/internal/workflows/assign-merchant',
          formattedData,
        ),
      );
      if (response) {
        toast.success('Action Successful');
        onSuccess();
        onClose();
        reset();
      }
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
      title={'Assign WorkFlow'}
      onConfirm={handleSubmit(onSubmit)}
      isLoading={formState.isSubmitting}
      disableButtons={
        !formState.isValid && Object.keys(formState.dirtyFields).length === 0
      }
      width="w-[27rem]"
      height="h-[19rem]"
    >
      <FormProvider {...methods}>
        <div className="overflow-y-auto">
          <DynamicForm fields={formConfig.fields} />
        </div>
      </FormProvider>
    </Modal>
  );
}
