/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import Heading from '@/components/Heading';
import Table, { Column } from '@/components/Table';
import PaginationComponent from '@/components/PaginationComponent';
import { PaginationQueryParams } from '@/types/PaginationQueryParams';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/Spinner';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { mapTableData } from '@/utils/mapTableData';
import RulesModal from '@/components/RulesModal';
import { BrandRulesResponse, Rule } from './type';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';

export default function Rules() {
  const { id, provider_brand_name } = useParams();
  const api = useApiInstance();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageFromURL = parseInt(searchParams.get('page') || '1');
  const [rulesData, setRulesData] = useState<BrandRulesResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: pageFromURL,
      limit: 10,
    });

  useEffect(() => {
    fetchRules();
  }, [paginationParams]);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const response: BrandRulesResponse = await handleResponse(
        api.authenticatedGet(`/internal/giftcards/brands/${id}/rules`, {
          ...paginationParams,
        }),
      );
      setRulesData(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch brand details');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column[] = [
    { label: 'Name', field: 'name' },
    { label: 'Provider Name', field: 'provider_name' },
    { label: 'Rule', field: 'rule' },
    { label: 'Weight', field: 'weight' },
  ];

  const tableData = rulesData?.data
    ? mapTableData(rulesData.data, columns)
    : [];

  const handleRowClick = (rowData: Record<string, Rule>) => {
    if (rowData) {
      router.push(`/gift_cards/rules/details/${rowData.id}`);
    }
  };

  const rulesOptions = [
    {
      label: 'Create',
      onClick: () => setIsRulesModalOpen(true),
    },
  ];

  return (
    <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
      {provider_brand_name! && (
        <Heading
          headingText={`${provider_brand_name} Rules`}
          showBackButton={true}
          buttons={rulesOptions}
          className="px-0 pt-0"
          navigateTo={`/gift_cards/brands/${id}`}
        />
      )}

      <div className="space-y-3 pb-2 mt-2">
        {rulesData && (
          <Table
            data={tableData!}
            columns={columns}
            onRowClick={handleRowClick}
          />
        )}

        {rulesData && rulesData.total_page !== 0 && (
          <PaginationComponent
            paginationParams={paginationParams}
            setPaginationParams={setPaginationParams}
            successResponse={rulesData}
            isLoading={isLoading}
          />
        )}

        {rulesData && (
          <RulesModal
            onSuccess={fetchRules}
            isOpen={isRulesModalOpen}
            onClose={() => setIsRulesModalOpen(false)}
            brandId={Number(id)}
          />
        )}

        {isLoading && !rulesData && <Spinner className="mt-20" />}
      </div>
    </div>
  );
}
