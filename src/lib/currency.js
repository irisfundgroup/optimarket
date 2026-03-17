// Taux de change fixes (par rapport à EUR comme devise de base)
// Les taux sont mises à jour régulièrement
const EXCHANGE_RATES = {
  EUR: 1,
  USD: 1.10,
  MAD: 11.0,
  XOF: 655.957,
};

const CURRENCY_SYMBOLS = {
  EUR: '€',
  USD: '$',
  MAD: 'د.م.',
  XOF: 'F CFA',
};

const CURRENCY_NAMES = {
  EUR: 'Euro',
  USD: 'US Dollar',
  MAD: 'Moroccan Dirham',
  XOF: 'West African Franc',
};

export const getStoredCurrency = () => {
  return localStorage.getItem('preferred_currency') || 'EUR';
};

export const setStoredCurrency = (currency) => {
  localStorage.setItem('preferred_currency', currency);
};

export const convertPrice = (price, fromCurrency = 'EUR', toCurrency = 'EUR') => {
  if (!price || !EXCHANGE_RATES[fromCurrency] || !EXCHANGE_RATES[toCurrency]) {
    return price;
  }
  // Convertir à EUR d'abord, puis à la devise cible
  const inEur = price / EXCHANGE_RATES[fromCurrency];
  return inEur * EXCHANGE_RATES[toCurrency];
};

export const formatPrice = (price, currency = 'EUR', decimals = 0) => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const converted = convertPrice(price, 'EUR', currency);
  return `${converted.toFixed(decimals)} ${symbol}`;
};

export const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'MAD', 'XOF'];

export { EXCHANGE_RATES, CURRENCY_SYMBOLS, CURRENCY_NAMES };