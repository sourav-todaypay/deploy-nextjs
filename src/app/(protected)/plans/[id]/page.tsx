/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import { toDollars } from '@/utils/utils';
import { Plan } from './type';
import DetailsPage from '@/components/DetailsPage';
import Modal from '@/components/Modal';
import PlanModal from '@/components/PlanModal';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { DetailItem } from '@/components/DetailItemComponent';

export default function PlanDetails() {
  const { id } = useParams();
  const api = useApiInstance();
  const router = useRouter();
  const [planDetails, setPlanDetails] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalAction, setModalAction] = useState<'Delete' | 'Edit' | null>(
    null,
  );

  useEffect(() => {
    if (!id) return;
    fetchPlanDetails();
  }, [id]);

  const fetchPlanDetails = async () => {
    try {
      const response: Plan = await handleResponse(
        api.authenticatedGet(`/internal/plans/${id}`),
      );
      setPlanDetails(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch plan details');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!planDetails) return;
    setIsUpdating(true);
    try {
      const response = await handleResponse(
        api.authenticatedDelete(`/internal/plans/${planDetails.uuid}`),
      );
      if (response.message) {
        toast.success('Plan deleted successfully');
      }
      setIsOpen(false);
      router.replace('/plans');
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to delete plan');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const openModal = (action: 'Delete' | 'Edit') => {
    setModalAction(action);
    setIsOpen(true);
  };

  const details: DetailItem[] = planDetails
    ? [
        {
          label: 'Plan Name',
          value: planDetails.plan_name,
          copyable: true,
        },
        {
          label: 'Plan Status',
          value: (
            <span
              className={
                planDetails.is_associated_to_merchant ? 'active' : 'blocked'
              }
            >
              {planDetails.is_associated_to_merchant ? 'In Use' : 'Not In Use'}
            </span>
          ),
        },
        {
          label: 'Credit Allowed',
          value: (
            <span
              className={planDetails.is_credit_allowed ? 'active' : 'blocked'}
            >
              {planDetails.is_credit_allowed ? 'True' : 'False'}
            </span>
          ),
        },
        {
          label: 'Type',
          value: planDetails.type,
        },
        {
          label: 'Plan Uuid',
          value: planDetails.uuid,
          copyable: true,
        },
        {
          label: 'Credit Limit',
          value: toDollars(planDetails.credit_in_cents),
        },
        {
          label: 'Minimum Balance',
          value: toDollars(planDetails.minimum_balance_in_cents!),
        },
        {
          label: 'Description',
          value: planDetails.description,
        },
      ]
    : [];

  const planManageOptions = !planDetails?.is_associated_to_merchant
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
              label: 'Edit',
              onClick: () => openModal('Edit'),
            },
          ],
        },
      ]
    : [];

  return (
    <>
      <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <Heading
          headingText="Plan Details"
          className="px-0 pt-0"
          buttons={planManageOptions}
        />
        <DetailsPage details={details} isLoading={isLoading} />

        {modalAction === 'Delete' && (
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title={'Delete Plan'}
            onConfirm={handleDelete}
            isLoading={isUpdating}
            disableButtons={isUpdating}
            width="w-[28rem]"
            height="h-[11.5rem]"
          >
            <div className="px-3">
              {'Are you sure you want to delete this plan?'}
            </div>
          </Modal>
        )}

        {modalAction === 'Edit' && planDetails && (
          <PlanModal
            isOpen={isOpen}
            onSuccess={fetchPlanDetails}
            onClose={() => setIsOpen(false)}
            initialValues={{
              plan_name: planDetails.plan_name,
              type: planDetails.type,
              settlement_cycle_in_days: planDetails.settlement_cycle_in_days,
              minimum_balance_in_cents: planDetails.minimum_balance_in_cents
                ? planDetails.minimum_balance_in_cents / 100
                : null,
              credit_in_cents: planDetails.credit_in_cents
                ? planDetails.credit_in_cents / 100
                : undefined,
            }}
          />
        )}
      </div>
    </>
  );
}
