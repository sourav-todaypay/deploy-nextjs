/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import {
  formatDate,
  formatDateTime,
  formatPhoneNumber,
  toDollars,
} from '@/utils/utils';
import { FailureResponse } from '@/types/FailureResponse';
import DetailsPage from '@/components/DetailsPage';
import { PaginationQueryParams } from '@/types/PaginationQueryParams';
import Table, { Column } from '@/components/Table';
import { getStatusClassAndText } from '@/utils/statusClassAndText';
import { mapTableData } from '@/utils/mapTableData';
import PaginationComponent from '@/components/PaginationComponent';
import { Spinner } from '@/components/Spinner';
import { useApiInstance } from '@/hooks/useApiInstance';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { handleResponse } from '@/utils/handleResponse';
import {
  OrderPayments,
  PaymentList,
  paymentListPaginatedResponse,
} from './type';
import { DetailItem } from '@/components/DetailItemComponent';

export default function OrderPaymentDetails() {
  const { id } = useParams();
  const api = useApiInstance();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageFromURL = parseInt(searchParams.get('page') || '1');
  const [orderPaymentDetails, setOrderPaymentDetails] =
    useState<OrderPayments | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentListLoading, setPaymentListLoading] = useState(false);
  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: pageFromURL,
      limit: 10,
    });
  const [paymentListData, setPaymentListData] =
    useState<paymentListPaginatedResponse>();

  useEffect(() => {
    if (!id) return;
    fetchOrderPaymentDetails();
  }, [id]);

  const fetchOrderPaymentDetails = async () => {
    try {
      const response: OrderPayments = await handleResponse(
        api.authenticatedGet(`/internal/d2c-merchants/orders/${id}`),
      );
      setOrderPaymentDetails(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch order details');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!orderPaymentDetails) return;
    const fetchPaymentList = async () => {
      setPaymentListLoading(true);
      try {
        const response: paymentListPaginatedResponse = await handleResponse(
          api.authenticatedGet(
            `/internal/d2c-merchants/orders/payments/${orderPaymentDetails.checkout_id}`,
            {
              ...paginationParams,
            },
          ),
        );
        setPaymentListData(response);
      } catch (error) {
        if (isFailureResponse(error)) {
          toast.error(error.message || 'Failed to fetch payment list');
        } else {
          toast.error('Something went wrong');
        }
        const err = error as FailureResponse;
        toast.error(err.message);
      } finally {
        setPaymentListLoading(false);
      }
    };

    fetchPaymentList();
  }, [paginationParams, orderPaymentDetails]);

  const details: DetailItem[] = orderPaymentDetails
    ? [
        {
          label: 'Order ID',
          value: orderPaymentDetails.uuid,
          copyable: true,
        },
        {
          label: 'Brand Name',
          value: orderPaymentDetails.gift_card_brand,
          copyable: true,
        },
        {
          label: 'Name',
          value: `${orderPaymentDetails.first_name || ''} ${
            orderPaymentDetails.last_name || ''
          }`.trim(),
          copyable: true,
        },
        {
          label: 'Email',
          value: orderPaymentDetails.email,
          copyable: true,
        },
        {
          label: 'Phone Number',
          value: orderPaymentDetails.phone_number ? (
            <button
              onClick={() =>
                router.push(`/customers/${orderPaymentDetails.account_uuid}`)
              }
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              {formatPhoneNumber(orderPaymentDetails.phone_number)}
            </button>
          ) : (
            '-'
          ),
        },
        {
          label: 'Order Date',
          value: formatDateTime(orderPaymentDetails.created_at),
          copyable: true,
        },
        {
          label: 'Amount',
          value: toDollars(orderPaymentDetails.total_amount_in_cents),
          copyable: true,
        },
        {
          label: 'Gift Card Amount',
          value: toDollars(orderPaymentDetails.gift_card_amount),
          copyable: true,
        },
        {
          label: 'Gift Card Brand',
          value: orderPaymentDetails.gift_card_brand,
          copyable: true,
        },
        {
          label: 'Gift Card Provider',
          value: orderPaymentDetails.gift_card_provider,
          copyable: true,
        },
        {
          label: 'Payment Plan Selected',
          value: orderPaymentDetails.payment_plan_details ? (
            <button
              onClick={() =>
                router.push(
                  `/payment_plans/${orderPaymentDetails?.payment_plan_details?.uuid}`,
                )
              }
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 "
            >
              {orderPaymentDetails?.payment_plan_details?.plan_name}
            </button>
          ) : (
            '-'
          ),
        },
        {
          label: 'Bank Account Details',
          value: (
            <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
              {JSON.stringify(
                orderPaymentDetails.payer_account_details,
                null,
                2,
              )}
            </pre>
          ),
          copyable: true,
          halfWidth:
            Object.keys(orderPaymentDetails.payer_account_details || {})
              .length > 2,
        },
      ]
    : [];

  const columns: Column[] = [
    { label: 'ID', field: 'uuid' },
    { label: 'Amount', field: 'amount_in_cents', formatter: toDollars },
    { label: 'Due Date', field: 'due_date', formatter: formatDate },
    {
      label: 'Processing Date',
      field: 'processing_date',
      formatter: formatDate,
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

  const tableData = paymentListData?.data
    ? mapTableData(paymentListData.data, columns)
    : [];

  const handleRowClick = (rowData: Record<string, PaymentList>) => {
    if (rowData) {
      router.push(`/orders/attempts/${rowData.uuid}`);
    }
  };

  return (
    <>
      <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <Heading
          headingText="Order Payments"
          navigateTo="/orders"
          className="px-0 pt-0"
        />
        <DetailsPage details={details} isLoading={isLoading} />

        {orderPaymentDetails && (
          <>
            <Heading
              headingText="Payment List"
              showBackButton={false}
              className="!text-2xl px-1"
            />

            <div className="space-y-3 pb-2 pt-4">
              {paymentListData && (
                <Table
                  data={tableData!}
                  columns={columns}
                  onRowClick={handleRowClick}
                />
              )}

              {paymentListData && paymentListData.total_page !== 0 && (
                <PaginationComponent
                  paginationParams={paginationParams}
                  setPaginationParams={setPaginationParams}
                  successResponse={paymentListData}
                  isLoading={paymentListLoading}
                />
              )}
              {paymentListLoading && !paymentListData && (
                <Spinner className="mt-10" />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
