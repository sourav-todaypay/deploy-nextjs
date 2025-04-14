/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import { formatDate, toDollars } from '@/utils/utils';
import DetailsPage from '@/components/DetailsPage';
import Table, { Column } from '@/components/Table';
import PaginationComponent from '@/components/PaginationComponent';
import { Spinner } from '@/components/Spinner';
import { mapTableData } from '@/utils/mapTableData';
import { PaginationQueryParams } from '@/types/PaginationQueryParams';
import {
  INVOICE_FAILED,
  INVOICE_OVERDUE,
  INVOICE_PENDING,
} from '@/constants/invoiceConstants';
import {
  TRANSACTION_BILLED,
  TRANSACTION_COMPLETED,
} from '@/constants/transactionConstants';
import { CircleAlert, CircleCheck } from 'lucide-react';
import Image from 'next/image';
import { useApiInstance } from '@/hooks/useApiInstance';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { handleResponse } from '@/utils/handleResponse';
import { User } from '../../[id]/type';
import {
  FundsPaginatedResponse,
  Invoice,
  InvoicePaginatedResponse,
} from './type';
import { DetailItem } from '@/components/DetailItemComponent';

export default function BillingDetails() {
  const router = useRouter();
  const api = useApiInstance();
  const { merchant_id } = useParams();
  const searchParams = useSearchParams();
  const pageFromURL = parseInt(searchParams.get('page') || '1');
  const [profileDetails, setProfileDetails] = useState<User | null>(null);
  const [billingHistory, setBillingHistory] = useState<
    InvoicePaginatedResponse | FundsPaginatedResponse | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [billingHistoryLoading, setBillingHistoryLoading] = useState(false);
  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: pageFromURL,
      limit: 10,
      filter: JSON.stringify({ merchant_uuid: merchant_id }),
    });

  useEffect(() => {
    if (!merchant_id) return;
    const fetchProfileDetails = async () => {
      setIsLoading(true);
      try {
        const response: User = await handleResponse(
          api.authenticatedGet(
            `/internal/users/profile?user_uuid=${merchant_id}`,
          ),
        );
        setProfileDetails(response);
      } catch (error) {
        if (isFailureResponse(error)) {
          toast.error(error.message || 'Failed to fetch user details');
        } else {
          toast.error('Something went wrong');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileDetails();
  }, [merchant_id]);

  useEffect(() => {
    if (!merchant_id) return;

    const fetchBillingHistory = async () => {
      setBillingHistoryLoading(true);
      let response: InvoicePaginatedResponse | FundsPaginatedResponse | null =
        null;
      try {
        if (profileDetails?.merchants[0]?.plan_type === 'INVOICING') {
          response = (await handleResponse(
            api.authenticatedGet(`/internal/invoices`, {
              ...paginationParams,
            }),
          )) as InvoicePaginatedResponse;
        } else if (profileDetails?.merchants[0]?.plan_type === 'PREPAID') {
          response = (await handleResponse(
            api.authenticatedGet(`/merchants/wallet/list-funds`, {
              ...paginationParams,
            }),
          )) as FundsPaginatedResponse;
        }
        if (response) {
          setBillingHistory(response);
        }
      } catch (error) {
        if (isFailureResponse(error)) {
          toast.error(error.message || 'Failed to fetch billing');
        } else {
          toast.error('Something went wrong');
        }
      } finally {
        setBillingHistoryLoading(false);
      }
    };

    fetchBillingHistory();
  }, [paginationParams, merchant_id, profileDetails]);

  const allDetails: DetailItem[] = profileDetails
    ? [
        {
          label: 'Current Plan Name',
          value: profileDetails?.merchants[0]?.current_plan_name,
          copyable: true,
        },
        {
          label: 'Plan Type',
          value: profileDetails?.merchants[0]?.plan_type,
          copyable: true,
        },
        {
          label: 'Current Plan Id',
          copyable: true,
          value: profileDetails ? (
            <button
              onClick={() =>
                router.push(
                  `/plans/${profileDetails?.merchants[0]?.current_plan_id}`,
                )
              }
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              {profileDetails?.merchants[0]?.current_plan_id}
            </button>
          ) : (
            '-'
          ),
        },
        {
          label: 'Current Plan Start Date',
          value: formatDate(
            profileDetails?.merchants[0]?.current_plan_start_date,
          ),
        },
        {
          label: 'Current Plan End Date',
          value: formatDate(
            profileDetails?.merchants[0]?.current_plan_end_date,
          ),
        },
        {
          label: 'Next Billing Date',
          value: formatDate(profileDetails?.merchants[0]?.next_billing_date),
        },
      ]
    : [];

  const columns: Column[] =
    profileDetails?.merchants[0]?.plan_type === 'INVOICING'
      ? [
          {
            label: 'Date',
            field: 'created_at',
            formatter: formatDate,
          },
          {
            label: 'Amount',
            field: 'amount_in_cents',
            formatter: toDollars,
          },
          {
            label: 'Due Date',
            field: 'due_date',
            formatter: formatDate,
          },
          {
            label: 'Status',
            field: 'status',
            render: (status: string) =>
              status === INVOICE_PENDING || status === INVOICE_FAILED ? (
                <span className="due">
                  <span className="customer-status">{'Pending'}</span>
                </span>
              ) : status === INVOICE_OVERDUE ? (
                <span className="due">
                  <span>{'Out Standing'}</span>
                </span>
              ) : (
                <span className="active">
                  <span>{'Paid'}</span>
                </span>
              ),
          },
        ]
      : profileDetails?.merchants[0]?.plan_type === 'PREPAID'
        ? [
            {
              label: 'Created At',
              field: 'created_at',
              formatter: formatDate,
            },
            {
              label: 'Amount',
              field: 'amount_in_cents',
              formatter: toDollars,
            },
            {
              label: 'Status',
              field: 'status',
              render: (status: string) => (
                <div
                  className={`w-[6.5625rem] h-[1.475rem] px-[10px] rounded-md flex items-center justify-center gap-x-1
            ${
              status === TRANSACTION_BILLED || status === TRANSACTION_COMPLETED
                ? 'active !text-green-800'
                : status === 'created'
                  ? 'bg-stone-200 text-stone-500'
                  : 'bg-red-200 text-red-800'
            }`}
                >
                  {status === TRANSACTION_BILLED ||
                  status === TRANSACTION_COMPLETED ? (
                    <>
                      <span className="text-sm font-medium">Successful</span>
                      <CircleCheck
                        size={13}
                        className="text-green-600 flex-shrink-0"
                      />
                    </>
                  ) : status === 'created' ? (
                    <>
                      <span className="text-sm font-medium">Created</span>
                      <Image src="/created.svg" alt="created" />
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-medium">Failed</span>
                      <CircleAlert
                        size={13}
                        className="text-red-600 flex-shrink-0"
                      />
                    </>
                  )}
                </div>
              ),
            },
          ]
        : [];

  const tableData = billingHistory
    ? mapTableData(
        profileDetails?.merchants[0]?.plan_type === 'PREPAID'
          ? ((billingHistory as FundsPaginatedResponse).result.data ?? [])
          : ((billingHistory as InvoicePaginatedResponse).data ?? []),
        columns,
      )
    : [];

  const details: DetailItem[] =
    profileDetails?.merchants[0]?.plan_type === 'PREPAID'
      ? allDetails.slice(0, 3)
      : allDetails;

  const handleRowClick = (rowData: Record<string, Invoice>) => {
    if (rowData) {
      router.push(`/merchants/billing/${merchant_id}/${rowData.uuid}`);
    }
  };

  return (
    <>
      <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <Heading
          headingText="Billing Details"
          className="px-0 pt-0"
          navigateTo={`/merchants/${merchant_id}`}
        />
        <DetailsPage details={details} isLoading={isLoading} />

        {profileDetails && (
          <>
            <Heading
              headingText={
                profileDetails?.merchants[0]?.plan_type === 'PREPAID'
                  ? 'Funding History'
                  : 'Billing History'
              }
              showBackButton={false}
              className="!text-2xl px-1"
            />

            <div className="space-y-3 pb-2 pt-4">
              {billingHistory && (
                <Table
                  data={tableData}
                  columns={columns}
                  {...(profileDetails?.merchants[0]?.plan_type !==
                    'PREPAID' && { onRowClick: handleRowClick })}
                />
              )}

              {billingHistory && billingHistory.total_page !== 0 && (
                <PaginationComponent
                  paginationParams={paginationParams}
                  setPaginationParams={setPaginationParams}
                  successResponse={
                    profileDetails?.merchants[0]?.plan_type === 'PREPAID'
                      ? {
                          ...(billingHistory as FundsPaginatedResponse).result,
                          data:
                            (billingHistory as FundsPaginatedResponse).result
                              .data || [],
                        }
                      : (billingHistory as InvoicePaginatedResponse)
                  }
                  isLoading={billingHistoryLoading}
                />
              )}

              {billingHistoryLoading && !billingHistory && (
                <Spinner className="mt-10" />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
