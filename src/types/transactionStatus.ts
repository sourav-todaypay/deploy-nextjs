export const transactionStatus = (status: number) => {
  switch (status) {
    case 100:
      return 'Cancelled';
    case 101:
      return 'Created';
    case 102:
      return 'Pending';
    case 103:
      return 'Expired';
    case 104:
      return 'Completed';
    case 105:
      return 'Failed';
    case 106:
      return 'Reversed';
    default:
      return 'UnKnown Status';
  }
};
