import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(timezone);

export const toDollars = (amount: number = 0) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
};

export const formatPhoneNumber = (phoneNumber: string) => {
  if (!phoneNumber) {
    return '';
  }

  const formattedPhoneNumber = `+1 ${phoneNumber.slice(
    0,
    3,
  )}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;

  return formattedPhoneNumber;
};

export const formatDate = (dateString: string) => {
  if (!dateString) {
    return;
  }
  const date = dayjs(dateString);
  const formattedDate = date.format('MMM D, YYYY');
  return formattedDate;
};

export const formatDateToUTC = (dateString: string) => {
  return dayjs(dateString).format('ddd, MMM D, YYYY h:mm A');
};

export const formatDateTime = (dateString: string) => {
  if (!dateString) {
    return;
  }
  const date = dayjs(dateString);
  const formattedDate = date.format('MMM D, YYYY');
  const formattedTime = date.format('h:mm A').replace(/([ap])m/, '$1 m');
  return `${formattedDate}, ${formattedTime}`;
};

export const addPercentageSign = (num: string | number) => `${num}%`;

export const getDaysString = (num: string | number) => `${num || 0} days`;

export const toLowerString = (str: string): string => str.toLowerCase();

export const getUserTag = (uuid: string) => {
  const firstSpaceIndex = uuid?.indexOf('_');

  if (firstSpaceIndex !== -1) {
    const firstPart = uuid?.slice(0, firstSpaceIndex);
    switch (firstPart?.toLowerCase()) {
      case 'm':
        return 'Merchant';
      default:
        return 'Customer';
    }
  }

  return 'Invalid Tag';
};

export const formatToUSD = (amount: number): string => {
  if (amount < 0) {
    return `-$${Number(Math.abs(amount / 100).toFixed(2))}`;
  }
  return `$${Number(amount / 100).toFixed(2)}`;
};
