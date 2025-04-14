/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import { addPercentageSign, formatDateToUTC, toDollars } from '@/utils/utils';
import DetailsPage from '@/components/DetailsPage';
import { Offer } from '../type';
import Modal from '@/components/Modal';
import GiftCardsModal from '@/components/GiftCardsModal';
import dayjs from 'dayjs';
import { useApiInstance } from '@/hooks/useApiInstance';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { handleResponse } from '@/utils/handleResponse';
import { DetailItem } from '@/components/DetailItemComponent';

export default function GiftCardDetails() {
  const { id } = useParams();
  const api = useApiInstance();
  const router = useRouter();
  const [offerDetails, setOfferDetails] = useState<Offer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalAction, setModalAction] = useState<'Delete' | 'Update' | null>(
    null,
  );

  const openModal = (action: 'Delete' | 'Update') => {
    setModalAction(action);
    setIsOpen(true);
  };

  useEffect(() => {
    if (!id) return;
    fetchOfferDetails();
  }, [id]);

  const fetchOfferDetails = async () => {
    setIsLoading(true);
    try {
      const response = await handleResponse(
        api.authenticatedGet(`/internal/offers/${id}`),
      );
      setOfferDetails(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch gift card details');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const details: DetailItem[] = offerDetails
    ? [
        {
          label: 'Title',
          value: offerDetails.title,
          copyable: true,
        },
        {
          label: 'Mode',
          value: offerDetails.mode,
          copyable: true,
        },
        {
          label: 'Offer Start Date',
          value: formatDateToUTC(offerDetails.start_date),
        },
        {
          label: 'Offer End Date',
          value: formatDateToUTC(offerDetails.end_date),
        },
        {
          label: 'Minimum Transaction Amount',
          value: toDollars(offerDetails.minimum_transaction_amount_in_cents),
        },
        {
          label: 'Maximum Transaction Amount',
          value: toDollars(offerDetails.maximum_transaction_amount_in_cents),
        },
        ...(offerDetails.mode !== 'COUPON'
          ? [
              {
                label: 'Maximum Offer Amount',
                value: toDollars(offerDetails.maximum_offer_amount_in_cents!),
              },
              {
                label: 'Offer Percentage',
                value: addPercentageSign(offerDetails.percent!),
              },
              {
                label: 'Brands',
                copyable: true,
                value: (
                  <div className="flex flex-col">
                    {offerDetails.brands?.map((brand, index) => (
                      <span key={index} className="block">
                        {brand}
                      </span>
                    ))}
                  </div>
                ),
              },
            ]
          : []),
        {
          label: 'Products',
          value: (
            <div className="flex flex-col">
              {offerDetails.products?.map((product, index) => (
                <span key={index} className="block">
                  {product}
                </span>
              ))}
            </div>
          ),
        },
      ]
    : [];

  const giftCardsManageOptions = offerDetails
    ? [
        {
          label: 'Manage',
          isDropdown: true,
          dropdownItems: [
            {
              label: 'Delete',
              onClick: () => openModal('Delete'),
            },
            {
              label: 'Update',
              onClick: () => openModal('Update'),
            },
          ],
        },
      ]
    : [];

  const handleDelete = async () => {
    if (!id) return;
    setIsUpdating(true);
    try {
      const response = await handleResponse(
        api.authenticatedDelete(`/internal/offers/${id}`),
      );
      router.replace('/gift_cards');
      if (response.message) {
        toast.success('Action Successful');
      }
      setIsOpen(false);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Action Failed');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <Heading
          headingText="Gift Card Details"
          className="px-0 pt-0"
          buttons={giftCardsManageOptions}
        />
        <DetailsPage details={details} isLoading={isLoading} />

        {modalAction === 'Delete' && (
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title={'Delete Gift Card'}
            onConfirm={handleDelete}
            isLoading={isUpdating}
            disableButtons={isUpdating}
            width="w-[28rem]"
            height="h-[11.5rem]"
          >
            <div className="px-3">
              {'Are you sure you wanna Delete this Gift Card'}
            </div>
          </Modal>
        )}

        {modalAction === 'Update' && offerDetails && (
          <GiftCardsModal
            isOpen={isOpen}
            onSuccess={fetchOfferDetails}
            onClose={() => setIsOpen(false)}
            initialValues={{
              title: offerDetails.title,
              mode: offerDetails.mode,
              percent: offerDetails.percent,
              maximum_offer_amount_in_cents:
                offerDetails.maximum_offer_amount_in_cents! / 100 || 0,
              minimum_transaction_amount_in_cents:
                offerDetails.minimum_transaction_amount_in_cents! / 100 || 0,
              maximum_transaction_amount_in_cents:
                offerDetails.maximum_transaction_amount_in_cents! / 100 || 0,
              start_date: dayjs(offerDetails.start_date).format(
                'YYYY-MM-DDTHH:mm',
              ),
              end_date: dayjs(offerDetails.end_date).format('YYYY-MM-DDTHH:mm'),
              brand_id: offerDetails.brand_id,
              product_id: offerDetails.product_id,
            }}
          />
        )}
      </div>
    </>
  );
}
