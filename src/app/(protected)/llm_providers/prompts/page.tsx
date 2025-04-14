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
import { mapTableData } from '@/utils/mapTableData';
import { formatDateTime } from '@/utils/utils';
import PromptsModal from '@/components/PromptsModal';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { getAllPromptsRequestResponse, GetAllPromptsResponse } from './type';

export default function Prompts() {
  const router = useRouter();
  const api = useApiInstance();
  const searchParams = useSearchParams();
  const pageFromURL = parseInt(searchParams.get('page') || '1');
  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: pageFromURL,
      limit: 10,
    });
  const [promptsData, setPromptsData] =
    useState<getAllPromptsRequestResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const [isPromptsModalOpen, setIsPromptsModalOpen] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, [paginationParams]);

  const fetchPrompts = async () => {
    setIsLoading(true);
    try {
      const response: getAllPromptsRequestResponse = await handleResponse(
        api.authenticatedGet(`/internal/llm/prompts`, {
          ...paginationParams,
        }),
      );
      setPromptsData(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch prompts');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column[] = [
    { label: 'ID', field: 'id' },
    { label: 'Name', field: 'name' },
    { label: 'Created at', field: 'created_at', formatter: formatDateTime },
  ];

  const tableData = promptsData?.data
    ? mapTableData(promptsData.data, columns)
    : [];

  const handleRowClick = (rowData: Record<string, GetAllPromptsResponse>) => {
    if (rowData) {
      router.push(`/llm_providers/prompts/${rowData.id}`);
    }
  };

  const detailsManageOptions = [
    {
      label: 'Add Prompts',
      onClick: () => setIsPromptsModalOpen(true),
    },
  ];

  return (
    <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
      <Heading
        headingText="Prompts"
        showBackButton={true}
        buttons={detailsManageOptions}
        className="px-0 pt-0"
      />

      <div className="space-y-3 pb-2 mt-2">
        {promptsData && (
          <Table
            data={tableData!}
            columns={columns}
            onRowClick={handleRowClick}
          />
        )}

        {promptsData && promptsData.total_page !== 0 && (
          <PaginationComponent
            paginationParams={paginationParams}
            setPaginationParams={setPaginationParams}
            successResponse={promptsData}
            isLoading={isLoading}
          />
        )}

        {isPromptsModalOpen && (
          <PromptsModal
            onSuccess={fetchPrompts}
            isOpen={isPromptsModalOpen}
            onClose={() => setIsPromptsModalOpen(false)}
          />
        )}

        {isLoading && !promptsData && <Spinner className="mt-20" />}
      </div>
    </div>
  );
}
