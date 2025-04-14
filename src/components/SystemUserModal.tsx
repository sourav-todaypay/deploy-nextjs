/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DynamicForm from '@/components/DynamicForm';
import toast from 'react-hot-toast';
import { systemUserFormConfig } from '@/types/formConfig';
import Modal from './Modal';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { systemUserFormValues } from '@/types/schemas/systemUserSchema';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Info } from 'lucide-react';

interface SystemUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: Partial<systemUserFormValues>;
}

export default function SystemUsersModal({
  isOpen,
  onClose,
  onSuccess,
  initialValues,
}: SystemUsersModalProps) {
  const { merchant_id } = useParams();
  const api = useApiInstance();
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [responseData, setResponseData] = useState<{
    api_key: string;
    api_secret: string;
    link?: string;
  } | null>(null);

  const methods = useForm<systemUserFormValues>({
    resolver: zodResolver(systemUserFormConfig.schema),
    mode: 'onTouched',
    defaultValues: initialValues ?? {
      refund_amount_limit_in_cents: 1000,
      share_link: false,
    },
  });

  const { handleSubmit, reset, formState } = methods;

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [isOpen]);

  useEffect(() => {
    if (responseData) {
      setSuccessModalOpen(true);
    }
  }, [responseData]);

  const onSubmit = async (data: systemUserFormValues) => {
    try {
      const formattedData = {
        ...data,
        merchant_uuid: merchant_id,
      };
      const response = await handleResponse(
        api.authenticatedPost(`/internal/merchants/api-keys`, formattedData),
      );

      if (response) {
        setResponseData(response);
      }
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Action Failed');
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          methods.clearErrors();
          onClose();
        }}
        title="Create System User"
        onConfirm={handleSubmit(onSubmit)}
        isLoading={formState.isSubmitting}
        disableButtons={!formState.isValid}
        width="w-[27rem]"
        height="h-[15.7rem]"
      >
        <FormProvider {...methods}>
          <div className="max-h-[400px] overflow-y-auto">
            <DynamicForm fields={systemUserFormConfig.fields} />
          </div>
        </FormProvider>
      </Modal>

      <Modal
        isOpen={successModalOpen}
        onClose={() => {
          setSuccessModalOpen(false);
          setResponseData(null);
          reset();
          onSuccess();
          onClose();
        }}
        title="System User Created"
        disableClose
        width="w-[40rem]"
        height="auto"
      >
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-4">
          {responseData && (
            <>
              <div className="relative bg-white dark:bg-gray-900 p-3 rounded-md">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <label className="text-sm font-medium">API Key</label>
                    <div className="text-gray-900 dark:text-gray-100 break-all pr-4">
                      {responseData.api_key}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(responseData.api_key)}
                    className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    aria-label="Copy API Key"
                  >
                    <Image
                      src="/clipboard.svg"
                      alt="Copy"
                      width={18}
                      height={18}
                    />
                  </button>
                </div>
              </div>

              <div className="relative bg-white dark:bg-gray-900 p-3 rounded-md">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Secret</label>
                    <div className="text-gray-900 dark:text-gray-100 break-all pr-4">
                      {showSecret
                        ? responseData.api_secret
                        : '*'.repeat(responseData.api_secret.length)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
                      aria-label="Toggle secret visibility"
                    >
                      {showSecret ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(responseData.api_secret)}
                      className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
                      aria-label="Copy Secret"
                    >
                      <Image
                        src="/clipboard.svg"
                        alt="Copy"
                        width={18}
                        height={18}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {responseData.link && (
                <div className="relative bg-white dark:bg-gray-900 p-3 rounded-md">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <label className="text-sm font-medium">User ID</label>
                      <div className="text-gray-900 dark:text-gray-100 break-all pr-4">
                        {responseData.link}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(responseData.link!)}
                      className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
                      aria-label="Copy User ID"
                    >
                      <Image
                        src="/clipboard.svg"
                        alt="Copy"
                        width={18}
                        height={18}
                      />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-start gap-2 text-sm text-red-600 dark:text-blue-400">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="flex-1">
                  This private key will only be visible once. If you lose or
                  misplace this key you can create another one.
                </p>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
