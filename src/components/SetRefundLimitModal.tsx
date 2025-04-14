/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DynamicForm from '@/components/DynamicForm';
import toast from 'react-hot-toast';
import { setRefundLimitFormConfig } from '@/types/formConfig';
import Modal from './Modal';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { setRefundLimitFormValues } from '@/types/schemas/setRefundLimitSchema';
import { useParams } from 'next/navigation';

interface SetRefundLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: Partial<setRefundLimitFormValues>;
}

export default function SetRefundLimitModal({
  isOpen,
  onClose,
  onSuccess,
  initialValues,
}: SetRefundLimitModalProps) {
  const { id } = useParams();
  const api = useApiInstance();
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [tempData, setTempData] = useState<setRefundLimitFormValues | null>(
    null,
  );

  const methods = useForm<setRefundLimitFormValues>({
    resolver: zodResolver(setRefundLimitFormConfig.schema),
    mode: 'onTouched',
    defaultValues: initialValues ?? { amount_in_cents: 1000 },
  });

  const { handleSubmit, reset, formState } = methods;
  const initialAmount = initialValues?.amount_in_cents ?? 0;

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [isOpen]);

  const submitData = async (data: setRefundLimitFormValues) => {
    try {
      const formattedData = {
        ...data,
        amount_in_cents: data.amount_in_cents * 100,
        merchant_uuid: id,
      };

      const response = await handleResponse(
        api.authenticatedPost(
          '/internal/merchants/edit?category=REFUND_LIMIT',
          formattedData,
        ),
      );

      if (response) {
        toast.success('Action successful');
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

  const onSubmit = (data: setRefundLimitFormValues) => {
    if (data.amount_in_cents < initialAmount) {
      setTempData(data);
      setConfirmationModal(true);
    } else {
      submitData(data);
    }
  };

  return (
    <>
      {confirmationModal && (
        <Modal
          isOpen={confirmationModal}
          onClose={() => setConfirmationModal(false)}
          title="Reducing the refund limit for the day?"
          onConfirm={() => {
            if (tempData) {
              submitData(tempData);
              setConfirmationModal(false);
            }
          }}
          isLoading={formState.isSubmitting}
          disableButtons={formState.isSubmitting}
          width="w-[28rem]"
          height="h-[11.5rem]"
        >
          <div className="px-3">
            This action will reset the refund limit of all users to $0.
          </div>
        </Modal>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => {
          methods.clearErrors();
          onClose();
        }}
        title="Set Refund Limit For Day"
        onConfirm={handleSubmit(onSubmit)}
        isLoading={formState.isSubmitting}
        disableButtons={!formState.isValid}
        width="w-[27rem]"
        height="h-[14.7rem]"
      >
        <FormProvider {...methods}>
          <div className="max-h-[400px] overflow-y-auto">
            <DynamicForm fields={setRefundLimitFormConfig.fields} />
          </div>
        </FormProvider>
      </Modal>
    </>
  );
}
