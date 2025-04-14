/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import { formatDateTime, toDollars } from '@/utils/utils';
import DetailsPage from '@/components/DetailsPage';
import { WalletTransaction } from '../type';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { DetailItem } from '@/components/DetailItemComponent';

export default function WalletTransactionDetails() {
  const { id, transaction_id } = useParams();
  const api = useApiInstance();
  const [TransactionDetails, setTransactionDetails] =
    useState<WalletTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!transaction_id) return;
    const fetchTransactionDetails = async () => {
      try {
        const response: WalletTransaction = await handleResponse(
          api.authenticatedGet(
            `/wallet/transactions?transaction_id=${transaction_id}&user_uuid=${id}`,
          ),
        );
        setTransactionDetails(response);
      } catch (error) {
        if (isFailureResponse(error)) {
          toast.error(error.message || 'Failed to fetch transaction details');
        } else {
          toast.error('Something went wrong');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [transaction_id]);

  const details: DetailItem[] = TransactionDetails
    ? [
        {
          label: 'Type',
          value: TransactionDetails.type,
          copyable: true,
        },
        {
          label: 'Status',
          value: (
            <span
              className={`${
                TransactionDetails.status === 'success'
                  ? 'active'
                  : TransactionDetails.status === 'pending'
                    ? 'pending'
                    : 'blocked'
              }`}
            >
              {TransactionDetails.status}
            </span>
          ),
        },
        {
          label: 'Amount',
          value: toDollars(TransactionDetails.amount_in_cents),
        },
        {
          label: 'Created At',
          value: formatDateTime(TransactionDetails.created_at),
        },
        {
          label: 'Opening Balance',
          value: toDollars(TransactionDetails.opening_balance_in_cents),
        },
        {
          label: 'Closing Balance',
          value: toDollars(TransactionDetails.closing_balance_in_cents),
        },
        {
          label: 'From Wallet Uuid',
          value: TransactionDetails.from_wallet_uuid,
        },
        {
          label: 'To Wallet Uuid',
          value: TransactionDetails.to_wallet_uuid,
        },
        {
          label: 'Descripton',
          value: TransactionDetails.description,
        },
      ]
    : [];

  return (
    <>
      <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <Heading headingText="Transaction Details" className="px-0 pt-0" />
        <DetailsPage details={details} isLoading={isLoading} />
      </div>
    </>
  );
}
