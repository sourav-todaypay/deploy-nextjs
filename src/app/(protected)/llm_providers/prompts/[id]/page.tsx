/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import DetailsPage from '@/components/DetailsPage';
import { formatDateTime } from '@/utils/utils';
import PromptsModal from '@/components/PromptsModal';
import { GetAllPromptsResponse } from '../type';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { DetailItem } from '@/components/DetailItemComponent';

export default function PromptDetails() {
  const { id } = useParams();
  const api = useApiInstance();
  const [promptDetails, setPromptDetails] =
    useState<GetAllPromptsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'Update' | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchPromptDetails();
  }, [id]);

  const fetchPromptDetails = async () => {
    setIsLoading(true);
    try {
      const response: GetAllPromptsResponse = await handleResponse(
        api.authenticatedGet(`/internal/llm/prompts/${id}`),
      );
      setPromptDetails(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch prompt details');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const details: DetailItem[] = promptDetails
    ? [
        {
          label: 'Id',
          value: promptDetails.id,
        },
        {
          label: 'Name',
          value: promptDetails.name,
        },
        {
          label: 'Created At',
          value: formatDateTime(promptDetails.created_at),
        },
        {
          label: 'content',
          value: promptDetails.content,
          copyable: true,
          fullWidth: true,
        },
      ]
    : [];

  const openModal = (action: 'Update') => {
    setModalAction(action);
    setIsOpen(true);
  };

  const promptsManageOptions = promptDetails
    ? [
        {
          label: 'Manage',
          isDropdown: true,
          dropdownItems: [
            {
              label: 'Update',
              onClick: () => openModal('Update'),
            },
          ],
        },
      ]
    : [];

  return (
    <>
      <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <Heading
          headingText="Prompt Details"
          className="px-0 pt-0"
          buttons={promptsManageOptions}
        />
        <DetailsPage details={details} isLoading={isLoading} />

        {modalAction === 'Update' && promptDetails && (
          <PromptsModal
            isOpen={isOpen}
            onSuccess={fetchPromptDetails}
            onClose={() => setIsOpen(false)}
            initialValues={{
              name: promptDetails.name,
              content: promptDetails.content,
            }}
          />
        )}
      </div>
    </>
  );
}
