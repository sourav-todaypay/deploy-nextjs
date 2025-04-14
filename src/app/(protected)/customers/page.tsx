/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useMemo } from 'react';
import Heading from '@/components/Heading';
import Table, { Column } from '@/components/Table';
import PaginationComponent from '@/components/PaginationComponent';
import { PaginationQueryParams } from '@/types/PaginationQueryParams';
import { useFilters } from '@/providers/FiltersProvider';
import toast from 'react-hot-toast';
import { Customer, CustomersPaginatedResponse } from './type';
import { Spinner } from '@/components/Spinner';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { formatPhoneNumber, toDollars } from '@/utils/utils';
import { mapTableData } from '@/utils/mapTableData';
import FilterComponent from '@/components/FilterComponent';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { useAuth } from '@/providers/AuthProvider';
import { getProductId } from '@/utils/getProductId';

const customersFilterConfig = [
  {
    key: 'Email',
    label: 'Email',
    type: 'search' as const,
  },
  {
    key: 'Phone',
    label: 'Phone No',
    type: 'search' as const,
  },
];

const searchPlaceholders = {
  Email: 'Type email...',
  Phone: 'Type number...',
};

export default function Customers() {
  const api = useApiInstance();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageFromURL = parseInt(searchParams.get('page') || '1');
  const { filters, resetFilter } = useFilters();
  const customersFilters = filters.customers;
  const [customersData, setCustomersData] =
    useState<CustomersPaginatedResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const { products } = useAuth();
  const ProductId = useMemo(() => getProductId(products), [products]);
  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: pageFromURL,
      limit: 10,
      filter: ProductId
        ? JSON.stringify({ ...customersFilters, product_id: ProductId })
        : '{}',
    });

  useEffect(() => {
    resetFilter('customers');
  }, []);

  useEffect(() => {
    if (!ProductId) return;
    fetchCustomers();
  }, [paginationParams]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response: CustomersPaginatedResponse = await handleResponse(
        api.authenticatedGet(`/merchants/customers`, {
          ...paginationParams,
        }),
      );
      setCustomersData(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch customers');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column[] = [
    { label: 'Name', field: ['first_name', 'last_name'] },
    {
      label: 'Phone Number',
      field: 'phone_number',
      formatter: formatPhoneNumber,
    },
    {
      label: 'Refund Volume',
      field: 'refund_volume_in_cents',
      formatter: toDollars,
    },
  ];

  const tableData = customersData?.data
    ? mapTableData(customersData.data, columns)
    : [];

  useEffect(() => {
    if (!ProductId) return;
    const newFilter = JSON.stringify({
      ...customersFilters,
      product_id: ProductId,
    });
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
  }, [customersFilters, ProductId]);

  const handleRowClick = (rowData: Record<string, Customer>) => {
    if (rowData) {
      router.push(`/customers/${rowData.account_uuid}`);
    }
  };

  return (
    <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
      <Heading
        headingText="Customers"
        showBackButton={false}
        className="px-0 pt-0"
      />

      <div className="space-y-3 pb-2">
        <FilterComponent
          filterCategory="customers"
          filtersConfig={customersFilterConfig}
          searchPlaceholders={searchPlaceholders}
        />

        {customersData && (
          <Table
            data={tableData!}
            columns={columns}
            onRowClick={handleRowClick}
          />
        )}

        {customersData && customersData.total_page !== 0 && (
          <PaginationComponent
            paginationParams={paginationParams}
            setPaginationParams={setPaginationParams}
            successResponse={customersData}
            isLoading={isLoading}
          />
        )}
        {isLoading && !customersData && <Spinner className="mt-20" />}
      </div>
    </div>
  );
}
