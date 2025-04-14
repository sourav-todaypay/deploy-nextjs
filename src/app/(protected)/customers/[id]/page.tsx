/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import { formatDateTime, formatPhoneNumber, toDollars } from '@/utils/utils';
import { Customer, TransactionsPaginatedResponse } from './type';
import DetailsPage from '@/components/DetailsPage';
import Modal from '@/components/Modal';
import Table, { Column } from '@/components/Table';
import PaginationComponent from '@/components/PaginationComponent';
import { Spinner } from '@/components/Spinner';
import { mapTableData } from '@/utils/mapTableData';
import { PaginationQueryParams } from '@/types/PaginationQueryParams';
import {
  TRANSACTION_BILLED,
  TRANSACTION_COMPLETED,
} from '@/constants/transactionConstants';
import { CircleAlert, CircleCheck } from 'lucide-react';
import Image from 'next/image';
import { useApiInstance } from '@/hooks/useApiInstance';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { handleResponse } from '@/utils/handleResponse';
import { GenericSuccessResponse } from '@/types/FailureResponse';
import { DetailItem } from '@/components/DetailItemComponent';

export default function CustomerDetails() {
  const api = useApiInstance();
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const pageFromURL = parseInt(searchParams.get('page') || '1');
  const [customerDetails, setCustomerDetails] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [actionType, setActionType] = useState<'Block' | 'Unblock' | ''>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [refundsLoading, setRefundsLoading] = useState(false);

  const openModal = (action: 'Block' | 'Unblock') => {
    setIsOpen(true);
    setActionType(action);
    setModalContent(
      `Are you sure you want to ${action.toLowerCase()} this customer.`,
    );
  };

  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: pageFromURL,
      limit: 10,
      filter: JSON.stringify({ account_uuid: id }),
    });
  const [refundsData, setRefundsData] =
    useState<TransactionsPaginatedResponse>();

  useEffect(() => {
    if (!id) return;
    const fetchCustomerDetails = async () => {
      setIsLoading(true);
      try {
        const response: Customer = await handleResponse(
          api.authenticatedGet(`/merchants/customers/${id}`),
        );
        setCustomerDetails(response);
      } catch (error) {
        if (isFailureResponse(error)) {
          toast.error(error.message || 'Failed to fetch customer details');
        } else {
          toast.error('Something went wrong');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [id]);

  const addToDenyList = async (phoneNumbers: string[]) => {
    try {
      const response: GenericSuccessResponse = await handleResponse(
        api.authenticatedPost('/merchants/deny-list', {
          identifiers: phoneNumbers,
        }),
      );
      if (response.message) {
        toast.success('Customer blocked successfully.');
      }
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to block customer.');
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  const removeFromDenyList = async (phoneNumber: string) => {
    try {
      const response: GenericSuccessResponse = await handleResponse(
        api.authenticatedDelete(`/merchants/deny-list/${phoneNumber}`),
      );
      if (response.message) {
        toast.success('Customer unblocked successfully.');
      }
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to unblock customer.');
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchRefunds = async () => {
      setRefundsLoading(true);
      try {
        const response: TransactionsPaginatedResponse = await handleResponse(
          api.authenticatedGet(`/refunds`, {
            ...paginationParams,
          }),
        );
        setRefundsData(response);
        setRefundsLoading(false);
      } catch (error) {
        if (isFailureResponse(error)) {
          toast.error(error.message);
        } else {
          toast.error('Something went wrong');
        }
        setRefundsLoading(false);
      }
    };

    fetchRefunds();
  }, [id, paginationParams]);

  const handleAction = async () => {
    if (!customerDetails?.phone_number) return;
    setIsUpdating(true);
    try {
      if (actionType === 'Block') {
        await addToDenyList([customerDetails.phone_number]);
      } else {
        await removeFromDenyList(customerDetails.phone_number);
      }

      setCustomerDetails(prev =>
        prev
          ? { ...prev, status: actionType === 'Block' ? 'blocked' : 'active' }
          : prev,
      );
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  const details: DetailItem[] = customerDetails
    ? [
        {
          label: 'Status',
          value: (
            <span
              className={
                customerDetails.status === 'active' ? 'active' : 'blocked'
              }
            >
              {customerDetails.status === 'active' ? 'Active' : 'Blocked'}
            </span>
          ),
        },
        {
          label: 'Name',
          value: `${customerDetails.first_name || ''} ${
            customerDetails.last_name || ''
          }`.trim(),
        },
        {
          label: 'Phone Number',
          value: formatPhoneNumber(customerDetails.phone_number),
          copyable: true,
        },
        {
          label: 'Email',
          value: customerDetails.email,
          copyable: true,
        },
        {
          label: 'Wallet Balance',
          value: toDollars(customerDetails.wallet.available_balance_in_cents),
        },
        {
          label: 'Wallet Uuid',
          value: customerDetails.wallet.wallet_uuid,
          copyable: true,
        },
      ]
    : [];

  const detailsManageOptions = [
    {
      label: 'Wallet',
      navigateTo: customerDetails?.wallet?.wallet_uuid
        ? `/wallets/${id}`
        : '/wallets',
    },
    {
      label: 'Manage',
      isDropdown: true,
      dropdownItems: [
        {
          label: 'Block',
          onClick: () => openModal('Block'),
          disabled: customerDetails?.status === 'blocked',
        },
        {
          label: 'Unblock',
          onClick: () => openModal('Unblock'),
          disabled: customerDetails?.status !== 'blocked',
        },
      ],
    },
  ];

  const columns: Column[] = [
    { label: 'Amount', field: 'amount_in_cents', formatter: toDollars },
    {
      label: 'Status',
      field: 'current_status_code_description',
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
          {status === TRANSACTION_BILLED || status === TRANSACTION_COMPLETED ? (
            <>
              <span className="text-sm font-medium">Successful</span>
              <CircleCheck size={13} className="text-green-600 flex-shrink-0" />
            </>
          ) : status === 'created' ? (
            <>
              <span className="text-sm font-medium">Created</span>
              <Image src="/created.svg" alt="created" />
            </>
          ) : (
            <>
              <span className="text-sm font-medium">Failed</span>
              <CircleAlert size={13} className="text-red-600 flex-shrink-0" />
            </>
          )}
        </div>
      ),
    },
    { label: 'Date', field: 'created_at', formatter: formatDateTime },
    { label: 'Type', field: 'kind' },
  ];

  const tableData = refundsData?.data
    ? mapTableData(refundsData.data, columns)
    : [];

  const handleRowClick = (rowData: Record<string, Customer>) => {
    if (rowData) {
      router.push(`/customers/refunds/${rowData.uuid}`);
    }
  };

  return (
    <>
      <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <Heading
          headingText="Customer Details"
          className="px-0 pt-0"
          buttons={detailsManageOptions}
          navigateTo="/customers"
        />
        <DetailsPage details={details} isLoading={isLoading} />

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={actionType === 'Block' ? 'Block Customer' : 'Unblock Customer'}
          onConfirm={handleAction}
          isLoading={isUpdating}
          disableButtons={isUpdating}
          width="w-[28rem]"
          height="h-[11.5rem]"
        >
          <div className="px-3">{modalContent}</div>
        </Modal>

        {customerDetails && (
          <>
            <Heading
              headingText="Refund History"
              showBackButton={false}
              className="!text-2xl px-1"
            />

            <div className="space-y-3 pb-2 pt-4">
              {refundsData && (
                <Table
                  data={tableData!}
                  columns={columns}
                  onRowClick={handleRowClick}
                />
              )}

              {refundsData && refundsData.total_page !== 0 && (
                <PaginationComponent
                  paginationParams={paginationParams}
                  setPaginationParams={setPaginationParams}
                  successResponse={refundsData}
                  isLoading={refundsLoading}
                />
              )}

              {refundsLoading && !refundsData && <Spinner className="mt-10" />}
            </div>
          </>
        )}
      </div>
    </>
  );
}
