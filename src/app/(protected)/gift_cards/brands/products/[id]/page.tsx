/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import DetailsPage from '@/components/DetailsPage';
import Modal from '@/components/Modal';
import { toDollars } from '@/utils/utils';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { Product } from '../../[id]/type';
import { DetailItem } from '@/components/DetailItemComponent';

export default function ProductDetails() {
  const { id } = useParams();
  const api = useApiInstance();
  const [productDetails, setProductDetails] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [actionType, setActionType] = useState<'Deactivate' | 'Activate' | ''>(
    '',
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const openModal = (action: 'Deactivate' | 'Activate') => {
    setIsOpen(true);
    setActionType(action);
    setModalContent(
      `Are you sure you want to ${action.toLowerCase()} this Product.`,
    );
  };

  useEffect(() => {
    if (!id) return;
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    setIsLoading(true);
    try {
      const response: Product = await handleResponse(
        api.authenticatedGet(`/internal/giftcards/products/${id}`),
      );
      setProductDetails(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch product details');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const details: DetailItem[] = productDetails
    ? [
        {
          label: 'Name',
          value: productDetails.display_name,
          copyable: true,
        },
        {
          label: 'Internal Status',
          value: (
            <span className={productDetails.is_enabled ? 'active' : 'blocked'}>
              {productDetails.is_enabled ? 'Active' : 'Inactive'}
            </span>
          ),
        },
        {
          label: 'Provider Product Status',
          value: (
            <span className={productDetails.status ? 'active' : 'blocked'}>
              {productDetails.status ? 'Active' : 'Inactive'}
            </span>
          ),
        },
        {
          label: 'Type',
          value: productDetails.type,
        },
        {
          label: 'Value Type',
          value: productDetails.value_type,
        },
        {
          label: 'Brand Name',
          value: productDetails.brand_name,
          copyable: true,
        },
        {
          label: 'Min Value',
          value: toDollars(productDetails.min_value),
        },
        {
          label: 'Max Value',
          value: toDollars(productDetails.max_value),
        },
        {
          label: 'Provider Product Id',
          value: productDetails.provider_product_id,
          copyable: true,
        },
      ]
    : [];

  const providersManageOptions = productDetails
    ? [
        {
          label: 'Manage',
          isDropdown: true,
          dropdownItems: [
            {
              label: 'Deactivate',
              onClick: () => openModal('Deactivate'),
              disabled: !productDetails.is_enabled,
            },
            {
              label: 'Activate',
              onClick: () => openModal('Activate'),
              disabled: productDetails.is_enabled,
            },
          ],
        },
      ]
    : [];

  const handleAction = async () => {
    if (!id) return;
    setIsUpdating(true);
    let response;
    try {
      if (actionType === 'Deactivate') {
        response = await handleResponse(
          api.authenticatedPut(`/internal/giftcards/products/${id}`, {
            activated: false,
          }),
        );
      } else {
        response = await handleResponse(
          api.authenticatedPut(`/internal/giftcards/products/${id}`, {
            activated: true,
          }),
        );
      }
      setProductDetails(prev =>
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
        toast.error(error.message || 'Action Failed!');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <Heading
          headingText="Product Details"
          className="px-0 pt-0"
          buttons={providersManageOptions}
        />
        <DetailsPage details={details} isLoading={isLoading} />

        {(actionType === 'Deactivate' || actionType === 'Activate') && (
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title={
              actionType === 'Activate'
                ? 'Activate Product'
                : 'Deactivate Product'
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
