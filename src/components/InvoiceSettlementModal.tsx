/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DynamicForm from '@/components/DynamicForm';
import toast from 'react-hot-toast';
import { manualInvoiceSettlementFormConfig } from '@/types/formConfig';
import Modal from './Modal';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { InvoiceSettlementFormValues } from '@/types/schemas/invoiceSettlementSchema';
import { isFailureResponse } from '@/utils/isFailureResponse';

interface InvoiceSettlemetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: Partial<InvoiceSettlementFormValues>;
}

export default function InvoiceSettlementModal({
  isOpen,
  onClose,
  initialValues,
  onSuccess,
}: InvoiceSettlemetModalProps) {
  const api = useApiInstance();
  const methods = useForm<InvoiceSettlementFormValues>({
    resolver: zodResolver(manualInvoiceSettlementFormConfig.schema),
    mode: 'onTouched',
    defaultValues: initialValues ?? {
      utr_number: '',
      invoice_number: '',
    },
  });
  const { handleSubmit, reset, formState } = methods;

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [isOpen]);

  const onSubmit = async (data: InvoiceSettlementFormValues) => {
    try {
      const response = await handleResponse(
        api.authenticatedPost(`/internal/invoices/payment`, data),
      );
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
      title="Manual Invoice Settlement"
      onConfirm={handleSubmit(onSubmit)}
      isLoading={formState.isSubmitting}
      disableButtons={!formState.isValid}
      width="w-[27rem]"
      height="h-[18.7rem]"
    >
      <FormProvider {...methods}>
        <div className="max-h-[400px] overflow-y-auto">
          <DynamicForm fields={manualInvoiceSettlementFormConfig.fields} />
        </div>
      </FormProvider>
    </Modal>
  );
}
