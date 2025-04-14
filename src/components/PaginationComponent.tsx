/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Pagination } from 'react-headless-pagination';
import { Spinner } from './Spinner';
import { PaginationRoot } from '@/types/PaginationRoot';
import { PaginationQueryParams } from '@/types/PaginationQueryParams';
import { useTranslations } from 'next-intl';

export interface paginatedResponse extends PaginationRoot {
  data: any[] | null;
}

interface PaginationProps {
  paginationParams: PaginationQueryParams;
  setPaginationParams: React.Dispatch<
    React.SetStateAction<{ page: number; limit: number }>
  >;
  successResponse: paginatedResponse;
  useUrlPagination?: boolean;
  isLoading?: boolean;
}

const PaginationComponent: React.FC<PaginationProps> = ({
  paginationParams,
  setPaginationParams,
  successResponse,
  useUrlPagination = true,
  isLoading,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations();

  const pageFromURL = useUrlPagination
    ? parseInt(searchParams.get('page') || '1')
    : paginationParams.page;

  useEffect(() => {
    if (useUrlPagination && pageFromURL !== paginationParams.page) {
      setPaginationParams({ ...paginationParams, page: pageFromURL });
    }
  }, [pageFromURL]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= successResponse.total_page) {
      setPaginationParams({ ...paginationParams, page: newPage });
      if (useUrlPagination) {
        router.push(`?page=${newPage}`, { scroll: false });
      }
    }
  };

  if (successResponse.total_page <= 1) return null;

  return (
    <div className="flex flex-col items-center justify-between w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-md shadow-md md:flex-row">
      <div className="text-sm text-gray-700 dark:text-gray-300 transition-all duration-300">
        {t('pagination.viewing')}{' '}
        <span className="font-semibold">
          {paginationParams.page * paginationParams.limit -
            paginationParams.limit +
            1}
        </span>{' '}
        -{' '}
        <span className="font-semibold">
          {Math.min(
            paginationParams.page * paginationParams.limit,
            successResponse.total_record,
          )}
        </span>{' '}
        {t('pagination.of')}{' '}
        <span className="font-semibold">{successResponse.total_record}</span>{' '}
        {t('pagination.results')}
      </div>
      <span>{isLoading && <Spinner size="small" />}</span>
      <Pagination
        currentPage={successResponse.page}
        totalPages={successResponse.total_page}
        setCurrentPage={handlePageChange}
        className="flex space-x-2 md:mt-0"
        edgePageCount={0}
        middlePagesSiblingCount={0}
        truncableClassName=""
      >
        <button
          className={`px-4 py-2 text-sm font-medium border rounded-lg transition-all duration-300 disabled:opacity-50 dark:border-gray-500 dark:text-gray-300 ${
            successResponse.page === 1
              ? 'bg-gray-300 dark:bg-gray-700'
              : 'hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          onClick={() => handlePageChange(successResponse.page - 1)}
          disabled={paginationParams.page === 1}
        >
          {t('pagination.previous')}
        </button>
        <button
          className={`px-2 py-2 text-sm font-medium border rounded-lg transition-all duration-300 disabled:opacity-50 dark:border-gray-500 dark:text-gray-300 ${
            successResponse.page === successResponse.total_page
              ? 'bg-gray-300 dark:bg-gray-700'
              : 'hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          onClick={() => handlePageChange(successResponse.page + 1)}
          disabled={paginationParams.page === successResponse.total_page}
        >
          {t('pagination.next')}
        </button>
      </Pagination>
    </div>
  );
};

export default PaginationComponent;
