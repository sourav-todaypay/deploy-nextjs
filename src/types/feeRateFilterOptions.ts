export const entityFilterOptionsMapping: Record<
  'CUSTOMER' | 'MERCHANT',
  string[]
> = {
  CUSTOMER: [
    'PROCESSING',
    'RESTOCKING',
    'MERCHANT_REFUND',
    'MERCHANT_RETURN_FEE',
  ],
  MERCHANT: [
    'INSTANT_ACCESS_GIFTCARD',
    'INSTANT_ACCESS_PREPAID_CARD',
    'INSTANT_ACCESS_ACH',
    'INSTANT_ACCESS_OCT',
  ],
};

export const filterOptions = [
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Restocking', value: 'RESTOCKING' },
  { label: 'Merchant Refund', value: 'MERCHANT_REFUND' },
  { label: 'Merchant Return Fee', value: 'MERCHANT_RETURN_FEE' },
  { label: 'Instant Access GiftCard', value: 'INSTANT_ACCESS_GIFTCARD' },
  {
    label: 'Instant Access PrePaid Card',
    value: 'INSTANT_ACCESS_PREPAID_CARD',
  },
  { label: 'Instant Access ACH', value: 'INSTANT_ACCESS_ACH' },
  { label: 'Instant Access OCT', value: 'INSTANT_ACCESS_OCT' },
];

export const typeMap: Record<string, string> = {
  PROCESSING: 'Processing',
  RESTOCKING: 'Restocking',
  MERCHANT_REFUND: 'Merchant Refund',
  MERCHANT_RETURN_FEE: 'Merchant Return Fee',
  INSTANT_ACCESS_GIFTCARD: 'Instant Access GiftCard',
  INSTANT_ACCESS_PREPAID_CARD: 'Instant Access PrePaid Card',
  INSTANT_ACCESS_ACH: 'Instant Access ACH',
  INSTANT_ACCESS_OCT: 'Instant Access OCT',
};
