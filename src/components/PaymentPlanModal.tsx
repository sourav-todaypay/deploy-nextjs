/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DynamicForm from '@/components/DynamicForm';
import toast from 'react-hot-toast';
import { paymentPlanFormConfig } from '@/types/formConfig';
import Modal from './Modal';
import { useParams } from 'next/navigation';
import { PaymentPlanFormValues } from '@/types/schemas/paymentPlanSchema';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { ApiParams } from '@/types/apiParams';

interface PaymentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: Partial<PaymentPlanFormValues>;
}

export default function PaymentPlanModal({
  isOpen,
  onClose,
  initialValues,
  onSuccess,
}: PaymentPlanModalProps) {
  const { id } = useParams();
  const api = useApiInstance();
  const isEditing = !!initialValues;

  const methods = useForm<PaymentPlanFormValues>({
    resolver: zodResolver(paymentPlanFormConfig.schema),
    mode: 'onTouched',
    shouldUnregister: true,
    defaultValues: initialValues ?? {
      name: '',
      internal_name: '',
      plan_validity_in_days: undefined,
      number_of_installments: undefined,
      frequency_in_days: undefined,
      percentage_per_installment: undefined,
      fees_in_cents: undefined,
      maximum_transaction_amount_in_cents: undefined,
      minimum_transaction_amount_in_cents: undefined,
      is_active: 'false',
    },
  });

  const { handleSubmit, reset, formState } = methods;

  useEffect(() => {
    if (isOpen) reset(initialValues);
  }, [isOpen]);

  const onSubmit = async (data: PaymentPlanFormValues) => {
    try {
      let formattedData: ApiParams | ApiParams[];

      if (isEditing) {
        formattedData = {
          ...data,
          fees_in_cents: data.fees_in_cents * 100,
          maximum_transaction_amount_in_cents:
            data.maximum_transaction_amount_in_cents * 100,
          minimum_transaction_amount_in_cents:
            data.minimum_transaction_amount_in_cents * 100,
          is_active: data.is_active === 'true',
        };
      } else {
        formattedData = [
          {
            ...data,
            fees_in_cents: data.fees_in_cents * 100,
            maximum_transaction_amount_in_cents:
              data.maximum_transaction_amount_in_cents * 100,
            minimum_transaction_amount_in_cents:
              data.minimum_transaction_amount_in_cents * 100,
            is_active: data.is_active === 'true',
          },
        ] as ApiParams[];
      }

      let response;

      if (isEditing) {
        response = await handleResponse(
          api.authenticatedPut(
            `/internal/payment-plans/${id}`,
            formattedData as ApiParams,
          ),
        );
      } else {
        response = await handleResponse(
          api.authenticatedPost(
            '/internal/payment-plans/',
            formattedData as unknown as ApiParams,
          ),
        );
      }

      if (response) {
        toast.success('Action Successful');
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
      title={isEditing ? 'Edit Fee Rate' : 'Create Fee Rate'}
      onConfirm={handleSubmit(onSubmit)}
      isLoading={formState.isSubmitting}
      disableButtons={!formState.isValid || (isEditing && !formState.isDirty)}
      width="w-[27rem]"
      height="h-[35.7rem]"
    >
      <FormProvider {...methods}>
        <div className="max-h-[400px] overflow-y-auto">
          <DynamicForm fields={paymentPlanFormConfig.fields} />
        </div>
      </FormProvider>
    </Modal>
  );
}
