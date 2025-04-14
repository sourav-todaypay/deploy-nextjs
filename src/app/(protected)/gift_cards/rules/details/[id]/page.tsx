/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import DetailsPage from '@/components/DetailsPage';
import { toDollars } from '@/utils/utils';
import Modal from '@/components/Modal';
import RulesModal from '@/components/RulesModal';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { Rule } from '../../[provider_brand_name]/[id]/type';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { DetailItem } from '@/components/DetailItemComponent';

export default function RulesDetails() {
  const { id } = useParams();
  const api = useApiInstance();
  const router = useRouter();
  const [rulesDetails, setRulesDetails] = useState<Rule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [actionType, setActionType] = useState<'Delete' | 'Update' | ''>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const openModal = (action: 'Delete' | 'Update') => {
    setIsOpen(true);
    setActionType(action);
  };

  useEffect(() => {
    if (!id) return;
    fetchRulesDetailsDetails();
  }, [id]);

  const fetchRulesDetailsDetails = async () => {
    try {
      const response: Rule = await handleResponse(
        api.authenticatedGet(`/internal/giftcards/brands/rules/${id}`),
      );
      setRulesDetails(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch rule details');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const details: DetailItem[] = rulesDetails
    ? [
        {
          label: 'Name',
          value: rulesDetails.name,
          copyable: true,
        },
        {
          label: 'Brand Name',
          value: rulesDetails.brand_name,
          copyable: true,
        },
        {
          label: 'Provider Name',
          value: rulesDetails.provider_name,
          copyable: true,
        },
        {
          label: 'Rule',
          value: rulesDetails.rule,
        },
        {
          label: 'Weight',
          value: rulesDetails.weight,
        },
        {
          label: 'Amount',
          value: toDollars(rulesDetails.amount_in_cents!),
        },
      ]
    : [];

  const rulesManageOptions = rulesDetails
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
        api.authenticatedDelete(`/internal/giftcards/brands/rules/${id}`),
      );
      setIsOpen(false);
      if (response.message) {
        toast.success('Action Successful');
      }
      router.replace('/gift_cards');
    } catch {
      toast.error('Action Failed');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <Heading
          headingText="Rule Details"
          className="px-0 pt-0"
          buttons={rulesManageOptions}
        />
        <DetailsPage details={details} isLoading={isLoading} />

        {actionType === 'Delete' && (
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="Delete Rule"
            onConfirm={handleDelete}
            isLoading={isUpdating}
            disableButtons={isUpdating}
            width="w-[28rem]"
            height="h-[11.5rem]"
          >
            <div className="px-3">{'Do you wanna delete this rule.'}</div>
          </Modal>
        )}

        {actionType === 'Update' && rulesDetails && (
          <RulesModal
            isOpen={isOpen}
            onSuccess={fetchRulesDetailsDetails}
            onClose={() => setIsOpen(false)}
            initialValues={{
              name: rulesDetails.name,
              provider_id: rulesDetails.provider_id,
              rule: rulesDetails.rule,
              amount_in_cents: rulesDetails.amount_in_cents! / 100,
              weight: rulesDetails.weight,
            }}
          />
        )}
      </div>
    </>
  );
}
