/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import { formatDateTime, formatPhoneNumber, toDollars } from '@/utils/utils';
import DetailsPage from '@/components/DetailsPage';
import { TransactionDetail } from './type';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import Modal from '@/components/Modal';
import CancleDisbursementModal from '@/components/CancleDisbursementModal';
import { transactionStatus } from '@/types/transactionStatus';
import { DetailItem } from '@/components/DetailItemComponent';

export default function RefundsDetails() {
  const { id, userType } = useParams();
  const api = useApiInstance();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [refundDetails, setRefundDetails] = useState<TransactionDetail | null>(
    null,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [actionType, setActionType] = useState<'Resend' | 'Cancle' | ''>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const openModal = (action: 'Resend' | 'Cancle') => {
    setIsOpen(true);
    setActionType(action);
    setModalContent(
      `Are you sure you want to ${action.toLowerCase()} this Claim Token.`,
    );
  };

  useEffect(() => {
    if (!id) return;
    const fetchRefundDetails = async () => {
      setIsLoading(true);
      try {
        const response: TransactionDetail = await handleResponse(
          api.authenticatedGet(`/refunds/${id}`),
        );
        setRefundDetails(response);
      } catch (error) {
        if (isFailureResponse(error)) {
          toast.error(error.message || 'Failed to fetch refund details');
        } else {
          toast.error('Something went wrong');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRefundDetails();
  }, [id]);

  const details: DetailItem[] = refundDetails
    ? [
        {
          label: 'Curret Status',
          value: transactionStatus(refundDetails.current_status_code),
        },
        {
          label: 'Type',
          value: refundDetails.kind,
        },
        {
          label: 'Sub Type',
          value: refundDetails.type,
          copyable: true,
        },
        {
          label: 'First Name',
          value: refundDetails.customer.first_name,
          copyable: true,
        },
        {
          label: 'Last Name',
          value: refundDetails.customer.last_name,
          copyable: true,
        },
        {
          label: 'Phone Number',
          value: formatPhoneNumber(refundDetails.customer.phone_number),
          copyable: true,
        },
        { label: 'Email', value: refundDetails.customer.email, copyable: true },
        {
          label: 'Amount',
          value: toDollars(refundDetails.amount_in_cents),
        },
        {
          label: 'Date & Time',
          value: formatDateTime(refundDetails.status_updates[0].created_at),
        },
        {
          label: userType === 'customers' ? 'Merchant Uuid' : 'Customer Uuid',
          value: refundDetails &&
            (refundDetails.merchant.uuid ||
              refundDetails.customer.account_uuid) && (
              <button
                onClick={() =>
                  router.push(
                    `/${userType === 'customers' ? 'merchants' : 'customers'}/${
                      userType === 'customers'
                        ? refundDetails.merchant.uuid
                        : refundDetails.customer?.account_uuid
                    }`,
                  )
                }
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-4 decoration-1"
              >
                {userType === 'customers'
                  ? refundDetails.merchant.uuid
                  : refundDetails.customer.account_uuid}
              </button>
            ),
        },
        { label: 'Order Ref Id', value: refundDetails.order.id },
        {
          label: 'Txn Uuid',
          value: refundDetails.id,
        },
      ]
    : [];

  const refundManageOptions = [
    {
      label: 'Manage',
      isDropdown: true,
      dropdownItems: [
        {
          label: 'Resend Claim Token',
          onClick: () => openModal('Resend'),
          disabled: false,
        },
        {
          label: 'Cancel Disbursement',
          onClick: () => openModal('Cancle'),
          disabled: false,
        },
      ],
    },
  ];

  const handleResendAction = async () => {
    setIsUpdating(true);
    try {
      const response = await handleResponse(
        api.authenticatedGet(
          `/internal/refunds/resend-token/${refundDetails?.id}`,
        ),
      );
      if (response) {
        toast.success(response.message || 'Action successful');
      }
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

  return (
    <>
      <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <Heading
          headingText="Refund Details"
          buttons={
            userType === 'merchants' &&
            refundDetails?.current_status_code === 101
              ? refundManageOptions
              : undefined
          }
          className="px-0 pt-0"
        />
        <DetailsPage details={details} isLoading={isLoading} />

        {actionType === 'Resend' && (
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title={'Resend Claim Token'}
            onConfirm={handleResendAction}
            isLoading={isUpdating}
            disableButtons={isUpdating}
            width="w-[28rem]"
            height="h-[11.5rem]"
          >
            <div className="px-3">{modalContent}</div>
          </Modal>
        )}

        {actionType === 'Cancle' && (
          <CancleDisbursementModal
            isOpen={isOpen}
            onSuccess={() => {}}
            onClose={() => setIsOpen(false)}
          />
        )}
      </div>
    </>
  );
}
