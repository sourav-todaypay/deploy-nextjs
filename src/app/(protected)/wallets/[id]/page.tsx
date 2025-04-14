/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import Heading from '@/components/Heading';
import Table, { Column } from '@/components/Table';
import PaginationComponent from '@/components/PaginationComponent';
import { PaginationQueryParams } from '@/types/PaginationQueryParams';
import { useFilters } from '@/providers/FiltersProvider';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/Spinner';
import {
  useRouter,
  usePathname,
  useSearchParams,
  useParams,
} from 'next/navigation';
import { formatDateTime, toDollars } from '@/utils/utils';
import { mapTableData } from '@/utils/mapTableData';
import { TransactionsPaginatedResponse, WalletTransaction } from './type';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';

export default function WalletTransactions() {
  const { id } = useParams();
  const api = useApiInstance();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const pageFromURL = parseInt(searchParams.get('page') || '1');
  const {
    filters: { walletTransactions },
  } = useFilters();
  const [walletsData, setWalletsData] =
    useState<TransactionsPaginatedResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: pageFromURL,
      limit: 10,
      user_uuid: id as string,
      filter: JSON.stringify(walletTransactions),
    });

  useEffect(() => {
    if (!id) return;
    const fetchWalletTransactions = async () => {
      setIsLoading(true);
      try {
        const response: TransactionsPaginatedResponse = await handleResponse(
          api.authenticatedGet(`/wallet/transactions`, {
            ...paginationParams,
          }),
        );
        setWalletsData(response);
        setIsLoading(false);
      } catch (error) {
        if (isFailureResponse(error)) {
          toast.error(error.message || 'Failed to fetch wallet transactions');
        } else {
          toast.error('Something went wrong');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletTransactions();
  }, [paginationParams]);

  const columns: Column[] = [
    { label: 'Type', field: 'type' },
    { label: 'Date & Time', field: 'created_at', formatter: formatDateTime },
    { label: 'Amount', field: 'amount_in_cents', formatter: toDollars },
    {
      label: 'Status',
      field: 'status',
      render: status => (
        <span
          className={`${
            status === 'success'
              ? 'active'
              : status === 'pending'
                ? 'pending'
                : 'blocked'
          }`}
        >
          {status}
        </span>
      ),
    },
  ];

  const tableData = walletsData?.data
    ? mapTableData(walletsData.data, columns)
    : [];

  useEffect(() => {
    const newFilter = JSON.stringify(walletTransactions);

    if (paginationParams.filter !== newFilter) {
      setPaginationParams(prev => ({
        ...prev,
        page: 1,
        filter: newFilter,
      }));

      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set('page', '1');
      router.push(`${pathname}?${searchParams.toString()}`);
    }
  }, [walletTransactions]);

  const handleRowClick = (rowData: Record<string, WalletTransaction>) => {
    if (rowData) {
      router.push(`/wallets/${id}/${rowData.uuid}`);
    }
  };

  return (
    <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
      <Heading
        headingText="Wallet Transactions"
        showBackButton={true}
        className="px-0 pt-0"
        navigateTo="/wallets"
      />

      <div className="space-y-3 pb-2 mt-2">
        {walletsData && (
          <Table
            data={tableData!}
            columns={columns}
            onRowClick={handleRowClick}
          />
        )}

        {walletsData && walletsData.total_page !== 0 && (
          <PaginationComponent
            paginationParams={paginationParams}
            setPaginationParams={setPaginationParams}
            successResponse={walletsData}
            isLoading={isLoading}
          />
        )}

        {isLoading && !walletsData && <Spinner className="mt-20" />}
      </div>
    </div>
  );
}
