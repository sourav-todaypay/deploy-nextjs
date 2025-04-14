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
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { formatDateToUTC, formatPhoneNumber } from '@/utils/utils';
import { getD2cOrdersListPaginatedResponse, ListOrders } from './type';
import { mapTableData } from '@/utils/mapTableData';
import FilterComponent from '@/components/FilterComponent';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';

const ordersFilterConfig = [
  {
    key: 'order_id',
    label: 'Order ID',
    type: 'search' as const,
  },
  {
    key: 'created_at',
    label: 'Created At',
    type: 'date' as const,
  },
];

export default function Orders() {
  const router = useRouter();
  const api = useApiInstance();
  const pathname = usePathname();
  const { filters, resetFilter } = useFilters();
  const searchParams = useSearchParams();
  const pageFromURL = parseInt(searchParams.get('page') || '1');
  const [ordersData, setOrdersData] =
    useState<getD2cOrdersListPaginatedResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const ordersFilters = filters.orders;
  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: pageFromURL,
      limit: 10,
      filter: JSON.stringify(ordersFilters),
    });

  useEffect(() => {
    resetFilter('orders');
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response: getD2cOrdersListPaginatedResponse =
          await handleResponse(
            api.authenticatedGet(`/internal/d2c-merchants/orders`, {
              ...paginationParams,
            }),
          );
        setOrdersData(response);
      } catch (error) {
        if (isFailureResponse(error)) {
          toast.error(error.message || 'Failed to fetch orders');
        } else {
          toast.error('Something went wrong');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [paginationParams]);

  const columns: Column[] = [
    { label: 'ID', field: 'uuid' },
    { label: 'Created At', field: 'created_at', formatter: formatDateToUTC },
    { label: 'Email', field: 'email' },
    {
      label: 'Phone Number',
      field: 'phone_number',
      formatter: formatPhoneNumber,
    },
  ];

  const tableData = ordersData?.data
    ? mapTableData(ordersData.data, columns)
    : [];

  useEffect(() => {
    const newFilter = JSON.stringify(ordersFilters);

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
  }, [ordersFilters]);

  const handleRowClick = (rowData: Record<string, ListOrders>) => {
    if (rowData) {
      router.push(`/orders/${rowData.uuid}`);
    }
  };

  return (
    <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
      <Heading
        headingText="Orders"
        showBackButton={false}
        className="px-0 pt-0"
      />

      <div className="space-y-3 pb-2 mt-2">
        <FilterComponent
          filterCategory="orders"
          filtersConfig={ordersFilterConfig}
          searchPlaceholders={{
            order_id: 'Search order ID...',
          }}
        />

        {ordersData && (
          <Table
            data={tableData!}
            columns={columns}
            onRowClick={handleRowClick}
          />
        )}

        {ordersData && ordersData.total_page !== 0 && (
          <PaginationComponent
            paginationParams={paginationParams}
            setPaginationParams={setPaginationParams}
            successResponse={ordersData}
            isLoading={isLoading}
          />
        )}
        {isLoading && !ordersData && <Spinner className="mt-20" />}
      </div>
    </div>
  );
}
