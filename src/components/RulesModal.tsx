/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DynamicForm from '@/components/DynamicForm';
import toast from 'react-hot-toast';
import { RulesFormConfig } from '@/types/formConfig';
import Modal from './Modal';
import { useParams } from 'next/navigation';
import { useApiInstance } from '@/hooks/useApiInstance';
import { RulesFormValues } from '@/types/schemas/rulesSchema';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { handleResponse } from '@/utils/handleResponse';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: Partial<RulesFormValues>;
  brandId?: number;
}

export default function RulesModal({
  isOpen,
  onClose,
  initialValues,
  onSuccess,
  brandId,
}: RulesModalProps) {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!initialValues;
  const api = useApiInstance();
  const formConfig = RulesFormConfig(api);

  const methods = useForm<RulesFormValues>({
    resolver: zodResolver(formConfig.schema),
    mode: 'onTouched',
    defaultValues: initialValues ?? {
      name: '',
      provider_id: undefined,
      rule: undefined,
      amount_in_cents: null,
      weight: null,
    },
  });

  const { handleSubmit, reset, formState } = methods;

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [isOpen]);

  const onSubmit = async (data: RulesFormValues) => {
    try {
      const formattedData = {
        ...data,
        amount_in_cents: data.amount_in_cents! * 100,
        ...(isEditing ? {} : { brand_id: brandId }),
      };
      let response;
      if (isEditing) {
        response = await handleResponse(
          api.authenticatedPut(
            `/internal/giftcards/brands/rules/${id}`,
            formattedData,
          ),
        );
      } else {
        response = await handleResponse(
          api.authenticatedPost(
            '/internal/giftcards/brands/rules',
            formattedData,
          ),
        );
      }
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
      title={isEditing ? 'Update Rule' : 'Create Rule'}
      onConfirm={handleSubmit(onSubmit)}
      isLoading={formState.isSubmitting}
      disableButtons={!formState.isValid || (isEditing && !formState.isDirty)}
      width="w-[27rem]"
      height="h-[24.7rem]"
    >
      <FormProvider {...methods}>
        <div className="max-h-[400px] overflow-y-auto">
          <DynamicForm fields={formConfig.fields} />
        </div>
      </FormProvider>
    </Modal>
  );
}
