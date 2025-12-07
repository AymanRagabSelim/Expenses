import React from 'react';
import { useCurrency } from '../context/CurrencyContext';

export const CurrencySelector = () => {
    const { selectedCurrency, setSelectedCurrency, currencies } = useCurrency();

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">Display Currency:</span>
            <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="bg-white/10 text-white border border-white/20 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
                {Object.values(currencies).map((c) => (
                    <option key={c.code} value={c.code} className="text-black">
                        {c.code} ({c.symbol})
                    </option>
                ))}
            </select>
        </div>
    );
};
