/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import { formatDateTime, formatPhoneNumber, toDollars } from '@/utils/utils';
import {
  Merchant,
  RefundData,
  TransactionsPaginatedResponse,
  User,
  Wallet,
} from './type';
import DetailsPage from '@/components/DetailsPage';
import AssignPlanModal from '@/components/AssignPlanModal';
import { PaginationQueryParams } from '@/types/PaginationQueryParams';
import { CircleAlert, CircleCheck } from 'lucide-react';
import {
  TRANSACTION_BILLED,
  TRANSACTION_CANCELLED,
  TRANSACTION_COMPLETED,
} from '@/constants/transactionConstants';
import Image from 'next/image';
import Table, { Column } from '@/components/Table';
import { mapTableData } from '@/utils/mapTableData';
import PaginationComponent from '@/components/PaginationComponent';
import { Spinner } from '@/components/Spinner';
import { useApiInstance } from '@/hooks/useApiInstance';
import { isFailureResponse } from '@/utils/isFailureResponse';
import Modal from '@/components/Modal';
import MerchantSettingsModal from '@/components/MerchantSettingsModal';
import AssignWorkFlowModal from '@/components/AssignWorkFlowModal';
import AssignFeeRateModal from '@/components/AssignFeeRateModal';
import UploadSplashLogo from '@/components/UploadSplashLogo';
import { handleResponse } from '@/utils/handleResponse';
import { getStatusClassAndText } from '@/utils/statusClassAndText';
import { DetailItem } from '@/components/DetailItemComponent';
import SetRefundLimitModal from '@/components/SetRefundLimitModal';

