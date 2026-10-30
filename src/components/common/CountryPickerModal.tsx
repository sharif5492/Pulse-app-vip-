import React, { useState, useMemo } from 'react';
import { Search, X, Check, Globe } from 'lucide-react';
import { CountryItem, GLOBAL_COUNTRIES } from '../../services/countries';

interface CountryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDialCode: string;
  onSelectCountry: (country: CountryItem) => void;
  title?: string;
}

export const CountryPickerModal: React.FC<CountryPickerModalProps> = ({
  isOpen,
  onClose,
  selectedDialCode,
  onSelectCountry,
  title = 'Select Your Country',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState<string>('all');

  const filteredCountries = useMemo(() => {
    let list = GLOBAL_COUNTRIES;
    if (activeRegion !== 'all') {
      list = list.filter((c) => c.region?.toLowerCase() === activeRegion.toLowerCase());
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.dialCode.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q)
      );
    }
    return list;
  }, [searchQuery, activeRegion]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-[#120524] border border-purple-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-purple-900/60 flex items-center justify-between bg-[#190831]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-900/80 text-amber-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-heading">{title}</h3>
              <p className="text-[10px] text-purple-300">Available worldwide in all countries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-purple-950/60 hover:bg-purple-900 text-purple-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-purple-900/40 bg-[#140627]">
          <div className="relative">
            <Search className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country or dial code (e.g. Pakistan, +92, US)..."
              className="w-full bg-purple-950/70 border border-purple-800/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-amber-400"
              autoFocus
            />
          </div>

          {/* Region Pills */}
          <div className="flex gap-1.5 mt-2.5 overflow-x-auto no-scrollbar pb-0.5">
            {[
              { id: 'all', label: 'All 🌍' },
              { id: 'asia', label: 'Asia 🇵🇰' },
              { id: 'middle east', label: 'Middle East 🇸🇦' },
              { id: 'europe', label: 'Europe 🇬🇧' },
              { id: 'americas', label: 'Americas 🇺🇸' },
              { id: 'africa', label: 'Africa 🇿🇦' },
            ].map((reg) => (
              <button
                key={reg.id}
                onClick={() => setActiveRegion(reg.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition ${
                  activeRegion === reg.id
                    ? 'bg-gradient-to-r from-pink-500 to-amber-500 text-white shadow-sm'
                    : 'bg-purple-950/50 text-purple-300 hover:bg-purple-900/50'
                }`}
              >
                {reg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Country List */}
        <div className="flex-1 overflow-y-auto divide-y divide-purple-900/30 p-2 space-y-1">
          {filteredCountries.length === 0 ? (
            <div className="py-8 text-center text-xs text-purple-400">
              No matching countries found for "{searchQuery}"
            </div>
          ) : (
            filteredCountries.map((country) => {
              const isSelected = country.dialCode === selectedDialCode;
              return (
                <button
                  key={`${country.code}-${country.dialCode}`}
                  onClick={() => {
                    onSelectCountry(country);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition text-left group ${
                    isSelected
                      ? 'bg-purple-900/60 border border-amber-400/60'
                      : 'hover:bg-purple-950/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl shrink-0 group-hover:scale-110 transition">
                      {country.flag}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                          {country.name}
                        </span>
                        <span className="text-[10px] font-mono text-purple-400 uppercase">
                          ({country.code})
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-purple-300">
                        {country.region || 'International'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                      {country.dialCode}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
