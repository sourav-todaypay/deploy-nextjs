export const getStatusClassAndText = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return { className: 'active', text: 'Active' };
    case 'UPCOMING':
      return { className: 'pending', text: 'Upcoming' };
    case 'EXPIRED':
      return { className: 'blocked', text: 'Expired' };
    case 'APPLICATION_APPROVED':
      return { className: 'active', text: 'Approved' };
    case 'APPLICATION_REJECTED':
      return { className: 'blocked', text: 'Rejected' };
    case 'APPLICATION_PENDING_FOR_APPROVAL':
      return { className: 'pending', text: 'Pending' };
    case 'OPEN':
      return { className: 'open', text: 'Open' };
    case 'PAID':
      return { className: 'active', text: 'Paid' };
    case 'SENT':
      return { className: 'sent', text: 'Sent' };
    case 'FAILED':
      return { className: 'blocked', text: 'Failed' };
    case 'DELAYED':
      return { className: 'delayed', text: 'Delayed' };
    case 'SUCCESS':
      return { className: 'active', text: 'Success' };
    case 'COMPLETED':
      return { className: 'active', text: 'Completed' };
    case 'CAPTURE_PENDING':
      return { className: 'open', text: 'Capture Pending' };
    case 'PAYOUT_PENDING_ACH':
      return { className: 'sent', text: 'Payout Pending ACH' };
    case 'PAYOUT_COMPLETE':
      return { className: 'completed', text: 'Payout Completed' };
    default:
      return { className: 'default', text: 'Unknown' };
  }
};
