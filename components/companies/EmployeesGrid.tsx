'use client';

import React from 'react';
// Remove Next.js Image import for localhost compatibility
// import Image from 'next/image';
import { Employee } from '../../src/services/entities/employee.service';

interface EmployeesGridProps {
  employees: Employee[];
  locale: 'en' | 'ar';
}

const EmployeesGrid: React.FC<EmployeesGridProps> = ({ employees, locale }) => {
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

  const title = getLocalizedValue({ en: 'Our Team', ar: 'فريقنا' }, locale);

  if (!employees || employees.length === 0) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Section Title */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className={`text-2xl sm:text-3xl font-bold text-main mb-3 sm:mb-4 ${isRTL ? 'font-arabic' : ''}`}>
          {title}
        </h2>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="flex flex-col md:flex-row items-center md:items-start gap-6 p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group"
          >
            {/* Employee Photo */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-gray-200">
                <img
                  src={employee.image?.url || '/placeholder-avatar.jpg'}
                  alt={employee.image ? (locale === 'ar' ? employee.image.alt_ar : employee.image.alt_en) : getLocalizedValue(employee.name, locale)}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-full"
                />
              </div>
            </div>

            {/* Employee Info */}
            <div className="flex-1 text-center md:text-left">
              {/* Employee Name */}
              <h3 className={`text-lg font-semibold text-main mb-2 transition-colors duration-300 group-hover:text-primary ${
                isRTL ? 'text-right' : 'text-left'
              }`}>
                {getLocalizedValue(employee.name, locale)}
              </h3>

              {/* Employee Position */}
              <p className={`text-sm text-muted mb-3 transition-colors duration-300 group-hover:text-neutral-700 ${
                isRTL ? 'text-right' : 'text-left'
              }`}>
                {getLocalizedValue(employee.position, locale)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeesGrid;
