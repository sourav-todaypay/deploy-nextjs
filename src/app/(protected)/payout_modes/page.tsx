/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import Heading from '@/components/Heading';
import Table, { Column } from '@/components/Table';
import { Spinner } from '@/components/Spinner';
import { addPercentageSign, formatToUSD, toLowerString } from '@/utils/utils';
import toast from 'react-hot-toast';
import { PaymentModes } from './type';
import { mapTableData } from '@/utils/mapTableData';
import { useRouter } from 'next/navigation';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { useFilters } from '@/providers/FiltersProvider';

export default function PayOutModes() {
  const router = useRouter();
  const api = useApiInstance();
  const [redemtionMethodsData, setRedemtionMethodsData] = useState<
    PaymentModes[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const { resetAllFilters } = useFilters();

  useEffect(() => {
    resetAllFilters();
  }, []);

  useEffect(() => {
    fetchRedemtionMethods();
  }, []);

  const fetchRedemtionMethods = async () => {
    try {
      const response: PaymentModes[] = await handleResponse(
        api.authenticatedGet(`/customers/get-withdrawal-modes`),
      );
      setRedemtionMethodsData(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch payout modes');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column[] = [
    { label: 'Title', field: 'title' },
    { label: 'Mode', field: 'mode' },
    {
      label: 'Fee Flat Rate',
      field: 'fee_flat_rate_in_cents',
      formatter: formatToUSD,
    },
    {
      label: 'Fee Percent Rate',
      field: 'fee_percentage_rate',
      formatter: addPercentageSign,
    },
    {
      label: 'Settlement Time',
      field: 'settlement_time',
      formatter: toLowerString,
    },
  ];

  const tableData = redemtionMethodsData
    ? mapTableData(redemtionMethodsData, columns)
    : [];

  const handleRowClick = (rowData: Record<string, PaymentModes>) => {
    if (rowData) {
      router.push(`/payout_modes/${rowData.mode}`);
    }
  };

  return (
    <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Heading headingText="Payout Modes" showBackButton={false} />
      <div className="px-4 space-y-3 pb-2 mt-4">
        {!isLoading && redemtionMethodsData.length > 0 && (
          <Table
            data={tableData}
            columns={columns}
            onRowClick={handleRowClick}
          />
        )}

        {isLoading && <Spinner className="mt-20" />}
      </div>
    </div>
  );
}
