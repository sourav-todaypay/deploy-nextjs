/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DynamicForm from '@/components/DynamicForm';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { useParams } from 'next/navigation';
import { inviteCodeFormConfig } from '@/types/formConfig';
import { InviteCodeFormValues } from '@/types/schemas/inviteCodeSchema';
import { handleResponse } from '@/utils/handleResponse';
import { useApiInstance } from '@/hooks/useApiInstance';
import { isFailureResponse } from '@/utils/isFailureResponse';

interface InviteCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: Partial<InviteCodeFormValues>;
}

export default function InviteCodeModal({
  isOpen,
  onClose,
  initialValues,
  onSuccess,
}: InviteCodeModalProps) {
  const { id } = useParams();
  const api = useApiInstance();
  const isEditing = !!initialValues;
  const formConfig = inviteCodeFormConfig(isEditing);
  const methods = useForm<InviteCodeFormValues>({
    resolver: zodResolver(formConfig.schema),
    mode: 'onTouched',
    shouldUnregister: false,
    defaultValues: initialValues ?? {
      code: '',
      maximum_use_limit: undefined,
      expires_at: '',
    },
  });

  const { handleSubmit, reset, formState } = methods;

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: InviteCodeFormValues) => {
    try {
      let response;
      const formatted = {
        ...data,
        ...(isEditing
          ? { code: data.code }
          : { custom_code: data.code, code: undefined }),
      };

      if (isEditing) {
        response = await handleResponse(
          api.authenticatedPut(`/internal/invites/${id}`, formatted),
        );
      } else {
        response = await handleResponse(
          api.authenticatedPost(`/internal/invites`, formatted),
        );
      }
      if (response) {
        toast.success(
          isEditing
            ? 'Invite Code updated successfully!'
            : 'Invite Code created successfully!',
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        methods.clearErrors();
        onClose();
      }}
      title={isEditing ? 'Edit Invite Code' : 'Create Invite Code'}
      onConfirm={handleSubmit(onSubmit)}
      isLoading={formState.isSubmitting}
      disableButtons={!formState.isValid || (isEditing && !formState.isDirty)}
      width="w-[27rem]"
      height="h-[21.7rem]"
    >
      <FormProvider {...methods}>
        <div className="max-h-[400px] overflow-y-auto">
          <DynamicForm fields={formConfig.fields} />
        </div>
      </FormProvider>
    </Modal>
  );
}
