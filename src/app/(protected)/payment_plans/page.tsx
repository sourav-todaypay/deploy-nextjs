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
import { toDollars } from '@/utils/utils';
import { paymentPlanDetails, paymentPlansPaginatedResponse } from './type';
import { mapTableData } from '@/utils/mapTableData';
import PaymentPlanModal from '@/components/PaymentPlanModal';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { useFilters } from '@/providers/FiltersProvider';

export default function PaymentPlans() {
  const router = useRouter();
  const api = useApiInstance();
  const searchParams = useSearchParams();
  const pageFromURL = parseInt(searchParams.get('page') || '1');
  const [isPaymentPlanModalOpen, setIsPaymentPlanModalOpen] = useState(false);
  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: pageFromURL,
      limit: 10,
    });
  const [paymentPlansData, setPaymentPlansData] =
    useState<paymentPlansPaginatedResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const { resetAllFilters } = useFilters();

  useEffect(() => {
    resetAllFilters();
  }, []);

  useEffect(() => {
    fetchPaymentPlans();
  }, [paginationParams]);

  const fetchPaymentPlans = async () => {
    try {
      const response: paymentPlansPaginatedResponse = await handleResponse(
        api.authenticatedGet(`/internal/payment-plans`, {
          ...paginationParams,
        }),
      );
      setPaymentPlansData(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch payment plans');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column[] = [
    { label: 'Name', field: 'name' },
    { label: 'No. of Installements', field: 'number_of_installments' },
    { label: 'Frequency in Days', field: 'frequency_in_days' },
    { label: 'Fee', field: 'fees_in_cents', formatter: toDollars },
  ];

  const tableData = paymentPlansData?.data
    ? mapTableData(paymentPlansData.data, columns)
    : [];

  const handleRowClick = (rowData: Record<string, paymentPlanDetails>) => {
    if (rowData) {
      router.push(`/payment_plans/${rowData.uuid}`);
    }
  };

  const paymentPlanManageOptions = [
    {
      label: 'Create',
      onClick: () => setIsPaymentPlanModalOpen(true),
    },
  ];

  return (
    <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
      <Heading
        headingText="Payment Plans"
        showBackButton={false}
        buttons={paymentPlanManageOptions}
        className="px-0 pt-0"
      />

      <div className="space-y-3 pb-2 mt-2">
        {paymentPlansData && (
          <Table
            data={tableData!}
            columns={columns}
            onRowClick={handleRowClick}
          />
        )}

        {paymentPlansData && paymentPlansData.total_page !== 0 && (
          <PaginationComponent
            paginationParams={paginationParams}
            setPaginationParams={setPaginationParams}
            successResponse={paymentPlansData}
            isLoading={isLoading}
          />
        )}

        {paymentPlansData && (
          <PaymentPlanModal
            onSuccess={fetchPaymentPlans}
            isOpen={isPaymentPlanModalOpen}
            onClose={() => setIsPaymentPlanModalOpen(false)}
          />
        )}

        {isLoading && !paymentPlansData && <Spinner className="mt-20" />}
      </div>
    </div>
  );
}