export default function MerchantDetails() {
  const { id } = useParams<{ id: string }>();
  const api = useApiInstance();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageFromURL = parseInt(searchParams.get('page') || '1');
  const [merchantDetails, setMerchantDetails] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refundsLoading, setRefundsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [actionType, setActionType] = useState<
    | 'BLOCK'
    | 'UNBLOCK'
    | 'SETTINGS'
    | 'ASSIGN_PLAN'
    | 'ASSIGN_WORKFLOW'
    | 'ASSIGN_FEERATE'
    | 'UPLOAD_BANNER'
    | 'SET_REFUND_LIMIT'
    | ''
  >('');
  const [isUpdating, setIsUpdating] = useState(false);

  const openModal = (
    action:
      | 'BLOCK'
      | 'UNBLOCK'
      | 'SETTINGS'
      | 'ASSIGN_PLAN'
      | 'ASSIGN_WORKFLOW'
      | 'ASSIGN_FEERATE'
      | 'UPLOAD_BANNER'
      | 'SET_REFUND_LIMIT',
  ) => {
    setIsOpen(true);
    setActionType(action);
    setModalContent(
      `Are you sure you want to ${action.toLowerCase()} this Merchant.`,
    );
  };

  const [paginationParams, setPaginationParams] =
    useState<PaginationQueryParams>({
      page: pageFromURL,
      limit: 10,
      filter: JSON.stringify({ merchant_uuid: id }),
    });
  const [refundsData, setRefundsData] =
    useState<TransactionsPaginatedResponse>();

  useEffect(() => {
    if (!id) return;
    fetchMerchantDetails();
  }, [id]);

  const fetchMerchantDetails = async () => {
    setIsLoading(true);
    try {
      const response: User = await handleResponse(
        api.authenticatedGet(`/internal/users/profile?user_uuid=${id}`),
      );
      setMerchantDetails(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Failed to fetch merchant details');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!id && merchant.application_status !== 'APPLICATION_APPROVED') return;
    const fetchRefunds = async () => {
      setRefundsLoading(true);
      try {
        const response: TransactionsPaginatedResponse = await handleResponse(
          api.authenticatedGet(`/refunds`, {
            ...paginationParams,
          }),
        );
        setRefundsData(response);
      } catch (error) {
        if (isFailureResponse(error)) {
          toast.error(error.message || 'Failed to fetch refunds');
        } else {
          toast.error('Something went wrong');
        }
      } finally {
        setRefundsLoading(false);
      }
    };

    fetchRefunds();
  }, [paginationParams]);

  const merchant: Merchant =
    merchantDetails?.merchants?.[0] ?? ({} as Merchant);
  const wallet: Wallet = merchantDetails?.wallet ?? ({} as Wallet);

  const details: DetailItem[] = merchantDetails
    ? [
        {
          label: 'Application Status',
          value: (
            <span
              className={`${
                getStatusClassAndText(merchant.application_status).className
              }`}
            >
              {getStatusClassAndText(merchant.application_status).text}
            </span>
          ),
          copyable: false,
        },
        {
          label: 'Status',
          value: (
            <span className={merchant.is_blocked ? 'blocked' : 'active'}>
              {merchant.is_blocked ? 'Blocked' : 'Active'}
            </span>
          ),
        },
        {
          label: 'SFTP Status',
          value: (
            <span className={merchant.sftp_enabled ? 'active' : 'blocked'}>
              {merchant.sftp_enabled ? 'Enabled' : 'Disabled'}
            </span>
          ),
        },
        {
          label: 'Disbursement Notifications',
          value: (
            <span className={merchant.sftp_enabled ? 'active' : 'blocked'}>
              {merchant.instant_notifications_enabled ? 'Enabled' : 'Disabled'}
            </span>
          ),
        },
        {
          label: 'Corporate Name',
          value: merchant.corporate_name,
          copyable: true,
        },
        {
          label: 'Doing Business As',
          value: merchant.doing_business_as,
          copyable: true,
        },
        {
          label: 'Primary Email',
          value: merchantDetails.email,
          copyable: true,
        },
        {
          label: 'Phone Number',
          value: formatPhoneNumber(merchantDetails.phone_number),
          copyable: true,
        },
        { label: 'Website', value: merchant.website, copyable: true },
        {
          label: 'Wallet Balance',
          value: toDollars(wallet.available_balance_in_cents),
        },
        {
          label: 'Email Domain',
          value: merchant.merchant_sender_email,
        },

        { label: 'Merchant UUID', value: merchant.uuid, copyable: true },
        {
          label: 'Approved Date & Time',
          value: formatDateTime(merchant.approved_at),
        },
        {
          label: 'Fee Rate Name',
          value: merchant.fee_rate_details?.name,
        },
        { label: 'Plan Name', value: merchant.current_plan_name },
        {
          label: 'Workflow Name',
          value: merchant.transaction_workflow?.name,
        },
        {
          label: 'Disbursement Delay (in min)',
          value: merchant.disbursement_batch_delayed_by_in_minutes ?? 0,
        },
        {
          label: 'Refund Amount Range',
          value:
            merchant?.minimum_refund_amount_in_cents !== undefined &&
            merchant?.maximum_refund_amount_in_cents !== undefined
              ? `${merchant.minimum_refund_amount_in_cents > 0 ? toDollars(merchant.minimum_refund_amount_in_cents) : 0} - ${merchant.maximum_refund_amount_in_cents > 0 ? toDollars(merchant.maximum_refund_amount_in_cents) : 0}`
              : '',
        },
        {
          label: 'Refund Limit Allowed Per Day',
          value: toDollars(
            merchantDetails.merchant_refund_limit_per_day_in_cents,
          ),
        },
        {
          label: 'Splash Banner',
          value: merchant.splash_banner?.file_name ? (
            <a
              href={`${process.env.NEXT_PUBLIC_BUCKET_URL}/${merchant.splash_banner.file_key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-4 decoration-1"
            >
              {merchant.splash_banner.file_name}
            </a>
          ) : (
            '-'
          ),
        },
      ]
    : [];

  const columns: Column[] = [
    { label: 'Date & Time', field: 'created_at', formatter: formatDateTime },
    { label: 'Amount', field: 'amount_in_cents', formatter: toDollars },
    {
      label: 'Status',
      field: 'current_status_code_description',
      render: (status: string) => (
        <div
          className={`w-[6.5625rem] h-[1.475rem] px-[10px] rounded-md flex items-center justify-center gap-x-1
  ${
    status === TRANSACTION_BILLED || status === TRANSACTION_COMPLETED
      ? 'active !text-green-800'
      : status === 'created'
        ? 'bg-stone-200 text-stone-500'
        : status === TRANSACTION_CANCELLED
          ? 'bg-red-200 text-red-800'
          : 'bg-red-200 text-red-800'
  }`}
        >
          {status === TRANSACTION_BILLED || status === TRANSACTION_COMPLETED ? (
            <>
              <span className="text-sm font-medium">Successful</span>
              <CircleCheck size={15} className="text-green-600 flex-shrink-0" />
            </>
          ) : status === 'created' ? (
            <>
              <span className="text-sm font-medium">Created</span>
              <Image src="/created.svg" alt="created" width={16} height={16} />
            </>
          ) : status === TRANSACTION_CANCELLED ? (
            <>
              <span className="text-sm font-medium">Cancelled</span>
              <CircleAlert size={15} className="text-red-600 flex-shrink-0" />
            </>
          ) : (
            <>
              <span className="text-sm font-medium">Failed</span>
              <CircleAlert size={15} className="text-red-600 flex-shrink-0" />
            </>
          )}
        </div>
      ),
    },
    {
      label: 'Phone Number',
      field: 'phone_number',
      formatter: formatPhoneNumber,
    },
  ];

  const tableData = refundsData?.data
    ? mapTableData(refundsData.data, columns)
    : [];

  const handleRowClick = (rowData: Record<string, RefundData>) => {
    if (rowData) {
      router.push(`/merchants/refunds/${rowData.uuid}`);
    }
  };

  const detailsManageOptions = merchantDetails
    ? [
        {
          label: 'Plans History',
          navigateTo: `/merchants/plan_history/${id}`,
        },
        {
          label: 'Billing',
          navigateTo: `/merchants/billing/${id}`,
        },
        {
          label: 'Wallet',
          navigateTo: `/wallets/${id}`,
        },
        {
          label: 'API keys',
          navigateTo: `/merchants/api_keys/${id}`,
        },
        {
          label: 'Manage',
          isDropdown: true,
          dropdownItems: [
            ...(merchant.is_blocked
              ? [
                  {
                    label: 'Unblock',
                    onClick: () => openModal('UNBLOCK'),
                  },
                ]
              : [
                  {
                    label: 'Block',
                    onClick: () => openModal('BLOCK'),
                  },
                  {
                    label: 'Update Settings',
                    onClick: () => openModal('SETTINGS'),
                  },
                  {
                    label: 'Assign Plan',
                    onClick: () => openModal('ASSIGN_PLAN'),
                  },
                  {
                    label: 'Assign WorkFlow',
                    onClick: () => openModal('ASSIGN_WORKFLOW'),
                  },
                  {
                    label: 'Assign FeeRate',
                    onClick: () => openModal('ASSIGN_FEERATE'),
                  },
                  {
                    label: 'Set Refund Limit',
                    onClick: () => openModal('SET_REFUND_LIMIT'),
                  },
                  {
                    label: 'Upload Splash Banner',
                    onClick: () => openModal('UPLOAD_BANNER'),
                  },
                ]),
          ],
        },
      ]
    : [];

  const handleAction = async () => {
    if (!id) return;
    setIsUpdating(true);
    let response;
    try {
      if (actionType === 'BLOCK') {
        response = await handleResponse(
          api.authenticatedPut(`/internal/merchants/manage-block`, {
            action: actionType,
            merchant_uuid: id,
          }),
        );
      } else {
        response = await handleResponse(
          api.authenticatedPut(`/internal/merchants/manage-block`, {
            action: actionType,
            merchant_uuid: id,
          }),
        );
      }
      if (response) {
        toast.success('Action Successful');
      }
      setMerchantDetails(prev =>
        prev
          ? {
              ...prev,
              merchants: prev.merchants.map(m =>
                m.uuid === id
                  ? { ...m, is_blocked: actionType !== 'UNBLOCK' }
                  : m,
              ),
            }
          : prev,
      );
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

  return (
    <>
      <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <Heading
          headingText="Merchant Details"
          className="px-0 pt-0"
          buttons={detailsManageOptions}
          navigateTo="/merchants"
        />
        <DetailsPage details={details} isLoading={isLoading} />

        {merchantDetails &&
          merchant.application_status === 'APPLICATION_APPROVED' && (
            <>
              <Heading
                headingText="Refund History"
                showBackButton={false}
                className="!text-2xl px-1"
              />

              <div className="space-y-3 pb-2 pt-4">
                {refundsData && (
                  <Table
                    data={tableData!}
                    columns={columns}
                    onRowClick={handleRowClick}
                  />
                )}

                {refundsData && refundsData.total_page !== 0 && (
                  <PaginationComponent
                    paginationParams={paginationParams}
                    setPaginationParams={setPaginationParams}
                    successResponse={refundsData}
                    isLoading={refundsLoading}
                  />
                )}

                {refundsLoading && !refundsData && (
                  <Spinner className="mt-10" />
                )}
              </div>
            </>
          )}

        {(actionType === 'BLOCK' || actionType === 'UNBLOCK') && (
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title={
              actionType === 'BLOCK' ? 'Block Merchant' : 'Unblock Merchant'
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

        {actionType === 'SETTINGS' && merchantDetails && (
          <MerchantSettingsModal
            isOpen={isOpen}
            onSuccess={fetchMerchantDetails}
            onClose={() => setIsOpen(false)}
            initialValues={{
              merchant_name: merchant.corporate_name,
              delayed_by: merchant.disbursement_batch_delayed_by_in_minutes,
              minimum_refund_amount_in_cents:
                merchant.minimum_refund_amount_in_cents,
              maximum_refund_amount_in_cents:
                merchant.maximum_refund_amount_in_cents,
              sftp_value: merchant.sftp_enabled,
              notification_value: merchant.instant_notifications_enabled,
            }}
          />
        )}

        {actionType === 'ASSIGN_PLAN' && merchantDetails && (
          <AssignPlanModal
            isOpen={isOpen}
            onSuccess={fetchMerchantDetails}
            onClose={() => setIsOpen(false)}
            current_plan_end_date={merchant.current_plan_end_date}
            initialValues={{
              merchant_name: merchant.corporate_name,
              plan_uuid: merchant.current_plan_id,
            }}
          />
        )}

        {actionType === 'ASSIGN_WORKFLOW' && merchantDetails && (
          <AssignWorkFlowModal
            isOpen={isOpen}
            onSuccess={fetchMerchantDetails}
            onClose={() => setIsOpen(false)}
            initialValues={{
              merchant_name: merchant.corporate_name,
              name: merchant.transaction_workflow?.name,
            }}
          />
        )}

        {actionType === 'ASSIGN_FEERATE' && merchantDetails && (
          <AssignFeeRateModal
            isOpen={isOpen}
            onSuccess={fetchMerchantDetails}
            onClose={() => setIsOpen(false)}
            initialValues={{
              merchant_name: merchant.corporate_name,
              fee_rate_id: merchant.fee_rate_details?.id,
            }}
          />
        )}

        {actionType === 'UPLOAD_BANNER' && merchantDetails && (
          <UploadSplashLogo isOpen={isOpen} onClose={() => setIsOpen(false)} />
        )}

        {actionType === 'SET_REFUND_LIMIT' && merchantDetails && (
          <SetRefundLimitModal
            isOpen={isOpen}
            onSuccess={fetchMerchantDetails}
            onClose={() => setIsOpen(false)}
            initialValues={{
              amount_in_cents:
                merchantDetails.merchant_refund_limit_per_day_in_cents / 100,
            }}
          />
        )}
      </div>
    </>
  );
}
