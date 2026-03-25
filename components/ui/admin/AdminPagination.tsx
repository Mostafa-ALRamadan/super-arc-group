import React from 'react';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  locale?: 'en' | 'ar';
  rowsPerPage?: number;
  totalRows?: number;
}

const translations = {
  en: {
    previous: 'Previous',
    next: 'Next',
    rows: 'rows',
    of: 'of',
    showing: 'Showing',
    to: 'to'
  },
  ar: {
    previous: 'السابق',
    next: 'التالي',
    rows: 'صفوف',
    of: 'من',
    showing: 'عرض',
    to: 'إلى'
  }
};

const AdminPagination: React.FC<AdminPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showPrevNext = true,
  maxVisiblePages = 5,
  locale = 'en',
  rowsPerPage = 10,
  totalRows = 0
}) => {
  const t = translations[locale];

  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();
  const startRow = (currentPage - 1) * rowsPerPage + 1;
  const endRow = Math.min(currentPage * rowsPerPage, totalRows);

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 sm:px-6">
      {/* Rows info */}
      <div className="flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
        >
          {t.previous}
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
        >
          {t.next}
        </button>
      </div>
      
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        {/* Row count info */}
        <div>
          <p className="text-sm text-gray-600 font-medium">
            {t.showing} <span className="font-semibold text-primary">{startRow}</span> {t.to}{' '}
            <span className="font-semibold text-primary">{endRow}</span> {t.of}{' '}
            <span className="font-semibold text-primary">{totalRows}</span> {t.rows}
          </p>
        </div>
        
        {/* Pagination buttons */}
        <div>
          <nav className="relative z-0 inline-flex rounded-lg shadow-md overflow-hidden" aria-label="Pagination">
            {showPrevNext && (
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-3 py-2 bg-white text-sm font-medium transition-all duration-200 ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed border-r border-gray-200'
                    : 'text-gray-600 hover:bg-primary hover:text-white border-r border-gray-200'
                }`}
              >
                <span className="sr-only">{t.previous}</span>
                <svg className={`w-5 h-5 ${locale === 'ar' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            )}

            {/* First page */}
            {visiblePages[0] > 1 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className="relative inline-flex items-center px-4 py-2 bg-white border-r border-gray-200 text-sm font-medium text-gray-600 hover:bg-primary hover:text-white transition-all duration-200"
                >
                  1
                </button>
                {visiblePages[0] > 2 && (
                  <span className="relative inline-flex items-center px-4 py-2 bg-white border-r border-gray-200 text-sm font-medium text-gray-400">
                    ...
                  </span>
                )}
              </>
            )}

            {/* Visible pages */}
            {visiblePages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border-r border-gray-200 text-sm font-medium transition-all duration-200 ${
                  currentPage === page
                    ? 'z-10 bg-primary text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-primary hover:text-white'
                }`}
              >
                {page}
              </button>
            ))}

            {/* Last page */}
            {visiblePages[visiblePages.length - 1] < totalPages && (
              <>
                {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                  <span className="relative inline-flex items-center px-4 py-2 bg-white border-r border-gray-200 text-sm font-medium text-gray-400">
                    ...
                  </span>
                )}
                <button
                  onClick={() => onPageChange(totalPages)}
                  className="relative inline-flex items-center px-4 py-2 bg-white border-r border-gray-200 text-sm font-medium text-gray-600 hover:bg-primary hover:text-white transition-all duration-200"
                >
                  {totalPages}
                </button>
              </>
            )}

            {showPrevNext && (
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-3 py-2 bg-white text-sm font-medium transition-all duration-200 ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-primary hover:text-white'
                }`}
              >
                <span className="sr-only">{t.next}</span>
                <svg className={`w-5 h-5 ${locale === 'ar' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default AdminPagination;
