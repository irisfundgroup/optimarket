import { useState, useEffect } from 'react';
import { getStoredCurrency, setStoredCurrency } from '@/lib/currency';

export const useCurrency = () => {
  const [currency, setCurrencyState] = useState(() => getStoredCurrency());

  const setCurrency = (newCurrency) => {
    setStoredCurrency(newCurrency);
    setCurrencyState(newCurrency);
  };

  return { currency, setCurrency };
};