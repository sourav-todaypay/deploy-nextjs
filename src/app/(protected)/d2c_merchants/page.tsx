/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import Heading from '@/components/Heading';
import Table, { Column } from '@/components/Table';
import FilterComponent from '@/components/FilterComponent';
import PaginationComponent from '@/components/PaginationComponent';
import { PaginationQueryParams } from '@/types/PaginationQueryParams';
import { useFilters } from '@/providers/FiltersProvider';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/Spinner';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { mapTableData } from '@/utils/mapTableData';
import { getDaysString } from '@/utils/utils';
import MerchantsD2CModal from '@/components/MerchantsD2cModal';
import { handleResponse } from '@/utils/handleResponse';
import { useApiInstance } from '@/hooks/useApiInstance';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { d2cMerchantListPaginatedResponse, MerchantData } from './type';

const d2cMerchantsFilterConfig = [
  {
    key: 'merchant_name',
    label: 'Name',
    type: 'search' as const,
  },
];

const searchPlaceholders = {
  merchant_name: 'Type Name...',
};

export default function MerchantsD2C() {
  const api = useApiInstance();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageFromURL = parseInt(searchParams.get('page') || '1');
  const [merchantsD2CData, setMerchantsD2CData] =
    useState<d2cMerchantListPaginatedResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const { filters, resetFilter } = useFilters();
  const d2cMerchantsFilters = filters.d2cMerchants;
  const [isMerchanrD2cModalOpen, setIsMerchantD2cModalOpen] = useState(false);
  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: pageFromURL,
      limit: 10,
      filter: JSON.stringify(d2cMerchantsFilters),
    });

  useEffect(() => {
    resetFilter('d2cMerchants');
  }, []);

  useEffect(() => {
    fetchMerchantsD2C();
  }, [paginationParams]);

  const fetchMerchantsD2C = async () => {
    setIsLoading(true);
    try {
      const response: d2cMerchantListPaginatedResponse = await handleResponse(
        api.authenticatedGet(`/internal/d2c-merchants`, {
          ...paginationParams,
        }),
      );
      setMerchantsD2CData(response);
      setIsLoading(false);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch merchants');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column[] = [
    { label: 'Name', field: 'name' },
    {
      label: 'Refund Process Days',
      field: 'refund_processing_days',
      formatter: getDaysString,
    },
    {
      label: 'Status',
      field: 'is_active',
      render: status => (
        <span className={status ? 'active' : 'blocked'}>
          {status ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const tableData = merchantsD2CData?.data
    ? mapTableData(merchantsD2CData.data, columns)
    : [];

  useEffect(() => {
    const newFilter = JSON.stringify(d2cMerchantsFilters);
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
  }, [d2cMerchantsFilters]);

  const handleRowClick = (rowData: Record<string, MerchantData>) => {
    if (rowData) {
      router.push(`/d2c_merchants/${rowData.uuid}`);
    }
  };

  const d2cMerchantsManageOptions = [
    {
      label: 'Create',
      onClick: () => setIsMerchantD2cModalOpen(true),
    },
  ];

  return (
    <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
      <Heading
        headingText="Merchants"
        showBackButton={false}
        className="px-0 pt-0"
        buttons={d2cMerchantsManageOptions}
      />

      <div className="space-y-3 pb-2">
        <FilterComponent
          filterCategory="d2cMerchants"
          filtersConfig={d2cMerchantsFilterConfig}
          searchPlaceholders={searchPlaceholders}
        />

        {merchantsD2CData && (
          <Table
            data={tableData!}
            columns={columns}
            onRowClick={handleRowClick}
          />
        )}

        {merchantsD2CData && merchantsD2CData.total_page !== 0 && (
          <PaginationComponent
            paginationParams={paginationParams}
            setPaginationParams={setPaginationParams}
            successResponse={merchantsD2CData}
            isLoading={isLoading}
          />
        )}

        {merchantsD2CData && (
          <MerchantsD2CModal
            onSuccess={fetchMerchantsD2C}
            isOpen={isMerchanrD2cModalOpen}
            onClose={() => setIsMerchantD2cModalOpen(false)}
          />
        )}
        {isLoading && !merchantsD2CData && <Spinner className="mt-20" />}
      </div>
    </div>
  );
}
