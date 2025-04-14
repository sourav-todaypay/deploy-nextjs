/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import Heading from '@/components/Heading';
import Table, { Column } from '@/components/Table';
import PaginationComponent from '@/components/PaginationComponent';
import { PaginationQueryParams } from '@/types/PaginationQueryParams';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/Spinner';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { mapTableData } from '@/utils/mapTableData';
import {
  BrandCollectionResponse,
  Brands,
  GCBrandsPaginationResponse,
} from './type';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { useFilters } from '@/providers/FiltersProvider';
import FilterComponent from '@/components/FilterComponent';

const brandFilterConfig = [
  {
    key: 'display_name',
    label: 'Brand Name',
    type: 'search' as const,
  },
  {
    key: 'is_enabled',
    label: 'Status',
    type: 'radio' as const,
    options: [
      { value: true, label: 'Active' },
      { value: false, label: 'Inactive' },
    ],
  },
];

const searchPlaceholders = {
  display_name: 'Type Brand Name...',
};

export default function GcBrands() {
  const router = useRouter();
  const api = useApiInstance();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const pageFromURL = parseInt(searchParams.get('page') || '1');
  const [brandsData, setbrandsData] = useState<GCBrandsPaginationResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const { filters, resetFilter } = useFilters();
  const brandsFilters = filters.brands;
  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: pageFromURL,
      limit: 10,
      category: 'other',
      filter: JSON.stringify(brandsFilters),
    });

  useEffect(() => {
    resetFilter('brands');
  }, []);

  useEffect(() => {
    const fetchGcbrands = async () => {
      setIsLoading(true);
      try {
        const response: BrandCollectionResponse = await handleResponse(
          api.authenticatedGet(`/internal/giftcards/brands`, {
            ...paginationParams,
          }),
        );
        setbrandsData(response?.brand_collection);
      } catch (error) {
        if (isFailureResponse(error)) {
          toast.error(error.message || 'Failed to fetch brands');
        } else {
          toast.error('Something went wrong');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchGcbrands();
  }, [paginationParams]);

  const columns: Column[] = [
    { label: 'Name', field: 'display_name' },
    { label: 'Offer', field: 'offer_label' },
    {
      label: 'Status',
      field: 'is_enabled',
      render: is_enabled => (
        <span className={is_enabled ? 'active' : 'blocked'}>
          {is_enabled ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const tableData = brandsData?.data
    ? mapTableData(brandsData?.data, columns)
    : [];

  useEffect(() => {
    const newFilter = JSON.stringify(brandsFilters);
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
  }, [brandsFilters]);

  const handleRowClick = (rowData: Record<string, Brands>) => {
    if (rowData) {
      router.push(`/gift_cards/brands/${rowData.id}`);
    }
  };

  return (
    <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
      <Heading
        headingText="Brands"
        showBackButton={true}
        navigateTo="/gift_cards"
        className="px-0 pt-0"
      />

      <div className="space-y-3 pb-2">
        <FilterComponent
          filterCategory="brands"
          filtersConfig={brandFilterConfig}
          searchPlaceholders={searchPlaceholders}
        />

        {brandsData && (
          <Table
            data={tableData!}
            columns={columns}
            onRowClick={handleRowClick}
          />
        )}

        {brandsData && brandsData.total_page !== 0 && (
          <PaginationComponent
            paginationParams={paginationParams}
            setPaginationParams={setPaginationParams}
            successResponse={brandsData}
            isLoading={isLoading}
          />
        )}

        {isLoading && !brandsData && <Spinner className="mt-20" />}
      </div>
    </div>
  );
}
