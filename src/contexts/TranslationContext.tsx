'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import enTranslations from '../../messages/en.json';
import arTranslations from '../../messages/ar.json';

type Translations = typeof enTranslations;

interface TranslationContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
  translations: Translations;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const translationFiles = {
  en: enTranslations,
  ar: arTranslations
};

export function TranslationProvider({ children, initialLocale = 'en' }: { 
  children: ReactNode; 
  initialLocale?: string;
}) {
  const [locale, setLocale] = useState(initialLocale);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translationFiles[locale as keyof typeof translationFiles];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        value = translationFiles.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <TranslationContext.Provider value={{ 
      locale, 
      setLocale, 
      t, 
      translations: translationFiles[locale as keyof typeof translationFiles] 
    }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslations() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslations must be used within TranslationProvider');
  }
  return context;
}

export function useLocale() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useLocale must be used within TranslationProvider');
  }
  return context.locale;
}
