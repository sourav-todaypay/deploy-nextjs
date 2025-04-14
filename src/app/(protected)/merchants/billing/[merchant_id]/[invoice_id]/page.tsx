/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Heading from '@/components/Heading';
import toast from 'react-hot-toast';
import { formatDateTime, toDollars } from '@/utils/utils';
import DetailsPage from '@/components/DetailsPage';

import {
  INVOICE_FAILED,
  INVOICE_OVERDUE,
  INVOICE_PENDING,
} from '@/constants/invoiceConstants';
import InvoiceSettlementModal from '@/components/InvoiceSettlementModal';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { DownloadInvoiceDocsSuccessResponse } from './type';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { Invoice } from '../type';
import { DetailItem } from '@/components/DetailItemComponent';

export default function InvoiceDetails() {
  const api = useApiInstance();
  const { invoice_id } = useParams();
  const [invoiceDetails, setInvoiceDetails] = useState<Invoice | null>(null);
  const [invoiceDownload, setInvoiceDownload] =
    useState<DownloadInvoiceDocsSuccessResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!invoice_id) return;
    fetchInvoiceDetails();
  }, [invoice_id]);

  const fetchInvoiceDetails = async () => {
    setIsLoading(true);
    try {
      const response: Invoice = await handleResponse(
        api.authenticatedGet(`/merchants/invoices/${invoice_id}`),
      );
      setInvoiceDetails(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'failed to invoice details');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const details: DetailItem[] = invoiceDetails
    ? [
        {
          label: 'Status',
          value:
            invoiceDetails.status === INVOICE_PENDING ||
            invoiceDetails.status === INVOICE_FAILED ? (
              <span className="due">
                <span className="customer-status">Pending</span>
              </span>
            ) : invoiceDetails.status === INVOICE_OVERDUE ? (
              <span className="due">
                <span>Out Standing</span>
              </span>
            ) : (
              <span className="active">
                <span>Paid</span>
              </span>
            ),
        },
        {
          label: 'Invoice Generation Date',
          value: formatDateTime(invoiceDetails.created_at),
        },
        {
          label: 'Due Date',
          value: formatDateTime(invoiceDetails.due_date),
          copyable: true,
        },
        {
          label: 'Amount',
          value: toDollars(invoiceDetails.amount_in_cents),
        },
        {
          label: 'Invoice Number',
          value: invoiceDetails.invoice_number,
        },
        {
          label: 'Billing Period Start date',
          value: formatDateTime(invoiceDetails.period_start_date),
        },
        {
          label: 'Billing Period End date',
          value: formatDateTime(invoiceDetails.period_end_date),
        },
        {
          label: 'Invoice Id',
          value: invoiceDetails.uuid,
        },
        {
          label: 'Ach Pull Ref',
          value: invoiceDetails.ach_pull_ref_id,
        },
      ]
    : [];

  const handleDownloadClicked = async () => {
    if (!invoiceDetails) return;
    try {
      const response: DownloadInvoiceDocsSuccessResponse = await handleResponse(
        api.authenticatedGet(
          `/internal/invoices/downloads/${invoiceDetails.uuid}?merchant_uuid=${invoiceDetails.merchant_uuid}`,
        ),
      );
      setInvoiceDownload(response);
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'failed to download');
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  useEffect(() => {
    if (invoiceDownload) {
      window.open(invoiceDownload.download_url, '_blank');
    }
  }, [invoiceDownload]);

  const planManageOptions = !invoiceDetails
    ? [
        {
          label: 'Manage',
          isDropdown: true,
          dropdownItems: [
            {
              label: 'Download',
              onClick: () => handleDownloadClicked(),
            },
            {
              label: 'Manual Settlement',
              onClick: () => setIsModalOpen(true),
            },
          ],
        },
      ]
    : [];

  return (
    <>
      <div className="min-h-[100%] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <Heading
          headingText="Billing Details"
          className="px-0 pt-0"
          buttons={planManageOptions}
        />
        <DetailsPage details={details} isLoading={isLoading} />

        {isModalOpen && invoiceDetails && (
          <InvoiceSettlementModal
            isOpen={isModalOpen}
            onSuccess={fetchInvoiceDetails}
            onClose={() => setIsModalOpen(false)}
            initialValues={{
              invoice_number: invoiceDetails.invoice_number,
            }}
          />
        )}
      </div>
    </>
  );
}
