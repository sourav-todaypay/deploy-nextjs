/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import { addPercentageSign, toDollars } from '@/utils/utils';
import DetailsPage from '@/components/DetailsPage';
import { FeeRate } from '../type';
import Modal from '@/components/Modal';
import FeeRateModal from '@/components/FeeRateModal';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { DetailItem } from '@/components/DetailItemComponent';

export default function FeeRateDetails() {
  const { id } = useParams();
  const api = useApiInstance();
  const router = useRouter();
  const [feeRateDetails, setFeeRateDetails] = useState<FeeRate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalAction, setModalAction] = useState<'Delete' | 'Edit' | null>(
    null,
  );

  const openModal = (action: 'Delete' | 'Edit') => {
    setModalAction(action);
    setIsOpen(true);
  };

  useEffect(() => {
    if (!id) return;
    fetchFeeRateDetails();
  }, [id]);

  const fetchFeeRateDetails = async () => {
    setIsLoading(true);
    try {
      const response: FeeRate = await handleResponse(
        api.authenticatedGet(`/internal/instant-gratification-fee/${id}`),
      );
      setFeeRateDetails(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch feerate details');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const details: DetailItem[] = feeRateDetails
    ? [
        {
          label: 'Name',
          value: feeRateDetails.name,
          copyable: true,
        },
        {
          label: 'Entity',
          value: feeRateDetails.entity,
        },
        {
          label: 'Type',
          value: feeRateDetails.type,
        },
        {
          label: 'Flat Rate',
          value: toDollars(feeRateDetails.flat_rate_in_cents),
        },
        {
          label: 'Fee Percentage',
          value: addPercentageSign(feeRateDetails.percentage_rate),
        },
        {
          label: 'Fee rate Id',
          value: feeRateDetails.id,
        },
        {
          label: 'Description',
          value: feeRateDetails.description,
        },
      ]
    : [];

  const feeRateManageOptions = feeRateDetails
    ? [
        {
          label: 'Manage',
          isDropdown: true,
          dropdownItems: [
            {
              label: 'Delete',
              onClick: () => openModal('Delete'),
            },
            {
              label: 'Edit',
              onClick: () => openModal('Edit'),
            },
          ],
        },
      ]
    : [];

  const handleDelete = async () => {
    if (!feeRateDetails) return;
    setIsUpdating(true);
    try {
      const response = await handleResponse(
        api.authenticatedDelete(`/internal/instant-gratification-fee/${id}`),
      );
      router.replace('/feerates');
      setIsOpen(false);
      if (response.message) {
        toast.success('Fee Rate deleted successfully');
      }
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to delete Fee Rate');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <Heading
          headingText="Fee Rate Details"
          className="px-0 pt-0"
          buttons={feeRateManageOptions}
        />
        <DetailsPage details={details} isLoading={isLoading} />

        {modalAction === 'Delete' && (
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title={'Delete Fee Rate'}
            onConfirm={handleDelete}
            isLoading={isUpdating}
            disableButtons={isUpdating}
            width="w-[28rem]"
            height="h-[11.5rem]"
          >
            <div className="px-3">
              {'Are you sure you wanna Delete this Fee Rate'}
            </div>
          </Modal>
        )}

        {modalAction === 'Edit' && feeRateDetails && (
          <FeeRateModal
            isOpen={isOpen}
            onSuccess={fetchFeeRateDetails}
            onClose={() => setIsOpen(false)}
            initialValues={{
              name: feeRateDetails.name,
              description: feeRateDetails.description,
              flat_rate_in_cents: feeRateDetails.flat_rate_in_cents / 100,
              percentage_rate: feeRateDetails.percentage_rate,
              entity: feeRateDetails.entity,
              type: feeRateDetails.type,
            }}
          />
        )}
      </div>
    </>
  );
}
