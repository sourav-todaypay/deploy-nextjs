/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DynamicForm from '@/components/DynamicForm';
import toast from 'react-hot-toast';
import { planFormConfig } from '@/types/formConfig';
import Modal from './Modal';
import { PlanFormValues } from '@/types/schemas/planSchema';
import { useParams } from 'next/navigation';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: Partial<PlanFormValues>;
}

export default function PlanModal({
  isOpen,
  onClose,
  initialValues,
  onSuccess,
}: PlanModalProps) {
  const { id } = useParams();
  const api = useApiInstance();
  const isEditing = !!initialValues;

  const methods = useForm<PlanFormValues>({
    resolver: zodResolver(planFormConfig.schema),
    mode: 'onTouched',
    shouldUnregister: true,
    defaultValues: initialValues ?? {
      plan_name: '',
      type: undefined,
      settlement_cycle_in_days: undefined,
      credit_in_cents: undefined,
      minimum_balance_in_cents: null,
    },
  });

  const {
    handleSubmit,
    reset,
    setValue,
    trigger,
    resetField,
    control,
    formState,
  } = methods;
  const watchedValues = useWatch({ control });
  const {
    type: selectedType,
    credit_in_cents: creditInCents,
    minimum_balance_in_cents: minBalanceInCents,
  } = watchedValues;

  useEffect(() => {
    if (initialValues?.type !== selectedType) {
      setValue('minimum_balance_in_cents', null, { shouldValidate: true });
    } else {
      resetField('minimum_balance_in_cents');
    }
    trigger('minimum_balance_in_cents');
  }, [selectedType, setValue, trigger]);

  useEffect(() => {
    if (initialValues?.type !== selectedType && selectedType === 'PREPAID') {
      setValue('credit_in_cents', undefined);
      setValue('settlement_cycle_in_days', undefined);
      trigger();
    }
  }, [selectedType, setValue, trigger]);

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [isOpen, reset]);

  const filteredFields = planFormConfig.fields.filter(field =>
    selectedType === 'PREPAID'
      ? ['plan_name', 'minimum_balance_in_cents', 'type'].includes(field.name)
      : true,
  );

  const onSubmit = async (data: PlanFormValues) => {
    try {
      const formattedData = {
        ...data,
        credit_in_cents: data.credit_in_cents
          ? data.credit_in_cents * 100
          : undefined,
        minimum_balance_in_cents: data.minimum_balance_in_cents
          ? data.minimum_balance_in_cents * 100
          : undefined,
        is_credit_allowed: selectedType === 'INVOICING',
      };

      let response;
      if (isEditing) {
        response = await handleResponse(
          api.authenticatedPut(`/internal/plans/${id}`, formattedData),
        );
      } else {
        response = await handleResponse(
          api.authenticatedPost('/internal/plans', formattedData),
        );
      }
      if (response) {
        toast.success(
          isEditing
            ? 'Plan updated successfully!'
            : 'Plan created successfully!',
        );
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

  useEffect(() => {
    trigger(['credit_in_cents', 'minimum_balance_in_cents']);
  }, [trigger, creditInCents, minBalanceInCents]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        methods.clearErrors();
        onClose();
      }}
      title={isEditing ? 'Edit Plan' : 'Create Plan'}
      onConfirm={handleSubmit(onSubmit)}
      isLoading={formState.isSubmitting}
      disableButtons={!formState.isValid || !formState.isDirty}
      width="w-[27rem]"
      height={selectedType === 'PREPAID' ? 'h-[22.4rem]' : 'h-[30.7rem]'}
    >
      <FormProvider {...methods}>
        <div className="max-h-[400px] overflow-y-auto">
          <DynamicForm fields={filteredFields} />
        </div>
      </FormProvider>
    </Modal>
  );
}
