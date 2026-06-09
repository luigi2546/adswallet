import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { AFRICAN_COUNTRIES, getCountryByCode, Country } from "@/lib/countries";

const STORAGE_KEY = "adwallet_country";

interface CurrencyContextType {
  /** Selected country code (e.g. "GH") */
  countryCode: string;
  /** Full country data object */
  country: Country;
  /** Currency code (e.g. "GHS") */
  currency: string;
  /** Currency symbol (e.g. "₵") */
  currencySymbol: string;
  /** Format a numeric amount with the selected currency symbol */
  formatCurrency: (amount: number, opts?: { showCode?: boolean }) => string;
  /** Update the selected country */
  setCountry: (code: string) => void;
  /** List of all supported countries */
  countries: Country[];
}

const DEFAULT_COUNTRY = "GH";

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [countryCode, setCountryCode] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && getCountryByCode(stored) ? stored : DEFAULT_COUNTRY;
  });

  const country = getCountryByCode(countryCode) ?? getCountryByCode(DEFAULT_COUNTRY)!;
  const currency = country.currency;
  const currencySymbol = country.currencySymbol;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, countryCode);
  }, [countryCode]);

  const setCountry = useCallback((code: string) => {
    if (getCountryByCode(code)) {
      setCountryCode(code);
    }
  }, []);

  const formatCurrency = useCallback(
    (amount: number, opts?: { showCode?: boolean }) => {
      const formatted = amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      if (opts?.showCode) {
        return `${currency} ${formatted}`;
      }
      return `${currencySymbol}${formatted}`;
    },
    [currency, currencySymbol],
  );

  return (
    <CurrencyContext.Provider
      value={{
        countryCode,
        country,
        currency,
        currencySymbol,
        formatCurrency,
        setCountry,
        countries: AFRICAN_COUNTRIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return ctx;
}
