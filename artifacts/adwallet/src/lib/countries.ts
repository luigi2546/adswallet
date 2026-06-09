export type Country = {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  mobileMoneyProvider?: string;
};

export const AFRICAN_COUNTRIES: Country[] = [
  { code: "GH", name: "Ghana", currency: "GHS", currencySymbol: "₵", flag: "🇬🇭", mobileMoneyProvider: "MTN MoMo / Vodafone Cash / AirtelTigo" },
  { code: "NG", name: "Nigeria", currency: "NGN", currencySymbol: "₦", flag: "🇳🇬", mobileMoneyProvider: "OPay / Flutterwave" },
  { code: "KE", name: "Kenya", currency: "KES", currencySymbol: "KSh", flag: "🇰🇪", mobileMoneyProvider: "M-Pesa" },
  { code: "ZA", name: "South Africa", currency: "ZAR", currencySymbol: "R", flag: "🇿🇦" },
  { code: "UG", name: "Uganda", currency: "UGX", currencySymbol: "USh", flag: "🇺🇬", mobileMoneyProvider: "MTN MoMo / Airtel Money" },
  { code: "TZ", name: "Tanzania", currency: "TZS", currencySymbol: "TSh", flag: "🇹🇿", mobileMoneyProvider: "M-Pesa / Tigo Pesa" },
  { code: "RW", name: "Rwanda", currency: "RWF", currencySymbol: "Fr", flag: "🇷🇼", mobileMoneyProvider: "MTN MoMo / Airtel Money" },
  { code: "ET", name: "Ethiopia", currency: "ETB", currencySymbol: "Br", flag: "🇪🇹", mobileMoneyProvider: "Telebirr" },
  { code: "EG", name: "Egypt", currency: "EGP", currencySymbol: "£", flag: "🇪🇬" },
  { code: "MA", name: "Morocco", currency: "MAD", currencySymbol: "DH", flag: "🇲🇦" },
  { code: "TN", name: "Tunisia", currency: "TND", currencySymbol: "DT", flag: "🇹🇳" },
  { code: "DZ", name: "Algeria", currency: "DZD", currencySymbol: "DA", flag: "🇩🇿" },
  { code: "SN", name: "Senegal", currency: "XOF", currencySymbol: "Fr", flag: "🇸🇳", mobileMoneyProvider: "Wave / Orange Money" },
  { code: "CI", name: "Ivory Coast", currency: "XOF", currencySymbol: "Fr", flag: "🇨🇮", mobileMoneyProvider: "MTN MoMo / Orange Money" },
  { code: "CM", name: "Cameroon", currency: "XAF", currencySymbol: "Fr", flag: "🇨🇲", mobileMoneyProvider: "MTN MoMo / Orange Money" },
  { code: "ML", name: "Mali", currency: "XOF", currencySymbol: "Fr", flag: "🇲🇱", mobileMoneyProvider: "Orange Money" },
  { code: "BF", name: "Burkina Faso", currency: "XOF", currencySymbol: "Fr", flag: "🇧🇫", mobileMoneyProvider: "Orange Money" },
  { code: "NE", name: "Niger", currency: "XOF", currencySymbol: "Fr", flag: "🇳🇪", mobileMoneyProvider: "Orange Money / Airtel Money" },
  { code: "TD", name: "Chad", currency: "XAF", currencySymbol: "Fr", flag: "🇹🇩" },
  { code: "GA", name: "Gabon", currency: "XAF", currencySymbol: "Fr", flag: "🇬🇦" },
  { code: "CG", name: "Republic of Congo", currency: "XAF", currencySymbol: "Fr", flag: "🇨🇬" },
  { code: "CD", name: "DR Congo", currency: "CDF", currencySymbol: "Fr", flag: "🇨🇩", mobileMoneyProvider: "Vodacom M-Pesa / Airtel Money" },
  { code: "AO", name: "Angola", currency: "AOA", currencySymbol: "Kz", flag: "🇦🇴" },
  { code: "MZ", name: "Mozambique", currency: "MZN", currencySymbol: "MT", flag: "🇲🇿", mobileMoneyProvider: "M-Pesa / Airtel Money" },
  { code: "ZM", name: "Zambia", currency: "ZMW", currencySymbol: "ZK", flag: "🇿🇲", mobileMoneyProvider: "MTN MoMo / Airtel Money" },
  { code: "ZW", name: "Zimbabwe", currency: "USD", currencySymbol: "$", flag: "🇿🇼", mobileMoneyProvider: "EcoCash" },
  { code: "BW", name: "Botswana", currency: "BWP", currencySymbol: "P", flag: "🇧🇼" },
  { code: "NA", name: "Namibia", currency: "NAD", currencySymbol: "$", flag: "🇳🇦" },
  { code: "LS", name: "Lesotho", currency: "LSL", currencySymbol: "L", flag: "🇱🇸" },
  { code: "SZ", name: "Eswatini", currency: "SZL", currencySymbol: "L", flag: "🇸🇿" },
  { code: "MW", name: "Malawi", currency: "MWK", currencySymbol: "MK", flag: "🇲🇼", mobileMoneyProvider: "TNM Mpamba / Airtel Money" },
  { code: "MG", name: "Madagascar", currency: "MGA", currencySymbol: "Ar", flag: "🇲🇬" },
  { code: "MU", name: "Mauritius", currency: "MUR", currencySymbol: "₨", flag: "🇲🇺" },
  { code: "SC", name: "Seychelles", currency: "SCR", currencySymbol: "₨", flag: "🇸🇨" },
  { code: "SS", name: "South Sudan", currency: "SSP", currencySymbol: "£", flag: "🇸🇸" },
  { code: "SD", name: "Sudan", currency: "SDG", currencySymbol: "£", flag: "🇸🇩" },
  { code: "SO", name: "Somalia", currency: "SOS", currencySymbol: "Sh", flag: "🇸🇴", mobileMoneyProvider: "Hormuud EVC Plus" },
  { code: "DJ", name: "Djibouti", currency: "DJF", currencySymbol: "Fr", flag: "🇩🇯" },
  { code: "ER", name: "Eritrea", currency: "ERN", currencySymbol: "Nfk", flag: "🇪🇷" },
  { code: "SL", name: "Sierra Leone", currency: "SLL", currencySymbol: "Le", flag: "🇸🇱", mobileMoneyProvider: "Orange Money / Africell" },
  { code: "LR", name: "Liberia", currency: "LRD", currencySymbol: "$", flag: "🇱🇷" },
  { code: "GN", name: "Guinea", currency: "GNF", currencySymbol: "Fr", flag: "🇬🇳", mobileMoneyProvider: "Orange Money / MTN MoMo" },
  { code: "GM", name: "Gambia", currency: "GMD", currencySymbol: "D", flag: "🇬🇲", mobileMoneyProvider: "Africell Money / QMoney" },
  { code: "GW", name: "Guinea-Bissau", currency: "XOF", currencySymbol: "Fr", flag: "🇬🇼" },
  { code: "CV", name: "Cape Verde", currency: "CVE", currencySymbol: "$", flag: "🇨🇻" },
  { code: "ST", name: "Sao Tome & Principe", currency: "STN", currencySymbol: "Db", flag: "🇸🇹" },
  { code: "KM", name: "Comoros", currency: "KMF", currencySymbol: "Fr", flag: "🇰🇲" },
  { code: "GQ", name: "Equatorial Guinea", currency: "XAF", currencySymbol: "Fr", flag: "🇬🇶" },
  { code: "CF", name: "Central African Republic", currency: "XAF", currencySymbol: "Fr", flag: "🇨🇫" },
  { code: "BI", name: "Burundi", currency: "BIF", currencySymbol: "Fr", flag: "🇧🇮", mobileMoneyProvider: "Lumicash / Econet" },
  { code: "MR", name: "Mauritania", currency: "MRU", currencySymbol: "UM", flag: "🇲🇷" },
  { code: "TG", name: "Togo", currency: "XOF", currencySymbol: "Fr", flag: "🇹🇬", mobileMoneyProvider: "Flooz / T-Money" },
  { code: "BJ", name: "Benin", currency: "XOF", currencySymbol: "Fr", flag: "🇧🇯", mobileMoneyProvider: "MTN MoMo" },
  { code: "LY", name: "Libya", currency: "LYD", currencySymbol: "LD", flag: "🇱🇾" },
];

export function getCurrencyForCountry(code: string): string {
  return AFRICAN_COUNTRIES.find(c => c.code === code)?.currency ?? "USD";
}

export function getCountryByCode(code: string): Country | undefined {
  return AFRICAN_COUNTRIES.find(c => c.code === code);
}
