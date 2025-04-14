/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import { addPercentageSign, toDollars } from '@/utils/utils';
import { PaymentMode } from './type';
import DetailsPage from '@/components/DetailsPage';
import Link from 'next/link';
import RedemptionModal from '@/components/RedemptionModal';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { DetailItem } from '@/components/DetailItemComponent';

export default function PayOutModeDetails() {
  const { id } = useParams();
  const api = useApiInstance();
  const [redemptionMethodDetails, setRedemptionMethodDetails] =
    useState<PaymentMode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'Edit' | null>(null);

  const openModal = (action: 'Edit') => {
    setModalAction(action);
    setIsOpen(true);
  };

  useEffect(() => {
    if (!id) return;
    fetchRedemptionMethodDetails();
  }, [id]);

  const fetchRedemptionMethodDetails = async () => {
    try {
      const response: PaymentMode = await handleResponse(
        api.authenticatedGet(`/internal/withdrawal-mode/${id}`),
      );
      setRedemptionMethodDetails(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch payout mode details');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const details: DetailItem[] = redemptionMethodDetails
    ? [
        {
          label: 'Mode',
          value: redemptionMethodDetails.mode,
          copyable: true,
        },
        {
          label: 'Currently Available',
          value: (
            <span className={redemptionMethodDetails ? 'active' : 'blocked'}>
              {redemptionMethodDetails ? 'True' : 'False'}
            </span>
          ),
        },
        {
          label: 'Title',
          value: redemptionMethodDetails.title,
          copyable: true,
        },
        {
          label: 'Settlement Time',
          value: redemptionMethodDetails.settlement_time,
        },
        {
          label: 'Fee Rate Name',
          value: redemptionMethodDetails.fee_rate_name ? (
            <Link
              href={`/feerates/${redemptionMethodDetails.fee_rate_id}`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-4 decoration-1"
            >
              {redemptionMethodDetails.fee_rate_name || '-'}
            </Link>
          ) : (
            '-'
          ),
        },
        {
          label: 'Fee Flat Rate',
          value: toDollars(redemptionMethodDetails.fee_flat_rate_in_cents),
        },
        {
          label: 'Fee Percent Rate',
          value: addPercentageSign(redemptionMethodDetails.fee_percentage_rate),
        },
      ]
    : [];

  const redemptionManageOptions = redemptionMethodDetails
    ? [
        {
          label: 'Manage',
          isDropdown: true,
          dropdownItems: [
            {
              label: 'Edit',
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
          headingText="Payout Mode Details"
          className="px-0 pt-0"
          buttons={redemptionManageOptions}
        />
        <DetailsPage details={details} isLoading={isLoading} />

        {modalAction === 'Edit' && redemptionMethodDetails && (
          <RedemptionModal
            isOpen={isOpen}
            onSuccess={fetchRedemptionMethodDetails}
            onClose={() => setIsOpen(false)}
            initialValues={{
              title: redemptionMethodDetails.title,
              settlement_time: redemptionMethodDetails.settlement_time,
              fee_rate_id: redemptionMethodDetails.fee_rate_id,
            }}
          />
        )}
      </div>
    </>
  );
}
