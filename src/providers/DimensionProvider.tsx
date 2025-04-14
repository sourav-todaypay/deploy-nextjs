'use client';

import React, { createContext, useContext } from 'react';
import { useMediaQuery } from 'usehooks-ts';

const DimensionContext = createContext<{ isMobile: boolean }>({
  isMobile: false,
});

export function DimensionProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <DimensionContext.Provider value={{ isMobile }}>
      {children}
    </DimensionContext.Provider>
  );
}

export function useDimension() {
  return useContext(DimensionContext);
}
