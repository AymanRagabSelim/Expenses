import React, { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext();

export const CURRENCIES = {
    OMR: { code: 'OMR', symbol: '﷼', rateToUSD: 2.6008 }, // 1 OMR = 2.60 USD
    USD: { code: 'USD', symbol: '$', rateToUSD: 1 },
    EGP: { code: 'EGP', symbol: '£', rateToUSD: 0.0202 }, // 1 EGP = 0.02 USD (approx 1/49.5)
};

export const CurrencyProvider = ({ children }) => {
    const [selectedCurrency, setSelectedCurrency] = useState('OMR');

    const convert = (amount, fromCurrency, toCurrency) => {
        if (!CURRENCIES[fromCurrency] || !CURRENCIES[toCurrency]) {
            console.warn(`Currency conversion error: Unknown currency ${fromCurrency} or ${toCurrency}`);
            return amount;
        }
        if (fromCurrency === toCurrency) return amount;
        const amountInUSD = amount * CURRENCIES[fromCurrency].rateToUSD;
        const result = amountInUSD / CURRENCIES[toCurrency].rateToUSD;
        return result;
    };

    const format = (amount, currency = selectedCurrency) => {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
            }).format(amount);
        } catch (error) {
            console.error(`Formatting error for currency ${currency}:`, error);
            return `${currency} ${amount}`;
        }
    };

    return (
        <CurrencyContext.Provider value={{ selectedCurrency, setSelectedCurrency, convert, format, currencies: CURRENCIES }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => useContext(CurrencyContext);
