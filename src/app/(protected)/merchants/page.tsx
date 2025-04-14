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
import { Merchant, MerchantsPaginatedResponse } from './type';
import { Spinner } from '@/components/Spinner';
import { useRouter, usePathname } from 'next/navigation';
import { mapTableData } from '@/utils/mapTableData';
import MerchantsModal from '@/components/MerchantModal';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { getStatusClassAndText } from '@/utils/statusClassAndText';

const merchantsFilterConfig = [
  {
    key: 'merchant_uuid',
    label: 'UUID',
    type: 'search' as const,
  },
  {
    key: 'Status',
    label: 'Status',
    type: 'multi-select' as const,
    options: [
      { value: 'APPLICATION_APPROVED', label: 'Approved' },
      { value: 'APPLICATION_PENDING_FOR_APPROVAL', label: 'Pending' },
      { value: 'APPLICATION_REJECTED', label: 'Rejected' },
    ],
  },
];

const searchPlaceholders = {
  merchant_uuid: 'Type Uuid...',
};

export default function Merchants() {
  const api = useApiInstance();
  const router = useRouter();
  const pathname = usePathname();
  const [merchantsData, setMerchantsData] =
    useState<MerchantsPaginatedResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const { filters, resetFilter } = useFilters();
  const [isMerchantModalOpen, setIsMerchantModalOpen] = useState(false);
  const merchantsFilters = filters.merchants;
  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: 1,
      limit: 10,
      filter: JSON.stringify(merchantsFilters),
    });

  useEffect(() => {
    resetFilter('merchants');
  }, []);

  useEffect(() => {
    fetchMerchants();
  }, [paginationParams]);

  const fetchMerchants = async () => {
    setIsLoading(true);
    try {
      const response: MerchantsPaginatedResponse = await handleResponse(
        api.authenticatedGet(`/internal/merchants`, {
          ...paginationParams,
        }),
      );
      setMerchantsData(response);
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
    { label: 'Corporate Name', field: 'corporate_name' },
    { label: 'Doing Business As', field: 'doing_business_as' },
    {
      label: 'Employer Identification Number',
      field: 'employer_identification_number',
    },
    {
      label: 'Status',
      field: 'application_current_status',
      render: (status: string) => (
        <span className={`${getStatusClassAndText(status).className}`}>
          {getStatusClassAndText(status).text}
        </span>
      ),
    },
  ];

  const tableData = merchantsData?.data
    ? mapTableData(merchantsData.data, columns)
    : [];

  useEffect(() => {
    const newFilter = JSON.stringify(merchantsFilters);
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
  }, [merchantsFilters]);

  const handleRowClick = (rowData: Record<string, Merchant>) => {
    if (rowData) {
      router.push(`/merchants/${rowData.uuid}`);
    }
  };

  const merchantOptions = [
    {
      label: 'Create',
      onClick: () => setIsMerchantModalOpen(true),
    },
  ];

  return (
    <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
      <Heading
        headingText="Merchants"
        showBackButton={false}
        className="px-0 pt-0"
        buttons={merchantOptions}
      />

      <div className="space-y-3 pb-2">
        <FilterComponent
          filterCategory="merchants"
          filtersConfig={merchantsFilterConfig}
          searchPlaceholders={searchPlaceholders}
        />

        {merchantsData && (
          <Table
            data={tableData!}
            columns={columns}
            onRowClick={handleRowClick}
          />
        )}

        {merchantsData && merchantsData.total_page !== 0 && (
          <PaginationComponent
            paginationParams={paginationParams}
            setPaginationParams={setPaginationParams}
            successResponse={merchantsData}
            isLoading={isLoading}
          />
        )}

        {isMerchantModalOpen && (
          <MerchantsModal
            onSuccess={fetchMerchants}
            isOpen={isMerchantModalOpen}
            onClose={() => setIsMerchantModalOpen(false)}
          />
        )}

        {isLoading && !merchantsData && <Spinner className="mt-20" />}
      </div>
    </div>
  );
}
