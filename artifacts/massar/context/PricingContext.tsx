import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type PricingConfig = {
  baseFare: number;
  discount3: number;
  discount4: number;
};

export type FareQuote = {
  total: number;
  perSeat: number;
  regularTotal: number;
  discount: number;
};

const STORAGE_KEY = '@massar/pricing';

export const defaultPricing: PricingConfig = {
  baseFare: 3,
  discount3: 0,
  discount4: 2,
};

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function discountForSeats(seats: number, pricing: PricingConfig) {
  if (seats >= 4) return Math.max(0, pricing.discount4);
  if (seats >= 3) return Math.max(0, pricing.discount3);
  return 0;
}

export function calculateFare(seats: number, pricing: PricingConfig): FareQuote {
  const safeSeats = Math.max(1, Math.min(4, Math.round(seats)));
  const baseFare = Math.max(0.5, pricing.baseFare);
  const regularTotal = baseFare * safeSeats;
  const requestedDiscount = discountForSeats(safeSeats, pricing);
  const previousDiscount = discountForSeats(safeSeats - 1, pricing);
  const previousTotal = safeSeats === 1 ? 0 : baseFare * (safeSeats - 1) - previousDiscount;
  const minimumTotal = safeSeats === 1 ? 0 : previousTotal + 0.01;
  const total = roundCurrency(Math.max(minimumTotal, regularTotal - requestedDiscount));
  const discount = roundCurrency(Math.max(0, regularTotal - total));

  return {
    total,
    perSeat: roundCurrency(total / safeSeats),
    regularTotal: roundCurrency(regularTotal),
    discount,
  };
}

type PricingContextValue = {
  pricing: PricingConfig;
  updatePricing: (patch: Partial<PricingConfig>) => void;
};

const PricingContext = createContext<PricingContextValue | null>(null);

export function PricingProvider({ children }: { children: React.ReactNode }) {
  const [pricing, setPricing] = useState<PricingConfig>(defaultPricing);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (!active) return;
      if (!saved) {
        setHydrated(true);
        return;
      }
      try {
        const parsed = JSON.parse(saved) as Partial<PricingConfig>;
        setPricing({
          baseFare: typeof parsed.baseFare === 'number' ? Math.max(0.5, parsed.baseFare) : defaultPricing.baseFare,
          discount3: typeof parsed.discount3 === 'number' ? Math.max(0, parsed.discount3) : defaultPricing.discount3,
          discount4: typeof parsed.discount4 === 'number' ? Math.max(0, parsed.discount4) : defaultPricing.discount4,
        });
      } catch {
        setPricing(defaultPricing);
      }
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (hydrated) void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pricing));
  }, [hydrated, pricing]);

  const updatePricing = (patch: Partial<PricingConfig>) => {
    setPricing((current) => {
      return {
        baseFare: patch.baseFare === undefined ? current.baseFare : Math.max(0.5, patch.baseFare),
        discount3: patch.discount3 === undefined ? current.discount3 : Math.max(0, patch.discount3),
        discount4: patch.discount4 === undefined ? current.discount4 : Math.max(0, patch.discount4),
      };
    });
  };

  const value = useMemo(() => ({ pricing, updatePricing }), [pricing]);

  return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>;
}

export function usePricing() {
  const context = useContext(PricingContext);
  if (!context) throw new Error('usePricing must be used inside PricingProvider');
  return context;
}