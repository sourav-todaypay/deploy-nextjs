/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import Heading from '@/components/Heading';
import Table, { Column } from '@/components/Table';
import PaginationComponent from '@/components/PaginationComponent';
import { PaginationQueryParams } from '@/types/PaginationQueryParams';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/Spinner';
import { useParams } from 'next/navigation';
import { mapTableData } from '@/utils/mapTableData';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { formatDateTime } from '@/utils/utils';
import { ApiKeysPaginatedResponse } from './type';
import SystemUsersModal from '@/components/SystemUserModal';

export default function SystemUsers() {
  const { merchant_id } = useParams();
  const api = useApiInstance();
  const [systemUsersData, setSystemUsersData] =
    useState<ApiKeysPaginatedResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: 1,
      limit: 10,
    });

  useEffect(() => {
    fetchSystemUsers();
  }, [paginationParams]);

  const fetchSystemUsers = async () => {
    setIsLoading(true);
    try {
      const response: ApiKeysPaginatedResponse = await handleResponse(
        api.authenticatedGet(`/internal/api-keys/${merchant_id}`, {
          ...paginationParams,
        }),
      );
      setSystemUsersData(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch systemUsers');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column[] = [
    { label: 'Public Key ID', field: 'key_id' },
    { label: 'Generated At', field: 'created_at', formatter: formatDateTime },
    { label: 'Expiration', staticValue: 'Never' },
    // {
    //   label: 'Actions',
    //   actionOptions: [
    //     { label: 'Edit', onClick: row => console.log('Edit', row) },
    //   ],
    // },
  ];

  const tableData = systemUsersData?.data
    ? mapTableData(systemUsersData.data, columns)
    : [];

  const apiManageOptions = [
    {
      label: 'Create',
      onClick: () => setIsApiModalOpen(true),
    },
  ];

  return (
    <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
      <Heading
        headingText="System Users"
        showBackButton={true}
        className="px-0 pt-0"
        navigateTo={`/merchants/${merchant_id}`}
        buttons={apiManageOptions}
      />

      <div className="space-y-3 pb-2 mt-2">
        {systemUsersData && <Table data={tableData!} columns={columns} />}

        {systemUsersData && systemUsersData.total_page !== 0 && (
          <PaginationComponent
            paginationParams={paginationParams}
            setPaginationParams={setPaginationParams}
            successResponse={systemUsersData}
            isLoading={isLoading}
          />
        )}

        {isApiModalOpen && (
          <SystemUsersModal
            isOpen={isApiModalOpen}
            onSuccess={fetchSystemUsers}
            onClose={() => setIsApiModalOpen(false)}
            initialValues={{
              refund_amount_limit_in_cents: 1000,
              share_link: false,
            }}
          />
        )}

        {isLoading && !systemUsersData && <Spinner className="mt-20" />}
      </div>
    </div>
  );
}
