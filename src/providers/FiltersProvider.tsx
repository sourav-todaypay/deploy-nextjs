'use client';
import { createContext, useContext, useState } from 'react';

type DateFilter = { from: string; to: string };

export type FiltersState = {
  merchants: { Status: string[]; merchant_uuid: string };
  customers: { Email: string; Phone: string; product_id: number | undefined };
  offers: { status: string[]; product_id: number | undefined };
  plans: { plan_type: string[] };
  walletTransactions: { Date: DateFilter };
  brands: { display_name: string; is_enabled?: boolean };
  products: { display_name: string; is_enabled?: boolean };
  d2cMerchants: { merchant_name: string };
  orders: { order_id: string; created_at: string };
  feeRate: { entity: string; type: string[] };
};

const initialFilters: FiltersState = {
  merchants: { Status: [], merchant_uuid: '' },
  customers: { Email: '', Phone: '', product_id: undefined },
  offers: { status: [], product_id: undefined },
  plans: { plan_type: [] },
  walletTransactions: { Date: { from: '', to: '' } },
  brands: { display_name: '', is_enabled: undefined },
  products: { display_name: '', is_enabled: undefined },
  d2cMerchants: { merchant_name: '' },
  orders: { order_id: '', created_at: '' },
  feeRate: { entity: '', type: [] },
};

type FiltersContextType = {
  filters: FiltersState;
  setFilter: <T extends keyof FiltersState, K extends keyof FiltersState[T]>(
    category: T,
    filter: K,
    value: FiltersState[T][K],
  ) => void;
  resetFilter: <T extends keyof FiltersState>(excludeCategory: T) => void;
  resetAllFilters: () => void;
};

const FiltersContext = createContext<FiltersContextType>({
  filters: initialFilters,
  setFilter: () => {},
  resetFilter: () => {},
  resetAllFilters: () => {},
});

export const FiltersProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [filters, setFilters] = useState(initialFilters);

  const setFilter: FiltersContextType['setFilter'] = (
    category,
    filter,
    value,
  ) => {
    setFilters(prev => ({
      ...prev,
      [category]: { ...prev[category], [filter]: value },
    }));
  };

  const resetFilter: FiltersContextType['resetFilter'] = excludeCategory => {
    setFilters(prev => {
      const newFilters = Object.fromEntries(
        Object.entries(prev).map(([category, value]) => [
          category,
          category === excludeCategory
            ? value
            : initialFilters[category as keyof FiltersState],
        ]),
      ) as FiltersState;

      return newFilters;
    });
  };

  const resetAllFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <FiltersContext.Provider
      value={{ filters, setFilter, resetFilter, resetAllFilters }}
    >
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = () => useContext(FiltersContext);
