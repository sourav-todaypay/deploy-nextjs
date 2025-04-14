/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import DetailsPage from '@/components/DetailsPage';
import { WorkFlow } from '../type';
import WorkFlowModal from '@/components/WorkFlowModal';
import Modal from '@/components/Modal';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { transactionStatus } from '@/types/transactionStatus';
import { DetailItem } from '@/components/DetailItemComponent';

export default function WorkFlowDetails() {
  const { id } = useParams();
  const api = useApiInstance();
  const router = useRouter();
  const [workFlowDetails, setWorkFlowDetails] = useState<WorkFlow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalAction, setModalAction] = useState<'Delete' | 'Edit' | null>(
    null,
  );

  const openModal = (action: 'Delete' | 'Edit') => {
    setModalAction(action);
    setIsOpen(true);
  };

  useEffect(() => {
    if (!id) return;
    fetchWorkFlowDetails();
  }, [id]);

  const fetchWorkFlowDetails = async () => {
    try {
      const response: WorkFlow = await handleResponse(
        api.authenticatedGet(`/internal/workflows/${id}`),
      );
      setWorkFlowDetails(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch workflow details');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!workFlowDetails) return;
    setIsUpdating(true);
    try {
      const response = await handleResponse(
        api.authenticatedDelete(`/internal/workflows/${workFlowDetails.name}`),
      );
      if (response.message) {
        toast.success('WorkFlow deleted successfully');
      }
      setIsOpen(false);
      router.replace('/workflows');
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to delete workflow');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const details: DetailItem[] = workFlowDetails
    ? [
        {
          label: 'Name',
          value: workFlowDetails.name,
          copyable: true,
        },
        {
          label: 'Is WorkFlow Default',
          value: (
            <span className={workFlowDetails.is_default ? 'active' : 'blocked'}>
              {workFlowDetails.is_default ? 'True' : 'False'}
            </span>
          ),
        },
        {
          label: 'Transaction Status',
          value: transactionStatus(workFlowDetails.on_status_code),
        },
        {
          label: 'Transaction Kind',
          value: workFlowDetails.transaction_kind,
        },
        {
          label: 'Transaction Sub Type',
          value: workFlowDetails.sub_type,
          copyable: true,
        },
        {
          label: 'Data',
          value: (
            <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
              {JSON.stringify(workFlowDetails.data, null, 2)}
            </pre>
          ),
          copyable: true,
          fullWidth: Object.keys(workFlowDetails.data || {}).length > 2,
        },
      ]
    : [];

  const workFlowManageOptions = workFlowDetails
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
          headingText="WorkFlow Details"
          className="px-0 pt-0"
          buttons={workFlowManageOptions}
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
              {'Are you sure you want to delete this WorkFlow'}
            </div>
          </Modal>
        )}

        {modalAction === 'Edit' && workFlowDetails && (
          <WorkFlowModal
            isOpen={isOpen}
            onSuccess={fetchWorkFlowDetails}
            onClose={() => setIsOpen(false)}
            initialValues={{
              name: workFlowDetails.name,
              transaction_kind: workFlowDetails.transaction_kind,
              sub_type: workFlowDetails.sub_type,
              on_status_code: workFlowDetails.on_status_code,
              data: JSON.stringify(workFlowDetails.data),
              is_default: workFlowDetails.is_default ? 'true' : 'false',
            }}
          />
        )}
      </div>
    </>
  );
}
