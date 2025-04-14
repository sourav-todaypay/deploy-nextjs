/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import { formatDate, formatDateTime, toDollars } from '@/utils/utils';
import DetailsPage from '@/components/DetailsPage';
import Table, { Column } from '@/components/Table';
import { getStatusClassAndText } from '@/utils/statusClassAndText';
import { mapTableData } from '@/utils/mapTableData';
import { Spinner } from '@/components/Spinner';
import Modal from '@/components/Modal';
import Image from 'next/image';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { AchPullEvents } from './type';
import { DetailItem } from '@/components/DetailItemComponent';

export default function AchPaymentDetails() {
  const { id } = useParams();
  const api = useApiInstance();
  const [achPaymentDetails, setAchPaymentDetails] =
    useState<AchPullEvents | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPayload, setSelectedPayload] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchPaymentList = async () => {
      setIsLoading(true);
      try {
        const response: AchPullEvents = await handleResponse(
          api.authenticatedGet(`/internal/ach/logs/${id}`),
        );
        setAchPaymentDetails(response);
      } catch (error) {
        if (isFailureResponse(error)) {
          toast.error(error.message || 'Failed to fetch payment details');
        } else {
          toast.error('Something went wrong');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentList();
  }, [id]);

  const details: DetailItem[] = achPaymentDetails
    ? [
        {
          label: 'Status',
          value: (
            <span
              className={`${
                getStatusClassAndText(achPaymentDetails.status).className
              }`}
            >
              {getStatusClassAndText(achPaymentDetails.status).text}
            </span>
          ),
        },
        {
          label: 'Date & Time Initiated To GrailPay',
          value: formatDate(achPaymentDetails.timestamp),
        },
        {
          label: 'Total Amount',
          value: toDollars(achPaymentDetails.amount),
        },
        {
          label: 'Provider ID',
          value: achPaymentDetails.provider_id,
          copyable: true,
        },
        {
          label: 'External Ref ID',
          value: achPaymentDetails.external_ref_id,
          copyable: true,
        },
      ]
    : [];

  const columns: Column[] = [
    {
      label: 'Event',
      field: 'event',
    },
    {
      label: 'Date & Time',
      field: 'updated_at',
      formatter: formatDateTime,
    },
    {
      label: 'Capture Status',
      field: 'capture_status',
    },
    {
      label: 'Delay Days',
      field: 'payout_delay_days',
    },
    {
      label: 'Status',
      field: 'status',
      render: (status: string) => (
        <span className={`${getStatusClassAndText(status).className}`}>
          {getStatusClassAndText(status).text}
        </span>
      ),
    },
  ];

  const tableData = achPaymentDetails?.events
    ? mapTableData(achPaymentDetails.events, columns)
    : [];

  const handleRowClick = (rowData: Record<string, AchPullEvents>) => {
    if (rowData.json_payload) {
      setSelectedPayload(JSON.stringify(rowData.json_payload, null, 2));
      setIsModalOpen(true);
    }
  };

  const handleClipboardClick = () => {
    if (selectedPayload) {
      navigator.clipboard
        .writeText(selectedPayload)
        .then(() => {
          toast.success('Copied to clipboard!', {
            position: 'top-right',
          });
        })
        .catch(() => {
          toast.error('Failed to copy!', {
            position: 'top-right',
          });
        });
    }
  };

  return (
    <>
      <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <Heading headingText="ACH Payments" className="px-0 pt-0" />
        <DetailsPage details={details} isLoading={isLoading} />

        {achPaymentDetails && achPaymentDetails?.events?.length > 0 && (
          <>
            <Heading
              headingText="GrailPay Events"
              showBackButton={false}
              className="!text-2xl px-1"
            />

            <div className="space-y-3 pb-2 pt-4">
              {achPaymentDetails && (
                <Table
                  data={tableData!}
                  columns={columns}
                  onRowClick={handleRowClick}
                />
              )}

              {isLoading && <Spinner className="mt-10" />}
            </div>
          </>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Grailpay Event Details"
          disableClose
          width="w-[40rem]"
          height=""
          onConfirm={() => {}}
        >
          <div className="relative bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
            <button
              onClick={e => {
                e.stopPropagation();
                handleClipboardClick();
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
            >
              <Image
                src="/clipboard.svg"
                alt="Copy to clipboard"
                width={18}
                height={18}
              />
            </button>
            <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {selectedPayload}
            </pre>
          </div>
        </Modal>
      </div>
    </>
  );
}
