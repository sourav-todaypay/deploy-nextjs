/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import Heading from '@/components/Heading';
import Table, { Column } from '@/components/Table';
import PaginationComponent from '@/components/PaginationComponent';
import { PaginationQueryParams } from '@/types/PaginationQueryParams';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/Spinner';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatToUSD, getUserTag } from '@/utils/utils';
import { Transaction, TransactionsPaginatedResponse } from './type';
import { mapTableData } from '@/utils/mapTableData';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { useFilters } from '@/providers/FiltersProvider';

export default function Wallets() {
  const router = useRouter();
  const api = useApiInstance();
  const searchParams = useSearchParams();
  const pageFromURL = parseInt(searchParams.get('page') || '1');
  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: pageFromURL,
      limit: 10,
    });
  const [walletsData, setWalletsData] =
    useState<TransactionsPaginatedResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const { resetAllFilters } = useFilters();

  useEffect(() => {
    resetAllFilters();
  }, []);

  useEffect(() => {
    const fetchWallets = async () => {
      setIsLoading(true);
      try {
        const response: TransactionsPaginatedResponse = await handleResponse(
          api.authenticatedGet(`/internal/wallets`, {
            ...paginationParams,
          }),
        );
        setWalletsData(response);
      } catch (error) {
        if (isFailureResponse(error)) {
          toast.error(error.message || 'Failed to fetch wallets');
        } else {
          toast.error('Something went wrong');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallets();
  }, [paginationParams]);

  const columns: Column[] = [
    { label: 'User Uuid', field: 'user_uuid' },
    { label: 'Tag', field: 'wallet_uuid', formatter: getUserTag },
    {
      label: 'Available Balance',
      field: 'available_balance_in_cents',
      formatter: formatToUSD,
    },
    {
      label: 'Over Draft Limit',
      field: 'pending_balance_in_cents',
      formatter: formatToUSD,
    },
  ];

  const tableData = walletsData?.data
    ? mapTableData(walletsData.data, columns)
    : [];

  const handleRowClick = (rowData: Record<string, Transaction>) => {
    if (rowData) {
      router.push(`/wallets/${rowData.user_uuid}`);
    }
  };

  return (
    <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
      <Heading
        headingText="Wallets"
        showBackButton={false}
        className="px-0 pt-0"
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
