/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import Heading from '@/components/Heading';
import Table, { Column } from '@/components/Table';
import PaginationComponent from '@/components/PaginationComponent';
import { PaginationQueryParams } from '@/types/PaginationQueryParams';
import { useFilters } from '@/providers/FiltersProvider';
import toast from 'react-hot-toast';
import { FeeRate, FeeRatePaginatedResponse } from './type';
import { Spinner } from '@/components/Spinner';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { addPercentageSign, toDollars } from '@/utils/utils';
import { mapTableData } from '@/utils/mapTableData';
import FeeRateModal from '@/components/FeeRateModal';
import FilterComponent, { FilterConfig } from '@/components/FilterComponent';
import {
  typeMap,
  entityFilterOptionsMapping,
  filterOptions,
} from '@/types/feeRateFilterOptions';
import { handleResponse } from '@/utils/handleResponse';
import { useApiInstance } from '@/hooks/useApiInstance';
import { isFailureResponse } from '@/utils/isFailureResponse';

type FilterValues = {
  entity?: 'CUSTOMER' | 'MERCHANT';
  type?: string;
};

export default function FeeRates() {
  const api = useApiInstance();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageFromURL = parseInt(searchParams.get('page') || '1');
  const { filters, resetFilter } = useFilters();
  const feeRateFilters = filters.feeRate;
  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: pageFromURL,
      limit: 10,
      filter: JSON.stringify(feeRateFilters),
    });
  const [feeRateData, setFeeRateData] = useState<FeeRatePaginatedResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const [isFeeRateModalOpen, setIsFeeRateModalOpen] = useState(false);

  useEffect(() => {
    resetFilter('feeRate');
  }, []);

  useEffect(() => {
    fetchFeeRate();
  }, [paginationParams]);

  const fetchFeeRate = async () => {
    setIsLoading(true);
    try {
      const response: FeeRatePaginatedResponse = await handleResponse(
        api.authenticatedGet(`/internal/instant-gratification-fee`, {
          ...paginationParams,
        }),
      );
      setFeeRateData(response);
      setIsLoading(false);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch feerates');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column[] = [
    { label: 'Name', field: 'name' },
    { label: 'Entity', field: 'entity' },
    { label: 'Type', field: 'type' },
    { label: 'Flat Rate', field: 'flat_rate_in_cents', formatter: toDollars },
    {
      label: 'Percentage Rate',
      field: 'percentage_rate',
      formatter: addPercentageSign,
    },
  ];

  const tableData = feeRateData?.data
    ? mapTableData(feeRateData.data, columns)
    : [];

  useEffect(() => {
    const newFilter = JSON.stringify(feeRateFilters);
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
  }, [feeRateFilters]);

  const handleRowClick = (rowData: Record<string, FeeRate>) => {
    if (rowData) {
      router.push(`/feerates/${rowData.id}`);
    }
  };

  const feeRateOptions = [
    {
      label: 'Create',
      onClick: () => setIsFeeRateModalOpen(true),
    },
  ];

  const feeRateFilterConfig: FilterConfig[] = [
    {
      key: 'entity',
      label: 'Entity',
      type: 'radio',
      options: [
        { value: 'CUSTOMER', label: 'Customer' },
        { value: 'MERCHANT', label: 'Merchant' },
      ],
    },
    {
      key: 'type',
      label: 'Type',
      type: 'multi-select',
      getOptions: (currentFilters: FilterValues) => {
        const entity = currentFilters?.entity;
        if (!entity) return filterOptions;
        const validTypes = entityFilterOptionsMapping[entity] || [];
        return filterOptions.filter(option =>
          validTypes.includes(option.value),
        );
      },
    },
  ];

  return (
    <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
      <Heading
        headingText="Fee Rates"
        showBackButton={false}
        buttons={feeRateOptions}
        className="px-0 pt-0"
      />

      <div className="space-y-3 pb-2 mt-2">
        <FilterComponent
          filterCategory="feeRate"
          filtersConfig={feeRateFilterConfig}
          formatFilterValue={(key, value) => {
            if (key === 'type') return typeMap[value] || value;
            if (key === 'entity')
              return value.charAt(0) + value.slice(1).toLowerCase();
            return value;
          }}
        />

        {feeRateData && (
          <Table
            data={tableData!}
            columns={columns}
            onRowClick={handleRowClick}
          />
        )}

        {feeRateData && feeRateData.total_page !== 0 && (
          <PaginationComponent
            paginationParams={paginationParams}
            setPaginationParams={setPaginationParams}
            successResponse={feeRateData}
            isLoading={isLoading}
          />
        )}

        {feeRateData && (
          <FeeRateModal
            onSuccess={fetchFeeRate}
            isOpen={isFeeRateModalOpen}
            onClose={() => setIsFeeRateModalOpen(false)}
          />
        )}

        {isLoading && !feeRateData && <Spinner className="mt-20" />}
      </div>
    </div>
  );
}
