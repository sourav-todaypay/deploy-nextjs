/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import Heading from '@/components/Heading';
import Table, { Column } from '@/components/Table';
import PaginationComponent from '@/components/PaginationComponent';
import { PaginationQueryParams } from '@/types/PaginationQueryParams';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/Spinner';
import { waitList, WaitListPaginatedResponse } from './type';
import { mapTableData } from '@/utils/mapTableData';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { useFilters } from '@/providers/FiltersProvider';

export default function WaitList() {
  const router = useRouter();
  const api = useApiInstance();
  const searchParams = useSearchParams();
  const pageFromURL = parseInt(searchParams.get('page') || '1');
  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: pageFromURL,
      limit: 10,
    });
  const [waitListData, setWaitListData] = useState<WaitListPaginatedResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const { resetAllFilters } = useFilters();

  useEffect(() => {
    resetAllFilters();
  }, []);

  useEffect(() => {
    fetchWaitList();
  }, [paginationParams]);

  const fetchWaitList = async () => {
    setIsLoading(true);
    try {
      const response: WaitListPaginatedResponse = await handleResponse(
        api.authenticatedGet(`/internal/invites/waitlist`, {
          ...paginationParams,
        }),
      );
      setWaitListData(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch wailtlist');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column[] = [
    { label: 'Name', field: ['first_name', 'last_name'] },
    { label: 'Email', field: 'email' },
    { label: 'Account Uuid', field: 'account_uuid' },
    { label: 'Product', field: 'product_name' },
  ];

  const tableData = waitListData?.data
    ? mapTableData(waitListData.data, columns)
    : [];

  const handleRowClick = (rowData: Record<string, waitList>) => {
    if (rowData) {
      router.push(`/waitlist/${rowData.account_uuid}`);
    }
  };

  return (
    <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
      <Heading
        headingText="WaitList"
        showBackButton={false}
        className="px-0 pt-0"
      />

      <div className="space-y-3 pb-2 mt-2">
        {waitListData && (
          <Table
            data={tableData!}
            columns={columns}
            onRowClick={handleRowClick}
          />
        )}

        {waitListData && waitListData.total_page !== 0 && (
          <PaginationComponent
            paginationParams={paginationParams}
            setPaginationParams={setPaginationParams}
            successResponse={waitListData}
            isLoading={isLoading}
          />
        )}

        {isLoading && !waitListData && <Spinner className="mt-20" />}
      </div>
    </div>
  );
}
