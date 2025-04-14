/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import DetailsPage from '@/components/DetailsPage';
import { formatDateTime } from '@/utils/utils';
import LlmProviderModal from '@/components/LlmProviderModal';
import { llmProviderListData } from '../type';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { DetailItem } from '@/components/DetailItemComponent';

export default function ProviderDetails() {
  const { id } = useParams();
  const api = useApiInstance();
  const [providerDetails, setProviderDetails] =
    useState<llmProviderListData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'Edit' | null>(null);

  const openModal = (action: 'Edit') => {
    setModalAction(action);
    setIsOpen(true);
  };

  useEffect(() => {
    if (!id) return;
    fetchProviderDetails();
  }, [id]);

  const fetchProviderDetails = async () => {
    setIsLoading(true);
    try {
      const response: llmProviderListData = await handleResponse(
        api.authenticatedGet(`/internal/llm/providers/${id}`),
      );
      setProviderDetails(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch provider details');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const details: DetailItem[] = providerDetails
    ? [
        {
          label: 'Name',
          value: providerDetails.name,
        },
        {
          label: 'Created At',
          value: formatDateTime(providerDetails.created_at),
        },
        {
          label: 'Weight',
          value: providerDetails.weight,
        },
        {
          label: 'Key',
          value: providerDetails.key,
          copyable: true,
          halfWidth: true,
        },
      ]
    : [];

  const providerManageOptions = providerDetails
    ? [
        {
          label: 'Manage',
          isDropdown: true,
          dropdownItems: [
            {
              label: 'Update',
              onClick: () => openModal('Edit'),
            },
          ],
        },
      ]
    : [];

  return (
    <>
      <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <Heading
          headingText="Provider Details"
          className="px-0 pt-0"
          buttons={providerManageOptions}
        />
        <DetailsPage details={details} isLoading={isLoading} />

        {modalAction === 'Edit' && providerDetails && (
          <LlmProviderModal
            isOpen={isOpen}
            onSuccess={fetchProviderDetails}
            onClose={() => setIsOpen(false)}
            initialValues={{
              name: providerDetails.name,
              key: providerDetails.key,
              weight: providerDetails.weight,
              prompt_id: providerDetails.prompt_id,
            }}
          />
        )}
      </div>
    </>
  );
}
