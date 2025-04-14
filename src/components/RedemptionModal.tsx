/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DynamicForm from '@/components/DynamicForm';
import toast from 'react-hot-toast';
import { redemptionMethodsFormConfig } from '@/types/formConfig';
import Modal from './Modal';
import { useParams } from 'next/navigation';
import { RedemptionMethodFormValues } from '@/types/schemas/redemptionMethodSchema';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';

interface RedemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: Partial<RedemptionMethodFormValues>;
}

export default function RedemptionModal({
  isOpen,
  onClose,
  initialValues,
  onSuccess,
}: RedemptionModalProps) {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!initialValues;
  const [isFormDirty, setIsFormDirty] = useState(false);
  const api = useApiInstance();

  const FeeRateType = (id: string) => {
    switch (id) {
      case 'ACH':
        return 'INSTANT_ACCESS_ACH';
      case 'OCT':
        return 'INSTANT_ACCESS_OCT';
      case 'GIFT_CARD':
        return 'INSTANT_ACCESS_GIFTCARD';
      case 'PREPAID_CARD':
        return 'INSTANT_ACCESS_PREPAID_CARD';
      default:
        return 'Unknown mode';
    }
  };

  const formConfig = useMemo(
    () => redemptionMethodsFormConfig(api, FeeRateType(id)),
    [id],
  );

  const methods = useForm<RedemptionMethodFormValues>({
    resolver: zodResolver(formConfig.schema),
    mode: 'onTouched',
    defaultValues: initialValues ?? {
      title: '',
      settlement_time: '',
      fee_rate_id: null,
    },
  });

  const { handleSubmit, reset, formState } = methods;

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [isOpen]);

  useEffect(() => {
    setIsFormDirty(formState.isDirty);
  }, [formState.isDirty]);

  const onSubmit = async (data: RedemptionMethodFormValues) => {
    try {
      if (isEditing) {
        const response = await handleResponse(
          api.authenticatedPut(`/internal/withdrawal-modes/${id}`, data),
        );
        if (response) {
          toast.success('Updated successful');
        }
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
      title="Edit Payout Mode"
      onConfirm={handleSubmit(onSubmit)}
      isLoading={formState.isSubmitting}
      disableButtons={!formState.isValid || !isFormDirty}
      width="w-[27rem]"
      height="h-[22.7rem]"
    >
      <FormProvider {...methods}>
        <div className="max-h-[400px] overflow-y-auto">
          <DynamicForm fields={formConfig.fields} />
        </div>
      </FormProvider>
    </Modal>
  );
}
