import { Products } from '@/providers/AuthProvider';

export const getProductId = (products: Products[]) => {
  const isCore = JSON.parse(localStorage.getItem('isCore') || 'false');
  return isCore
    ? products.find(product => product.productName === 'Core')?.value
    : products.find(product => product.productName === 'D2C')?.value;
};
