/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import { getDaysString } from '@/utils/utils';
import { GenericSuccessResponse } from '@/types/FailureResponse';
import DetailsPage from '@/components/DetailsPage';
import Modal from '@/components/Modal';
import MerchantsD2CModal from '@/components/MerchantsD2cModal';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { MerchantData } from '../type';
import { DetailItem } from '@/components/DetailItemComponent';

export default function MerchantsD2CDetails() {
  const { id } = useParams();
  const api = useApiInstance();
  const [merchantsD2CDetails, setMerchantsD2CDetails] =
    useState<MerchantData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalAction, setModalAction] = useState<
    'Deactivate' | 'Activate' | 'Update' | null
  >(null);
  const [modalContent, setModalContent] = useState('');

  const openModal = (action: 'Deactivate' | 'Activate' | 'Update') => {
    setModalAction(action);
    setIsOpen(true);
    setModalContent(
      `Are you sure you want to ${action.toLowerCase()} this customer.`,
    );
  };

  useEffect(() => {
    if (!id) return;
    fetchMerchantsD2CDetails();
  }, [id]);

  const fetchMerchantsD2CDetails = async () => {
    setIsLoading(true);
    try {
      const response: MerchantData = await handleResponse(
        api.authenticatedGet(`/internal/d2c-merchants/${id}`),
      );
      setMerchantsD2CDetails(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch merchant details');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    setIsUpdating(true);
    try {
      const response: GenericSuccessResponse = await handleResponse(
        api.authenticatedDelete(`/internal/d2c-merchants/${id}`),
      );
      toast.success(response.message || 'Action successful');
      setMerchantsD2CDetails(prev =>
        prev
          ? {
              ...prev,
              is_active: modalAction === 'Activate',
            }
          : prev,
      );
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Action failed');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  const details: DetailItem[] = merchantsD2CDetails
    ? [
        {
          label: 'Name',
          value: merchantsD2CDetails.name,
          copyable: true,
        },
        {
          label: 'Status',
          value: (
            <span
              className={merchantsD2CDetails.is_active ? 'active' : 'blocked'}
            >
              {merchantsD2CDetails.is_active ? 'Active' : 'Inactive'}
            </span>
          ),
        },
        {
          label: 'Feature Brand',
          value: (
            <span
              className={merchantsD2CDetails.is_featured ? 'active' : 'blocked'}
            >
              {merchantsD2CDetails.is_featured ? 'True' : 'False'}
            </span>
          ),
        },

        {
          label: 'Logo Path',
          value: merchantsD2CDetails.logo_path,
          copyable: true,
        },
        {
          label: 'Refund Processing Days',
          value: getDaysString(merchantsD2CDetails.refund_processing_days),
        },
        {
          label: 'Brand Id',
          value: merchantsD2CDetails.brand_id,
        },
        {
          label: 'Return Url',
          value: merchantsD2CDetails.return_url ? (
            <a
              href={merchantsD2CDetails.return_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-4 decoration-1"
            >
              {merchantsD2CDetails.return_url}
            </a>
          ) : (
            '-'
          ),
        },
        {
          label: 'Return Policy Url',
          value: merchantsD2CDetails.return_policy_link ? (
            <a
              href={merchantsD2CDetails.return_policy_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-4 decoration-1"
            >
              {merchantsD2CDetails.return_policy_link}
            </a>
          ) : (
            '-'
          ),
        },
      ]
    : [];

  const d2cMerchantsManageOptions = merchantsD2CDetails
    ? [
        {
          label: 'Manage',
          isDropdown: true,
          dropdownItems: [
            {
              label: 'Deactivate',
              onClick: () => openModal('Deactivate'),
              disabled: !merchantsD2CDetails?.is_active,
            },
            {
              label: 'Activate',
              onClick: () => openModal('Activate'),
              disabled: merchantsD2CDetails?.is_active,
            },
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
          headingText="Merchant Details"
          className="px-0 pt-0"
          buttons={d2cMerchantsManageOptions}
        />
        <DetailsPage details={details} isLoading={isLoading} />

        {(modalAction === 'Activate' || modalAction === 'Deactivate') && (
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title={
              modalAction === 'Activate'
                ? 'Activate D2C Merchant'
                : 'Deactivate D2C Merchant'
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

        {modalAction === 'Update' && merchantsD2CDetails && (
          <MerchantsD2CModal
            isOpen={isOpen}
            onSuccess={fetchMerchantsD2CDetails}
            onClose={() => setIsOpen(false)}
            initialValues={{
              name: merchantsD2CDetails.name,
              logo_path: merchantsD2CDetails.logo_path,
              return_url: merchantsD2CDetails.return_url,
              order_number_regex: merchantsD2CDetails.order_number_regex,
              refund_processing_days:
                merchantsD2CDetails.refund_processing_days,
              additional_data: JSON.stringify(
                merchantsD2CDetails.additional_data,
              ),
              action_state: JSON.stringify(merchantsD2CDetails.action_state),
              brand_id: merchantsD2CDetails.brand_id,
              return_policy_link: merchantsD2CDetails.return_policy_link,
              is_featured: merchantsD2CDetails.is_featured,
            }}
          />
        )}
      </div>
    </>
  );
}
