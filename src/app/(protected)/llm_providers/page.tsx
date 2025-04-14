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
import { llmProviderListData, llmProviderListPaginatedResponse } from './type';
import { mapTableData } from '@/utils/mapTableData';
import LlmProviderModal from '@/components/LlmProviderModal';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { useFilters } from '@/providers/FiltersProvider';

export default function LlmProviders() {
  const router = useRouter();
  const api = useApiInstance();
  const searchParams = useSearchParams();
  const pageFromURL = parseInt(searchParams.get('page') || '1');
  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: pageFromURL,
      limit: 10,
    });
  const [llmProvidersData, setLlmProvidersData] =
    useState<llmProviderListPaginatedResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const { resetAllFilters } = useFilters();

  useEffect(() => {
    resetAllFilters();
  }, []);

  useEffect(() => {
    fetchLlmProviders();
  }, [paginationParams]);

  const fetchLlmProviders = async () => {
    setIsLoading(true);
    try {
      const response: llmProviderListPaginatedResponse = await handleResponse(
        api.authenticatedGet(`/internal/llm/providers`, {
          ...paginationParams,
        }),
      );
      setLlmProvidersData(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch llm providers');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column[] = [
    { label: 'Name', field: 'name' },
    { label: 'Key', field: 'key' },
    { label: 'Weight', field: 'weight' },
  ];

  const tableData = llmProvidersData?.data
    ? mapTableData(llmProvidersData.data, columns)
    : [];

  const handleRowClick = (rowData: Record<string, llmProviderListData>) => {
    if (rowData) {
      router.push(`/llm_providers/${rowData.id}`);
    }
  };

  const detailsManageOptions = [
    {
      label: 'Prompts',
      navigateTo: `/llm_providers/prompts`,
    },
    {
      label: 'Add Provider',
      onClick: () => setIsProviderModalOpen(true),
    },
  ];

  return (
    <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
      <Heading
        headingText="LLM Providers"
        showBackButton={false}
        buttons={detailsManageOptions}
        className="px-0 pt-0"
      />

      <div className="space-y-3 pb-2 mt-2">
        {llmProvidersData && (
          <Table
            data={tableData!}
            columns={columns}
            onRowClick={handleRowClick}
          />
        )}

        {llmProvidersData && llmProvidersData.total_page !== 0 && (
          <PaginationComponent
            paginationParams={paginationParams}
            setPaginationParams={setPaginationParams}
            successResponse={llmProvidersData}
            isLoading={isLoading}
          />
        )}

        {isProviderModalOpen && (
          <LlmProviderModal
            onSuccess={fetchLlmProviders}
            isOpen={isProviderModalOpen}
            onClose={() => setIsProviderModalOpen(false)}
          />
        )}

        {isLoading && !llmProvidersData && <Spinner className="mt-20" />}
      </div>
    </div>
  );
}
