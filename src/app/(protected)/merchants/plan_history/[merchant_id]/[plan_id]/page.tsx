/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import { getDaysString, toDollars } from '@/utils/utils';
import DetailsPage from '@/components/DetailsPage';
import { useApiInstance } from '@/hooks/useApiInstance';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { handleResponse } from '@/utils/handleResponse';
import { Plan } from '@/app/(protected)/plans/type';
import { DetailItem } from '@/components/DetailItemComponent';

export default function PlanDetails() {
  const { plan_id } = useParams();
  const api = useApiInstance();
  const [planDetails, setPlanDetails] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!plan_id) return;
    const fetchPlanDetails = async () => {
      setIsLoading(true);
      try {
        const response: Plan = await handleResponse(
          api.authenticatedGet(`/internal/plans/${plan_id}`),
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

    fetchPlanDetails();
  }, [plan_id]);

  const details: DetailItem[] = planDetails
    ? [
        {
          label: 'Plan Name',
          value: planDetails.plan_name,
          copyable: true,
        },
        {
          label: 'Status',
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
            <span>{planDetails.is_credit_allowed ? 'True' : 'False'}</span>
          ),
        },
        {
          label: 'Type',
          value: planDetails.type,
          copyable: true,
        },
        {
          label: 'Plan Uuid',
          value: planDetails.uuid,
          copyable: true,
        },
        {
          label: 'Settlement Cycle',
          value: getDaysString(planDetails.settlement_cycle_in_days),
        },
        {
          label: 'Minimum Balance',
          value: toDollars(planDetails.minimum_balance_in_cents),
        },
        {
          label: 'Credit Limit',
          value: toDollars(planDetails.credit_in_cents),
        },
        {
          label: 'Description',
          value: planDetails.description,
          copyable: true,
        },
      ]
    : [];

  return (
    <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      <Heading headingText="Plan Details" className="px-0 pt-0" />
      <DetailsPage details={details} isLoading={isLoading} />
    </div>
  );
}
