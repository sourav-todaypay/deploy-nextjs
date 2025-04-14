/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import Heading from '@/components/Heading';
import Table, { Column } from '@/components/Table';
import PaginationComponent from '@/components/PaginationComponent';
import { PaginationQueryParams } from '@/types/PaginationQueryParams';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/Spinner';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { formatDate } from '@/utils/utils';
import { mapTableData } from '@/utils/mapTableData';
import { getStatusClassAndText } from '@/utils/statusClassAndText';
import { useApiInstance } from '@/hooks/useApiInstance';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { handleResponse } from '@/utils/handleResponse';
import { MerchantPlanData, MerchantPlanHistoryResponse } from './type';

export default function PlansHistory() {
  const { merchant_id } = useParams();
  const api = useApiInstance();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageFromURL = parseInt(searchParams.get('page') || '1');
  const [isLoading, setIsLoading] = useState(false);
  const [plansHistoryData, setPlansHistoryData] =
    useState<MerchantPlanHistoryResponse>();
  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: pageFromURL,
      limit: 10,
    });

  useEffect(() => {
    if (!merchant_id) return;
    const fetchPlansHistory = async () => {
      setIsLoading(true);
      try {
        const response: MerchantPlanHistoryResponse = await handleResponse(
          api.authenticatedGet(`/internal/merchant-plans/${merchant_id}`, {
            ...paginationParams,
          }),
        );
        setPlansHistoryData(response);
      } catch (error) {
        if (isFailureResponse(error)) {
          toast.error(error.message || 'Failed to fetch plan history');
        } else {
          toast.error('Something went wrong');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlansHistory();
  }, [paginationParams, merchant_id]);

  const columns: Column[] = [
    { label: 'Plan Name', field: 'plan_name' },
    { label: 'Plan ID', field: 'plan_uuid' },
    {
      label: 'Effective From',
      field: 'effective_from',
      formatter: formatDate,
    },
    {
      label: 'Effective Till',
      field: 'effective_till',
      formatter: formatDate,
    },
    {
      label: 'Status',
      field: 'status',
      render: (status: string) => (
        <span className={`${getStatusClassAndText(status).className}`}>
          {getStatusClassAndText(status).text}
        </span>
      ),
    },
  ];

  const tableData = plansHistoryData?.data
    ? mapTableData(plansHistoryData.data, columns)
    : [];

  const handleRowClick = (rowData: Record<string, MerchantPlanData>) => {
    if (rowData) {
      router.push(
        `/merchants/plan_history/${merchant_id}/${rowData.plan_uuid}`,
      );
    }
  };

  return (
    <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      <Heading
        headingText="Plan History"
        showBackButton={true}
        navigateTo={`/merchants/${merchant_id}`}
        className="px-0 pt-0"
      />

      <div className="space-y-3 pb-2 mt-4">
        {plansHistoryData && (
          <Table
            data={tableData!}
            columns={columns}
            onRowClick={handleRowClick}
          />
        )}

        {plansHistoryData && plansHistoryData.total_page !== 0 && (
          <PaginationComponent
            paginationParams={paginationParams}
            setPaginationParams={setPaginationParams}
            successResponse={plansHistoryData}
            isLoading={isLoading}
          />
        )}
        {isLoading && !plansHistoryData && <Spinner className="mt-20" />}
      </div>
    </div>
  );
}
