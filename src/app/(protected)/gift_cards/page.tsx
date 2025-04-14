/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useMemo } from 'react';
import Heading from '@/components/Heading';
import Table, { Column } from '@/components/Table';
import PaginationComponent from '@/components/PaginationComponent';
import { PaginationQueryParams } from '@/types/PaginationQueryParams';
import { useFilters } from '@/providers/FiltersProvider';
import toast from 'react-hot-toast';
import { Offer, OffersPaginatedResponse } from './type';
import { Spinner } from '@/components/Spinner';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { addPercentageSign, formatDateToUTC } from '@/utils/utils';
import { mapTableData } from '@/utils/mapTableData';
import GiftCardsModal from '@/components/GiftCardsModal';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import FilterComponent, { FilterConfig } from '@/components/FilterComponent';
import { offerFilterOptions } from '@/types/offerFilterOptions';
import { useAuth } from '@/providers/AuthProvider';
import { getProductId } from '@/utils/getProductId';

const offersFilterConfig: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'multi-select',
    getOptions: () => {
      return offerFilterOptions;
    },
  },
];

export default function GiftCards() {
  const router = useRouter();
  const api = useApiInstance();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageFromURL = parseInt(searchParams.get('page') || '1');
  const { filters, resetFilter } = useFilters();
  const offersFilter = filters.offers;
  const [offersData, setOffersData] = useState<OffersPaginatedResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const [isGiftCardModalOpen, setIsGiftCardModalOpen] = useState(false);
  const { products } = useAuth();
  const ProductId = useMemo(() => getProductId(products), [products]);

  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: pageFromURL,
      limit: 10,
      filter: ProductId
        ? JSON.stringify({ ...offersFilter, product_id: ProductId })
        : '{}',
    });

  useEffect(() => {
    resetFilter('offers');
  }, []);

  useEffect(() => {
    if (!ProductId) return;
    fetchOffers();
  }, [paginationParams, ProductId]);

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const response: OffersPaginatedResponse = await handleResponse(
        api.authenticatedGet(`/internal/offers`, {
          ...paginationParams,
        }),
      );
      setOffersData(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch gift cards');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column[] = [
    { label: 'ID', field: 'id' },
    { label: 'Title', field: 'title' },
    { label: 'Percent', field: 'percent', formatter: addPercentageSign },
    { label: 'Start Date', field: 'start_date', formatter: formatDateToUTC },
    { label: 'End Date', field: 'end_date', formatter: formatDateToUTC },
  ];

  const tableData = offersData?.data
    ? mapTableData(offersData.data, columns)
    : [];

  useEffect(() => {
    if (!ProductId) return;

    const newFilter = JSON.stringify({
      ...offersFilter,
      product_id: ProductId,
    });

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
  }, [offersFilter, ProductId]);

  const handleRowClick = (rowData: Record<string, Offer>) => {
    if (rowData) {
      router.push(`/gift_cards/${rowData.id}`);
    }
  };

  const detailsManageOptions = [
    {
      label: 'Providers',
      navigateTo: `/gift_cards/providers`,
    },
    {
      label: 'Brands',
      navigateTo: `/gift_cards/brands`,
    },
    {
      label: 'Create',
      onClick: () => setIsGiftCardModalOpen(true),
    },
  ];

  return (
    <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
      <Heading
        headingText="Gift Cards"
        showBackButton={false}
        buttons={detailsManageOptions}
        className="px-0 pt-0"
      />

      <div className="space-y-3 pb-2 mt-2">
        <FilterComponent
          filterCategory="offers"
          filtersConfig={offersFilterConfig}
        />

        {offersData && (
          <Table
            data={tableData!}
            columns={columns}
            onRowClick={handleRowClick}
          />
        )}

        {offersData && offersData.total_page !== 0 && (
          <PaginationComponent
            paginationParams={paginationParams}
            setPaginationParams={setPaginationParams}
            successResponse={offersData}
            isLoading={isLoading}
          />
        )}

        {isGiftCardModalOpen && (
          <GiftCardsModal
            onSuccess={fetchOffers}
            isOpen={isGiftCardModalOpen}
            onClose={() => setIsGiftCardModalOpen(false)}
          />
        )}

        {isLoading && !offersData && <Spinner className="mt-20" />}
      </div>
    </div>
  );
}
