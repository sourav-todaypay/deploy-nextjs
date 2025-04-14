/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import Heading from '@/components/Heading';
import Table, { Column } from '@/components/Table';
import PaginationComponent from '@/components/PaginationComponent';
import { PaginationQueryParams } from '@/types/PaginationQueryParams';
import { useFilters } from '@/providers/FiltersProvider';
import toast from 'react-hot-toast';
import { Plan, PlansPaginatedResponse } from './type';
import { Spinner } from '@/components/Spinner';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { formatToUSD, getDaysString } from '@/utils/utils';
import { mapTableData } from '@/utils/mapTableData';
import PlanModal from '@/components/PlanModal';
import FilterComponent from '@/components/FilterComponent';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';

const plansFilterConfig = [
  {
    key: 'plan_type',
    label: 'Plan Type',
    type: 'multi-select' as const,
    options: [
      { value: 'INVOICING', label: 'Invoice' },
      { value: 'PREPAID', label: 'PrePaid' },
    ],
  },
];

export default function Plans() {
  const router = useRouter();
  const api = useApiInstance();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const pageFromURL = parseInt(searchParams.get('page') || '1');
  const [plansData, setPlansData] = useState<PlansPaginatedResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const { filters, resetFilter } = useFilters();
  const plansFilters = filters.plans;

  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: pageFromURL,
      limit: 10,
      filter: JSON.stringify(plansFilters),
    });

  useEffect(() => {
    resetFilter('plans');
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [paginationParams]);

  const fetchPlans = async () => {
    try {
      const response: PlansPaginatedResponse = await handleResponse(
        api.authenticatedGet(`/internal/plans`, {
          ...paginationParams,
        }),
      );
      setPlansData(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch plans');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column[] = [
    { label: 'Plan Name', field: 'plan_name' },
    { label: 'Type', field: 'type' },
    {
      label: 'Settlement Cycle',
      field: 'settlement_cycle_in_days',
      formatter: getDaysString,
    },
    {
      label: 'Minimum Balance',
      field: 'minimum_balance_in_cents',
      formatter: formatToUSD,
    },
  ];

  const tableData = plansData?.data
    ? mapTableData(plansData.data, columns)
    : [];

  useEffect(() => {
    const newFilter = JSON.stringify(plansFilters);
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
  }, [plansFilters]);

  const handleRowClick = (rowData: Record<string, Plan>) => {
    if (rowData) {
      router.push(`/plans/${rowData.uuid}`);
    }
  };

  const planOptions = [
    {
      label: 'Create',
      onClick: () => setIsPlanModalOpen(true),
    },
  ];

  return (
    <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
      <Heading
        headingText="Plans"
        showBackButton={false}
        buttons={planOptions}
        className="px-0 pt-0"
      />

      <div className="space-y-3 pb-2 mt-2">
        <FilterComponent
          filterCategory="plans"
          filtersConfig={plansFilterConfig}
        />

        {plansData && (
          <Table
            data={tableData!}
            columns={columns}
            onRowClick={handleRowClick}
          />
        )}

        {plansData && plansData.total_page !== 0 && (
          <PaginationComponent
            paginationParams={paginationParams}
            setPaginationParams={setPaginationParams}
            successResponse={plansData}
            isLoading={isLoading}
          />
        )}

        {isPlanModalOpen && (
          <PlanModal
            onSuccess={fetchPlans}
            isOpen={isPlanModalOpen}
            onClose={() => setIsPlanModalOpen(false)}
          />
        )}

        {isLoading && !plansData && <Spinner className="mt-20" />}
      </div>
    </div>
  );
}
