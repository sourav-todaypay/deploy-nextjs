/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DynamicForm from '@/components/DynamicForm';
import toast from 'react-hot-toast';
import { GiftCardsFormConfig } from '@/types/formConfig';
import Modal from './Modal';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { GiftCardFormValues } from '@/types/schemas/giftCardSchema';
import { isFailureResponse } from '@/utils/isFailureResponse';

interface GiftCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: Partial<GiftCardFormValues>;
}

export default function GiftCardsModal({
  isOpen,
  onClose,
  initialValues,
  onSuccess,
}: GiftCardsModalProps) {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!initialValues;
  const api = useApiInstance();
  const formConfig = GiftCardsFormConfig(api);

  const methods = useForm<GiftCardFormValues>({
    resolver: zodResolver(formConfig.schema),
    mode: 'onTouched',
    defaultValues: initialValues ?? {
      title: '',
      mode: '',
      percent: undefined,
      maximum_offer_amount_in_cents: undefined,
      minimum_transaction_amount_in_cents: undefined,
      maximum_transaction_amount_in_cents: undefined,
      start_date: undefined,
      end_date: undefined,
      brand_id: [],
      product_id: [],
    },
  });

  const { handleSubmit, reset, formState, watch } = methods;
  const selectedMode = watch('mode');

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [isOpen]);

  const onSubmit = async (data: GiftCardFormValues) => {
    try {
      const formattedData = {
        ...data,
        maximum_offer_amount_in_cents:
          data.maximum_offer_amount_in_cents! * 100,
        minimum_transaction_amount_in_cents:
          data.minimum_transaction_amount_in_cents! * 100,
        maximum_transaction_amount_in_cents:
          data.maximum_transaction_amount_in_cents! * 100,
        start_date: dayjs(data.start_date).toISOString(),
        end_date: dayjs(data.end_date).toISOString(),
      };

      if (selectedMode === 'COUPON') {
        formattedData.percent = undefined;
        formattedData.brand_id = undefined;
      }

      const response = isEditing
        ? await handleResponse(
            api.authenticatedPut(`/internal/offers/${id}`, formattedData),
          )
        : await handleResponse(
            api.authenticatedPost('/internal/offers', formattedData),
          );

      if (response) {
        toast.success('Action Successful');
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

  const filteredFields = useMemo(() => {
    if (selectedMode === 'COUPON') {
      return formConfig.fields.filter(
        field =>
          field.name !== 'percent' &&
          field.name !== 'maximum_offer_amount_in_cents' &&
          field.name !== 'brand_id',
      );
    }
    return formConfig.fields;
  }, [selectedMode]);

  useEffect(() => {
    if (selectedMode === 'COUPON') {
      methods.setValue('percent', undefined);
      methods.setValue('maximum_offer_amount_in_cents', undefined);
      methods.setValue('brand_id', undefined);
    }
  }, [selectedMode, methods, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        methods.clearErrors();
        onClose();
      }}
      title={isEditing ? 'Update Offer' : 'Create Offer'}
      onConfirm={handleSubmit(onSubmit)}
      isLoading={formState.isSubmitting}
      disableButtons={
        !formState.isValid ||
        (isEditing && Object.keys(formState.dirtyFields).length === 0)
      }
      width="w-[27rem]"
      height={selectedMode === 'COUPON' ? 'h-[33rem]' : 'h-[37rem]'}
    >
      <FormProvider {...methods}>
        <div className="overflow-y-auto">
          <DynamicForm fields={filteredFields} />
        </div>
      </FormProvider>
    </Modal>
  );
}
