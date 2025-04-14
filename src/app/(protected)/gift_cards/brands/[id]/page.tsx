/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import DetailsPage from '@/components/DetailsPage';
import { Brands } from '../type';
import Modal from '@/components/Modal';
import PaginationComponent from '@/components/PaginationComponent';
import { PaginationQueryParams } from '@/types/PaginationQueryParams';
import Table, { Column } from '@/components/Table';
import { Spinner } from '@/components/Spinner';
import { toDollars } from '@/utils/utils';
import { mapTableData } from '@/utils/mapTableData';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { Product, ProductsPaginatedResponse } from './type';
import { DetailItem } from '@/components/DetailItemComponent';
import { useFilters } from '@/providers/FiltersProvider';
import FilterComponent from '@/components/FilterComponent';

const productFilterConfig = [
  {
    key: 'display_name',
    label: 'Product Name',
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

export default function BrandDetails() {
  const { id } = useParams();
  const api = useApiInstance();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageFromURL = parseInt(searchParams.get('page') || '1');
  const [BrandDetails, setBrandDetails] = useState<Brands | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [actionType, setActionType] = useState<'Deactivate' | 'Activate' | ''>(
    '',
  );
  const [productsLoading, setProductsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [productsData, setProductsData] = useState<ProductsPaginatedResponse>();
  const { filters, resetFilter } = useFilters();
  const productsFilters = filters.products;
  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: pageFromURL,
      limit: 10,
      filter: JSON.stringify(productsFilters),
    });

  const openModal = (action: 'Deactivate' | 'Activate') => {
    setIsOpen(true);
    setActionType(action);
    setModalContent(
      `Are you sure you want to ${action.toLowerCase()} this Brand.`,
    );
  };

  useEffect(() => {
    resetFilter('brands');
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchBrandDetails = async () => {
      setIsLoading(true);
      try {
        const response: Brands = await handleResponse(
          api.authenticatedGet(`/internal/giftcards/brands/${id}`),
        );
        setBrandDetails(response);
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

    fetchBrandDetails();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const response: ProductsPaginatedResponse = await handleResponse(
          api.authenticatedGet(`/internal/giftcards/products`, {
            ...paginationParams,
            min_amount_in_cents: String(0),
            brand_id: String(id),
          }),
        );
        setProductsData(response);
      } catch (error) {
        if (isFailureResponse(error)) {
          toast.error(error.message || 'Failed to fetch products');
        } else {
          toast.error('Something went wrong');
        }
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [paginationParams]);

  const details: DetailItem[] = BrandDetails
    ? [
        {
          label: 'Status',
          value: (
            <span className={BrandDetails.status ? 'active' : 'blocked'}>
              {BrandDetails.status ? 'Active' : 'Inactive'}
            </span>
          ),
        },
        {
          label: 'Internal Status',
          value: (
            <span className={BrandDetails.is_enabled ? 'active' : 'blocked'}>
              {BrandDetails.is_enabled ? 'Active' : 'Inactive'}
            </span>
          ),
        },
        {
          label: 'Name',
          value: BrandDetails.name,
          copyable: true,
        },
        {
          label: 'Brand Id',
          value: BrandDetails.provider_brand_key,
          copyable: true,
        },

        {
          label: 'Offer',
          value: BrandDetails.offer_label,
        },
      ]
    : [];

  const brandsManageOptions = [
    {
      label: 'Rules',
      navigateTo: `/gift_cards/rules/${BrandDetails?.name}/${id}`,
    },
    {
      label: 'Manage',
      isDropdown: true,
      dropdownItems: [
        {
          label: 'Deactivate',
          onClick: () => openModal('Deactivate'),
          disabled: !BrandDetails?.is_enabled,
        },
        {
          label: 'Activate',
          onClick: () => openModal('Activate'),
          disabled: BrandDetails?.is_enabled,
        },
      ],
    },
  ];

  const handleAction = async () => {
    if (!id) return;
    setIsUpdating(true);
    let response;
    try {
      if (actionType === 'Deactivate') {
        response = await handleResponse(
          api.authenticatedPut(`/internal/giftcards/brands/${id}`, {
            activated: false,
          }),
        );
      } else {
        response = await handleResponse(
          api.authenticatedPut(`/internal/giftcards/brands/${id}`, {
            activated: true,
          }),
        );
      }
      setBrandDetails(prev =>
        prev
          ? {
              ...prev,
              is_enabled: actionType !== 'Deactivate',
            }
          : prev,
      );
      if (response.message) {
        toast.success('Action Successful!');
      }
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error('Action Failed');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  const columns: Column[] = [
    { label: 'Name', field: 'display_name' },
    { label: 'Provider Name', field: 'provider_name' },
    { label: 'Type', field: 'value_type' },
    { label: 'Min Value', field: 'min_value', formatter: toDollars },
    { label: 'Max Value', field: 'max_value', formatter: toDollars },
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

  const tableData = productsData?.data
    ? mapTableData(productsData.data, columns)
    : [];

  useEffect(() => {
    const newFilter = JSON.stringify(productsFilters);
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
  }, [productsFilters]);

  const handleRowClick = (rowData: Record<string, Product>) => {
    if (rowData) {
      router.push(`/gift_cards/brands/products/${rowData.id}`);
    }
  };

  return (
    <>
      <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <Heading
          headingText="Brand Details"
          className="px-0 pt-0"
          buttons={brandsManageOptions}
          navigateTo="/gift_cards/brands"
        />
        <DetailsPage details={details} isLoading={isLoading} />

        {BrandDetails && (
          <>
            <Heading
              headingText="Products"
              showBackButton={false}
              className="!text-2xl px-1"
            />

            <div className="space-y-3 pb-2">
              <FilterComponent
                filterCategory="products"
                filtersConfig={productFilterConfig}
                searchPlaceholders={searchPlaceholders}
              />

              {productsData && (
                <Table
                  data={tableData!}
                  columns={columns}
                  onRowClick={handleRowClick}
                />
              )}

              {productsData && productsData.total_page !== 0 && (
                <PaginationComponent
                  paginationParams={paginationParams}
                  setPaginationParams={setPaginationParams}
                  successResponse={productsData}
                  isLoading={productsLoading}
                />
              )}

              {productsLoading && !productsData && (
                <Spinner className="mt-10" />
              )}
            </div>
          </>
        )}

        {(actionType === 'Deactivate' || actionType === 'Activate') && (
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title={
              actionType === 'Activate' ? 'Activate Brand' : 'Deactivate Brand'
            }
            onConfirm={handleAction}
            isLoading={isUpdating}
            disableButtons={isUpdating}
            width="w-[28rem]"
            height="h-[11.5rem]"
          >
            <div className="px-3">{modalContent}</div>
          </Modal>
        )}
      </div>
    </>
  );
}
