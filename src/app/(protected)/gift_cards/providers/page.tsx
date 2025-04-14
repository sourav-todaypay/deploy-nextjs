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
import { GcProvidersPaginatedResponse, GetProvider } from './type';
import ProvidersModal from '@/components/ProvidersModal';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';

export default function GcProviders() {
  const router = useRouter();
  const api = useApiInstance();
  const searchParams = useSearchParams();
  const pageFromURL = parseInt(searchParams.get('page') || '1');
  const [providerData, setProviderData] =
    useState<GcProvidersPaginatedResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: pageFromURL,
      limit: 10,
    });

  useEffect(() => {
    fetchGcProvider();
  }, [paginationParams]);

  const fetchGcProvider = async () => {
    try {
      const response: GcProvidersPaginatedResponse = await handleResponse(
        api.authenticatedGet(`/internal/giftcards/service-providers`, {
          ...paginationParams,
        }),
      );
      setProviderData(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch providers');
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
    {
      label: 'Status',
      field: 'is_activated',
      render: is_activated => (
        <span className={is_activated ? 'active' : 'blocked'}>
          {is_activated ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const tableData = providerData?.data
    ? mapTableData(providerData.data, columns)
    : [];

  const handleRowClick = (rowData: Record<string, GetProvider>) => {
    if (rowData) {
      router.push(`/gift_cards/providers/${rowData.id}`);
    }
  };

  const providersOptions = [
    {
      label: 'Create',
      onClick: () => setIsProviderModalOpen(true),
    },
  ];

  return (
    <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
      <Heading
        headingText="Providers"
        showBackButton={true}
        navigateTo="/gift_cards"
        buttons={providersOptions}
        className="px-0 pt-0"
      />

      <div className="space-y-3 pb-2 mt-2">
        {providerData && (
          <Table
            data={tableData!}
            columns={columns}
            onRowClick={handleRowClick}
          />
        )}

        {providerData && providerData.total_page !== 0 && (
          <PaginationComponent
            paginationParams={paginationParams}
            setPaginationParams={setPaginationParams}
            successResponse={providerData}
            isLoading={isLoading}
          />
        )}

        {providerData && (
          <ProvidersModal
            onSuccess={fetchGcProvider}
            isOpen={isProviderModalOpen}
            onClose={() => setIsProviderModalOpen(false)}
          />
        )}

        {isLoading && !providerData && <Spinner className="mt-20" />}
      </div>
    </div>
  );
}
