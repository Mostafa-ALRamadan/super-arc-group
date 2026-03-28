'use client';

import React from 'react';
// Remove Next.js Image import for localhost compatibility
// import Image from 'next/image';
import { Company } from '../../src/services/entities/companies.service';

interface CompanyHeroProps {
  company: Company;
  locale: 'en' | 'ar';
}

const CompanyHero: React.FC<CompanyHeroProps> = ({ company, locale }) => {
  const isRTL = locale === 'ar';
  
  // Helper function to safely get localized content
  const getLocalizedValue = (obj: any, locale: string): string => {
    if (typeof obj === 'string') {
      return obj; // Fallback for old structure
    }
    if (obj && typeof obj === 'object' && 'en' in obj && 'ar' in obj) {
      return locale === 'ar' ? obj.ar : obj.en;
    }
    return ''; // Fallback
  };

  const companyName = getLocalizedValue(company.name, locale);
  const description = getLocalizedValue(company.description, locale);
  const logo = company.image?.url 
    ? (company.image.url.startsWith('http') 
        ? company.image.url 
        : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000'}${company.image.url}`)
    : '';

  return (
    <div className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Company Logo */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-white rounded-2xl shadow-lg p-4 flex items-center justify-center">
              <img
                src={logo}
                alt={`${companyName} logo`}
                className="object-contain rounded-lg max-w-full max-h-full"
                style={{ width: '120px', height: '120px' }}
              />
            </div>
          </div>

          {/* Company Name */}
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 leading-tight mb-6 text-center">
            {companyName}
          </h1>

          {/* Company Description */}
          <p className="text-lg text-neutral-600 leading-relaxed max-w-4xl mx-auto text-center">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyHero;
