/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import { formatPhoneNumber, formatDate } from '@/utils/utils';
import DetailsPage from '@/components/DetailsPage';
import { waitList } from '../type';
import Modal from '@/components/Modal';
import { useApiInstance } from '@/hooks/useApiInstance';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { handleResponse } from '@/utils/handleResponse';
import { DetailItem } from '@/components/DetailItemComponent';

export default function WaitListDetails() {
  const { id } = useParams();
  const api = useApiInstance();
  const router = useRouter();
  const [waitListDetails, setWaitListDetails] = useState<waitList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalAction, setModalAction] = useState<'Enable' | null>(null);

  const openModal = (action: 'Enable') => {
    setModalAction(action);
    setIsOpen(true);
  };

  useEffect(() => {
    if (!id) return;
    const fetchWaitListDetails = async () => {
      try {
        const response: waitList = await handleResponse(
          api.authenticatedGet(`/internal/invites/waitlist/${id}`),
        );
        setWaitListDetails(response);
      } catch (error) {
        if (isFailureResponse(error)) {
          toast.error(error.message || 'Failed to fetch waitlist details');
        } else {
          toast.error('Something went wrong');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaitListDetails();
  }, [id]);

  const details: DetailItem[] = waitListDetails
    ? [
        {
          label: 'Name',
          value: `${waitListDetails.first_name || ''} ${
            waitListDetails.last_name || ''
          }`.trim(),
        },
        {
          label: 'Email',
          value: waitListDetails.email,
          copyable: true,
        },
        {
          label: 'Phone No.',
          value: formatPhoneNumber(waitListDetails.phone),
          copyable: true,
        },
        {
          label: 'Account Uuid',
          value: waitListDetails.account_uuid,
          copyable: true,
        },
        {
          label: 'Product',
          value: waitListDetails.product_name,
        },
        {
          label: 'WaitListed At',
          value: formatDate(waitListDetails.waitlisted_date),
        },
      ]
    : [];

  const waitListManageOptions = waitListDetails
    ? [
        {
          label: 'Manage',
          isDropdown: true,
          dropdownItems: [
            {
              label: 'Enable',
              onClick: () => openModal('Enable'),
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
        api.authenticatedDelete('/internal/invites/waitlist', {
          action: 'ACTIVE',
          user_uuid: `${id}`,
        }),
      );

      router.replace('/waitlist');
      setIsOpen(false);
      toast.success(response.message);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Action failed');
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
          headingText="WaitList Details"
          className="px-0 pt-0"
          buttons={waitListManageOptions}
        />
        <DetailsPage details={details} isLoading={isLoading} />

        {modalAction === 'Enable' && (
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title={'Delete Fee Rate'}
            onConfirm={handleDelete}
            isLoading={isUpdating}
            disableButtons={isUpdating}
            width="w-[28rem]"
            height="h-[11.5rem]"
          >
            <div className="px-3">
              {'Are you sure you wanna Activate this user from WaitList'}
            </div>
          </Modal>
        )}
      </div>
    </>
  );
}
