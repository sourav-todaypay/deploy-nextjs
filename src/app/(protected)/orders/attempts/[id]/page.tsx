/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import { formatDateTime, toDollars } from '@/utils/utils';
import DetailsPage from '@/components/DetailsPage';
import Table, { Column } from '@/components/Table';
import { getStatusClassAndText } from '@/utils/statusClassAndText';
import { Spinner } from '@/components/Spinner';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { AttemptDetails, OrderAttempts } from './type';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { mapTableData } from '@/utils/mapTableData';
import { DetailItem } from '@/components/DetailItemComponent';

export default function PaymentAttemptDetails() {
  const { id } = useParams();
  const api = useApiInstance();
  const router = useRouter();
  const [paymentAttemptDetails, setPaymentAttemptDetails] =
    useState<OrderAttempts | null>(null);
  const [paymentListLoading, setPaymentListLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchPaymentList = async () => {
      setPaymentListLoading(true);
      try {
        const response: OrderAttempts = await handleResponse(
          api.authenticatedGet(`/internal/d2c-merchants/orders/payment/${id}`),
        );
        setPaymentAttemptDetails(response);
      } catch (error) {
        if (isFailureResponse(error)) {
          toast.error(error.message || 'Failed to fetch payment details');
        } else {
          toast.error('Something went wrong');
        }
      } finally {
        setPaymentListLoading(false);
      }
    };

    fetchPaymentList();
  }, [id]);

  const details: DetailItem[] = paymentAttemptDetails
    ? [
        {
          label: 'Total Amount',
          value: toDollars(paymentAttemptDetails.amount_in_cents),
        },
        {
          label: 'Due Date',
          value: formatDateTime(paymentAttemptDetails.due_date),
        },
        {
          label: 'Payer Bank Details (Sender)',
          value: (
            <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
              {JSON.stringify(
                paymentAttemptDetails.payer_account_details,
                null,
                2,
              )}
            </pre>
          ),
          copyable: true,
          halfWidth:
            Object.keys(paymentAttemptDetails.payer_account_details || {})
              .length > 2,
        },
        {
          label: 'Payee Bank Details (Receiver)',
          value: (
            <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
              {JSON.stringify(
                paymentAttemptDetails.payee_account_details,
                null,
                2,
              )}
            </pre>
          ),
          copyable: true,
          halfWidth:
            Object.keys(paymentAttemptDetails.payee_account_details || {})
              .length > 2,
        },
      ]
    : [];

  const columns: Column[] = [
    {
      label: 'Initiated to GrailPay',
      field: 'created_at',
      formatter: formatDateTime,
    },
    {
      label: 'Status',
      field: 'status',
      render: (status: string) => (
        <span className={`${getStatusClassAndText(status).className}`}>
          {getStatusClassAndText(status).text}
        </span>
      ),
    },
  ];

  const tableData = paymentAttemptDetails?.attempts
    ? mapTableData(paymentAttemptDetails.attempts, columns)
    : [];

  const handleRowClick = (rowData: Record<string, AttemptDetails>) => {
    if (rowData) {
      router.push(`/orders/ach/${rowData.provider_reference_id}`);
    }
  };

  return (
    <>
      <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <Heading headingText="Order Payments" className="px-0 pt-0" />
        <DetailsPage details={details} isLoading={paymentListLoading} />

        {paymentAttemptDetails && paymentAttemptDetails.attempts.length > 0 && (
          <>
            <Heading
              headingText="Payment History"
              showBackButton={false}
              className="!text-2xl px-1"
            />

            <div className="space-y-3 pb-2 pt-4">
              {paymentAttemptDetails && (
                <Table
                  data={tableData}
                  columns={columns}
                  onRowClick={handleRowClick}
                />
              )}

              {paymentListLoading && <Spinner className="mt-10" />}
            </div>
          </>
        )}
      </div>
    </>
  );
}
