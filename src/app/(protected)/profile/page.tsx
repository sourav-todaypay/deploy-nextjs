/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import { formatDateTime, formatPhoneNumber } from '@/utils/utils';
import DetailsPage from '@/components/DetailsPage';
import { useApiInstance } from '@/hooks/useApiInstance';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { handleResponse } from '@/utils/handleResponse';
import { User } from '@/types/user';
import { DetailItem } from '@/components/DetailItemComponent';

export default function ProfileDetails() {
  const api = useApiInstance();
  const [profileDetails, setProfileDetails] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileDetails = async () => {
      try {
        const response: User = await handleResponse(
          api.authenticatedGet('/users/profile'),
        );
        setProfileDetails(response);
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

    fetchProfileDetails();
  }, []);

  const details: DetailItem[] = profileDetails
    ? [
        {
          label: 'First Name',
          value: profileDetails.first_name,
        },
        {
          label: 'Last Name',
          value: profileDetails.last_name,
          copyable: true,
        },
        {
          label: 'Phone Number',
          value: formatPhoneNumber(profileDetails.phone_number),
          copyable: true,
        },
        {
          label: 'Email',
          value: profileDetails.email,
          copyable: true,
        },
        {
          label: 'Role',
          value:
            profileDetails?.role === 'SUPER_ADMIN'
              ? 'Super Admin'
              : profileDetails?.role || 'N/A',
        },
        {
          label: 'Last Login',
          value: formatDateTime(profileDetails.last_login_at),
        },
      ]
    : [];

  return (
    <>
      <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <Heading headingText="Profile Details" className="px-0 pt-0" />
        <DetailsPage details={details} isLoading={isLoading} />
      </div>
    </>
  );
}
