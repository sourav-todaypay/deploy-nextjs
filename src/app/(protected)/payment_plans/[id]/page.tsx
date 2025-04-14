/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import { addPercentageSign, getDaysString, toDollars } from '@/utils/utils';
import DetailsPage from '@/components/DetailsPage';
import { paymentPlanDetails } from '../type';
import PaymentPlanModal from '@/components/PaymentPlanModal';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { DetailItem } from '@/components/DetailItemComponent';

export default function PaymentPlanDetails() {
  const { id } = useParams();
  const api = useApiInstance();
  const [PaymentPlanDetails, setPaymentPlanDetails] =
    useState<paymentPlanDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'Edit' | null>(null);

  const openModal = (action: 'Edit') => {
    setModalAction(action);
    setIsOpen(true);
  };

  useEffect(() => {
    if (!id) return;
    fetchPaymentPlanDetails();
  }, [id]);

  const fetchPaymentPlanDetails = async () => {
    try {
      const response: paymentPlanDetails = await handleResponse(
        api.authenticatedGet(`/internal/payment-plans/${id}`),
      );
      setPaymentPlanDetails(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch payment plan details');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const details: DetailItem[] = PaymentPlanDetails
    ? [
        {
          label: 'Name',
          value: PaymentPlanDetails.name,
          copyable: true,
        },
        {
          label: 'Status',
          value: (
            <span
              className={PaymentPlanDetails.is_active ? 'active' : 'blocked'}
            >
              {PaymentPlanDetails.is_active ? 'Active' : 'Inactive'}
            </span>
          ),
        },
        {
          label: 'No. of Installements',
          value: PaymentPlanDetails.number_of_installments,
        },
        {
          label: 'Frequency in Days',
          value: PaymentPlanDetails.frequency_in_days,
        },
        {
          label: 'Percentage Per Installements',
          value: addPercentageSign(
            PaymentPlanDetails.percentage_per_installment,
          ),
        },
        {
          label: 'Fee',
          value: toDollars(PaymentPlanDetails.fees_in_cents),
        },
        {
          label: 'Min Txn Amount',
          value: toDollars(
            PaymentPlanDetails.minimum_transaction_amount_in_cents,
          ),
        },
        {
          label: 'Max Txn Amount',
          value: toDollars(
            PaymentPlanDetails.maximum_transaction_amount_in_cents,
          ),
        },
        {
          label: 'Plan Validity',
          value: getDaysString(PaymentPlanDetails.plan_validity_in_days),
        },
      ]
    : [];

  const PaymentPlanManageOptions = PaymentPlanDetails
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
      <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
        <Heading
          headingText="Payment Plan Details"
          className="px-0 pt-0"
          buttons={PaymentPlanManageOptions}
        />
        <DetailsPage details={details} isLoading={isLoading} />

        {modalAction === 'Edit' && PaymentPlanDetails && (
          <PaymentPlanModal
            isOpen={isOpen}
            onSuccess={fetchPaymentPlanDetails}
            onClose={() => setIsOpen(false)}
            initialValues={{
              fees_in_cents: PaymentPlanDetails.fees_in_cents,
              frequency_in_days: PaymentPlanDetails.frequency_in_days,
              internal_name: PaymentPlanDetails.internal_name,
              is_active: PaymentPlanDetails.is_active ? 'true' : 'false',
              maximum_transaction_amount_in_cents:
                PaymentPlanDetails.maximum_transaction_amount_in_cents / 100,
              minimum_transaction_amount_in_cents:
                PaymentPlanDetails.minimum_transaction_amount_in_cents / 100,
              name: PaymentPlanDetails.name,
              number_of_installments: PaymentPlanDetails.number_of_installments,
              percentage_per_installment:
                PaymentPlanDetails.percentage_per_installment,
              plan_validity_in_days: PaymentPlanDetails.plan_validity_in_days,
            }}
          />
        )}
      </div>
    </>
  );
}
