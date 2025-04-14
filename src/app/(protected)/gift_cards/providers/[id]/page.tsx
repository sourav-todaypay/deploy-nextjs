/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import DetailsPage from '@/components/DetailsPage';
import Modal from '@/components/Modal';
import ProvidersModal from '@/components/ProvidersModal';
import { GetProvider } from '../type';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { DetailItem } from '@/components/DetailItemComponent';

export default function GcProviderDetails() {
  const { id } = useParams();
  const api = useApiInstance();
  const [gcProviderDetails, setGcProviderDetails] =
    useState<GetProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [actionType, setActionType] = useState<
    'Deactivate' | 'Activate' | 'Update' | ''
  >('');
  const [isUpdating, setIsUpdating] = useState(false);

  const openModal = (action: 'Deactivate' | 'Activate' | 'Update') => {
    setIsOpen(true);
    setActionType(action);
    setModalContent(
      `Are you sure you want to ${action.toLowerCase()} this Provider.`,
    );
  };

  useEffect(() => {
    if (!id) return;
    fetchGcProviderDetails();
  }, [id]);

  const fetchGcProviderDetails = async () => {
    try {
      const response: GetProvider = await handleResponse(
        api.authenticatedGet(`/internal/giftcards/service-providers/${id}`),
      );
      setGcProviderDetails(response);
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

  const details: DetailItem[] = gcProviderDetails
    ? [
        {
          label: 'Status',
          value: (
            <span
              className={gcProviderDetails.is_activated ? 'active' : 'blocked'}
            >
              {gcProviderDetails.is_activated ? 'Active' : 'Inactive'}
            </span>
          ),
        },
        {
          label: 'Name',
          value: gcProviderDetails.name,
        },
        {
          label: 'Key',
          value: gcProviderDetails.key,
        },
        {
          label: 'Weight',
          value: gcProviderDetails.weight,
        },
        {
          label: 'Description',
          value: gcProviderDetails.description,
        },
        {
          label: 'Config',
          value: (
            <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
              {JSON.stringify(gcProviderDetails.config, null, 2)}
            </pre>
          ),
          copyable: true,
          fullWidth: Object.keys(gcProviderDetails.config || {}).length > 2,
        },
      ]
    : [];

  const providersManageOptions = gcProviderDetails
    ? [
        {
          label: 'Manage',
          isDropdown: true,
          dropdownItems: [
            {
              label: 'Deactivate',
              onClick: () => openModal('Deactivate'),
              disabled: !gcProviderDetails.is_activated,
            },
            {
              label: 'Activate',
              onClick: () => openModal('Activate'),
              disabled: gcProviderDetails.is_activated,
            },
            {
              label: 'Update',
              onClick: () => openModal('Update'),
            },
          ],
        },
      ]
    : [];

  const handleAction = async () => {
    if (!id) return;
    setIsUpdating(true);
    let response;
    try {
      if (actionType === 'Deactivate') {
        response = await handleResponse(
          api.authenticatedPut(`/internal/giftcards/service-providers/${id}`, {
            is_activated: false,
          }),
        );
      } else {
        response = await handleResponse(
          api.authenticatedPut(`/internal/giftcards/service-providers/${id}`, {
            is_activated: true,
          }),
        );
      }
      setGcProviderDetails(prev =>
        prev
          ? {
              ...prev,
              is_activated: actionType !== 'Deactivate',
            }
          : prev,
      );
      if (response) {
        toast.success('Action Successful!');
      }
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error('Action Failed');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <Heading
          headingText="Provider Details"
          className="px-0 pt-0"
          buttons={providersManageOptions}
        />
        <DetailsPage details={details} isLoading={isLoading} />

        {(actionType === 'Deactivate' || actionType === 'Activate') && (
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title={
              actionType === 'Activate'
                ? 'Activate Provider'
                : 'Deactivate Provider'
            }
            onConfirm={handleAction}
            isLoading={isUpdating}
            disableButtons={isUpdating}
            width="w-[28rem]"
            height="h-[11.5rem]"
          >
            <div className="px-3">{modalContent}</div>
          </Modal>
        )}

        {actionType === 'Update' && gcProviderDetails && (
          <ProvidersModal
            isOpen={isOpen}
            onSuccess={fetchGcProviderDetails}
            onClose={() => setIsOpen(false)}
            initialValues={{
              name: gcProviderDetails.name,
              description: gcProviderDetails.description,
              config: JSON.stringify(gcProviderDetails.config, null, 2) || '{}',
              weight: gcProviderDetails.weight,
            }}
          />
        )}
      </div>
    </>
  );
}
