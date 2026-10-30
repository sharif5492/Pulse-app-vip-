export interface CountryItem {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
  region?: string;
}

export const GLOBAL_COUNTRIES: CountryItem[] = [
  // Primary (Featured)
  { name: 'Pakistan', code: 'PK', dialCode: '+92', flag: '🇵🇰', region: 'Asia' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦', region: 'Middle East' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪', region: 'Middle East' },
  { name: 'Qatar', code: 'QA', dialCode: '+974', flag: '🇶🇦', region: 'Middle East' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965', flag: '🇰🇼', region: 'Middle East' },
  { name: 'Bahrain', code: 'BH', dialCode: '+973', flag: '🇧🇭', region: 'Middle East' },
  { name: 'Oman', code: 'OM', dialCode: '+968', flag: '🇴🇲', region: 'Middle East' },
  { name: 'Turkey', code: 'TR', dialCode: '+90', flag: '🇹🇷', region: 'Middle East' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧', region: 'Europe' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸', region: 'Americas' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦', region: 'Americas' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', flag: '🇲🇾', region: 'Asia' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', flag: '🇮🇩', region: 'Asia' },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880', flag: '🇧🇩', region: 'Asia' },
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳', region: 'Asia' },
  { name: 'Afghanistan', code: 'AF', dialCode: '+93', flag: '🇦🇫', region: 'Asia' },
  { name: 'Iran', code: 'IR', dialCode: '+98', flag: '🇮🇷', region: 'Middle East' },
  { name: 'Iraq', code: 'IQ', dialCode: '+964', flag: '🇮🇶', region: 'Middle East' },
  { name: 'Jordan', code: 'JO', dialCode: '+962', flag: '🇯🇴', region: 'Middle East' },
  { name: 'Lebanon', code: 'LB', dialCode: '+961', flag: '🇱🇧', region: 'Middle East' },
  { name: 'Egypt', code: 'EG', dialCode: '+20', flag: '🇪🇬', region: 'Africa' },
  { name: 'Morocco', code: 'MA', dialCode: '+212', flag: '🇲🇦', region: 'Africa' },
  { name: 'Algeria', code: 'DZ', dialCode: '+213', flag: '🇩🇿', region: 'Africa' },
  { name: 'Tunisia', code: 'TN', dialCode: '+216', flag: '🇹🇳', region: 'Africa' },

  // Europe
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪', region: 'Europe' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷', region: 'Europe' },
  { name: 'Italy', code: 'IT', dialCode: '+39', flag: '🇮🇹', region: 'Europe' },
  { name: 'Spain', code: 'ES', dialCode: '+34', flag: '🇪🇸', region: 'Europe' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', flag: '🇳🇱', region: 'Europe' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', flag: '🇨🇭', region: 'Europe' },
  { name: 'Sweden', code: 'SE', dialCode: '+46', flag: '🇸🇪', region: 'Europe' },
  { name: 'Norway', code: 'NO', dialCode: '+47', flag: '🇳🇴', region: 'Europe' },
  { name: 'Denmark', code: 'DK', dialCode: '+45', flag: '🇩🇰', region: 'Europe' },
  { name: 'Finland', code: 'FI', dialCode: '+358', flag: '🇫🇮', region: 'Europe' },
  { name: 'Belgium', code: 'BE', dialCode: '+32', flag: '🇧🇪', region: 'Europe' },
  { name: 'Austria', code: 'AT', dialCode: '+43', flag: '🇦🇹', region: 'Europe' },
  { name: 'Ireland', code: 'IE', dialCode: '+353', flag: '🇮🇪', region: 'Europe' },
  { name: 'Portugal', code: 'PT', dialCode: '+351', flag: '🇵🇹', region: 'Europe' },
  { name: 'Greece', code: 'GR', dialCode: '+30', flag: '🇬🇷', region: 'Europe' },
  { name: 'Poland', code: 'PL', dialCode: '+48', flag: '🇵🇱', region: 'Europe' },
  { name: 'Russia', code: 'RU', dialCode: '+7', flag: '🇷🇺', region: 'Europe' },

  // Americas
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺', region: 'Oceania' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', flag: '🇳🇿', region: 'Oceania' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷', region: 'Americas' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', flag: '🇲🇽', region: 'Americas' },
  { name: 'Argentina', code: 'AR', dialCode: '+54', flag: '🇦🇷', region: 'Americas' },
  { name: 'Colombia', code: 'CO', dialCode: '+57', flag: '🇨🇴', region: 'Americas' },
  { name: 'Chile', code: 'CL', dialCode: '+56', flag: '🇨🇱', region: 'Americas' },

  // Asia & Oceania
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵', region: 'Asia' },
  { name: 'South Korea', code: 'KR', dialCode: '+82', flag: '🇰🇷', region: 'Asia' },
  { name: 'China', code: 'CN', dialCode: '+86', flag: '🇨🇳', region: 'Asia' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬', region: 'Asia' },
  { name: 'Philippines', code: 'PH', dialCode: '+63', flag: '🇵🇭', region: 'Asia' },
  { name: 'Thailand', code: 'TH', dialCode: '+66', flag: '🇹🇭', region: 'Asia' },
  { name: 'Vietnam', code: 'VN', dialCode: '+84', flag: '🇻🇳', region: 'Asia' },
  { name: 'Nepal', code: 'NP', dialCode: '+977', flag: '🇳🇵', region: 'Asia' },
  { name: 'Sri Lanka', code: 'LK', dialCode: '+94', flag: '🇱🇰', region: 'Asia' },
  { name: 'Uzbekistan', code: 'UZ', dialCode: '+998', flag: '🇺🇿', region: 'Asia' },
  { name: 'Kazakhstan', code: 'KZ', dialCode: '+7', flag: '🇰🇿', region: 'Asia' },
  { name: 'Azerbaijan', code: 'AZ', dialCode: '+994', flag: '🇦🇿', region: 'Asia' },

  // Africa
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦', region: 'Africa' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬', region: 'Africa' },
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: '🇰🇪', region: 'Africa' },
  { name: 'Ghana', code: 'GH', dialCode: '+233', flag: '🇬🇭', region: 'Africa' },
];

export function getCountryByDialCode(dialCode: string): CountryItem | undefined {
  return GLOBAL_COUNTRIES.find((c) => c.dialCode === dialCode);
}

export function searchCountries(query: string): CountryItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return GLOBAL_COUNTRIES;
  return GLOBAL_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.dialCode.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
  );
}
