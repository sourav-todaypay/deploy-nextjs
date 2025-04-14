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
import { WorkFlow, WorkFlowPaginatedResponse } from './type';
import { mapTableData } from '@/utils/mapTableData';
import WorkFlowModal from '@/components/WorkFlowModal';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { useFilters } from '@/providers/FiltersProvider';

export default function WorkFlows() {
  const router = useRouter();
  const api = useApiInstance();
  const searchParams = useSearchParams();
  const pageFromURL = parseInt(searchParams.get('page') || '1');
  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: pageFromURL,
      limit: 10,
    });
  const [workFlowsData, setWorkFlowsData] =
    useState<WorkFlowPaginatedResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [isWorkFlowModalOpen, setIsWorkFlowModalOpen] = useState(false);
  const { resetAllFilters } = useFilters();

  useEffect(() => {
    resetAllFilters();
  }, []);

  useEffect(() => {
    fetchWorkFlows();
  }, [paginationParams]);

  const fetchWorkFlows = async () => {
    try {
      const response: WorkFlowPaginatedResponse = await handleResponse(
        api.authenticatedGet(`/internal/workflows`, {
          ...paginationParams,
        }),
      );
      setWorkFlowsData(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch workflows');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column[] = [
    { label: 'Name', field: 'name' },
    { label: 'Transaction Kind', field: 'transaction_kind' },
    { label: 'Transaction SubType', field: 'sub_type' },
  ];

  const tableData = workFlowsData?.data
    ? mapTableData(workFlowsData.data, columns)
    : [];

  const handleRowClick = (rowData: Record<string, WorkFlow>) => {
    if (rowData) {
      router.push(`/workflows/${rowData.name}`);
    }
  };

  const workFlowOptions = [
    {
      label: 'Create',
      onClick: () => setIsWorkFlowModalOpen(true),
    },
  ];

  return (
    <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
      <Heading
        headingText="WorkFlows"
        showBackButton={false}
        className="px-0 pt-0"
        buttons={workFlowOptions}
      />

      <div className="space-y-3 pb-2 mt-2">
        {workFlowsData && (
          <Table
            data={tableData!}
            columns={columns}
            onRowClick={handleRowClick}
          />
        )}

        {workFlowsData && workFlowsData.total_page !== 0 && (
          <PaginationComponent
            paginationParams={paginationParams}
            setPaginationParams={setPaginationParams}
            successResponse={workFlowsData}
            isLoading={isLoading}
          />
        )}

        {isWorkFlowModalOpen && (
          <WorkFlowModal
            onSuccess={fetchWorkFlows}
            isOpen={isWorkFlowModalOpen}
            onClose={() => setIsWorkFlowModalOpen(false)}
          />
        )}

        {isLoading && !workFlowsData && <Spinner className="mt-20" />}
      </div>
    </div>
  );
}
