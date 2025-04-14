/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DynamicForm from '@/components/DynamicForm';
import toast from 'react-hot-toast';
import { assignPlanFormConfig } from '@/types/formConfig';
import Modal from './Modal';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { useParams } from 'next/navigation';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { formatDate } from '@/utils/utils';
import { AssignPlanFormValues } from '@/types/schemas/assignplanSchema';

interface AssignPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: Partial<AssignPlanFormValues>;
  current_plan_end_date?: string;
}

export default function AssignPlanModal({
  isOpen,
  onClose,
  initialValues,
  onSuccess,
  current_plan_end_date,
}: AssignPlanModalProps) {
  const api = useApiInstance();
  const { id } = useParams<{ id: string }>();
  const formConfig = useMemo(() => assignPlanFormConfig(api), []);

  const methods = useForm<AssignPlanFormValues>({
    resolver: zodResolver(formConfig.schema),
    mode: 'onTouched',
    defaultValues: initialValues ?? {
      merchant_name: '',
      plan_uuid: '',
      activate_plan_immediately: false,
    },
  });

  const { handleSubmit, reset, formState } = methods;
  const activatePlanImmediately = methods.watch('activate_plan_immediately');

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [isOpen]);

  const onSubmit = async (data: AssignPlanFormValues) => {
    if (!id) return;
    try {
      const formattedData = {
        ...data,
        merchant_uuid: id,
        merchant_name: undefined,
      };
      const response = await handleResponse(
        api.authenticatedPost('/internal/configure-plan', formattedData),
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
      title={'Assign Plan'}
      onConfirm={handleSubmit(onSubmit)}
      isLoading={formState.isSubmitting}
      disableButtons={
        !formState.isValid && Object.keys(formState.dirtyFields).length === 0
      }
      width="w-[27rem]"
      height="h-[21rem]"
    >
      <FormProvider {...methods}>
        <div className="overflow-y-auto">
          <DynamicForm fields={formConfig.fields} />
          {(activatePlanImmediately || current_plan_end_date) && (
            <div className="ml-10">
              Effective from{' '}
              <span className="text-red-600">
                {activatePlanImmediately
                  ? 'Today'
                  : formatDate(current_plan_end_date!)}
              </span>
            </div>
          )}
        </div>
      </FormProvider>
    </Modal>
  );
}
