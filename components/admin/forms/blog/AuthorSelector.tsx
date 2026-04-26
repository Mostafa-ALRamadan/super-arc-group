'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from '../../../../src/contexts/TranslationContext';
import LoadingSpinner from '../../../ui/admin/LoadingSpinner';

// Define Author interface locally
interface Author {
  id: number;
  name_en: string;
  name_ar: string;
  image_id?: number | null;
  image?: {
    id: number;
    url: string;
    alt_en: string;
    alt_ar: string;
  };
  created_at?: string;
}

interface AuthorSelectorProps {
  selectedAuthorId: number | null;
  onAuthorSelect: (authorId: number | null) => void;
  onAddNewAuthor: () => void;
  onEditAuthor?: (author: Author) => void; // Callback for editing existing author
  refreshTrigger?: number; // Trigger to refresh authors list
  autoSelectNewest?: boolean; // Whether to auto-select the newest author after refresh
  className?: string;
}

const AuthorSelector: React.FC<AuthorSelectorProps> = ({
  selectedAuthorId,
  onAuthorSelect,
  onAddNewAuthor,
  onEditAuthor,
  refreshTrigger,
  autoSelectNewest = false,
  className = ''
}) => {
  const { t } = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch authors
  const fetchAuthors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/authors/`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Authors fetch failed: ${response.status}`, errorText);
        throw new Error(`Failed to fetch authors: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Handle different response formats
      let authorsData = result;
      if (result && typeof result === 'object' && 'results' in result) {
        authorsData = result.results;
      }
      
      // Ensure we have an array
      if (!Array.isArray(authorsData)) {
        console.error('Expected array but got:', typeof authorsData, authorsData);
        authorsData = [];
      }
      
      setAuthors(authorsData);
      
      // Auto-select the newest author if requested
      if (autoSelectNewest && authorsData.length > 0) {
        // Sort by created_at to get the newest author
        const sortedAuthors = authorsData.sort((a: Author, b: Author) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bTime - aTime;
        });
        const newestAuthor = sortedAuthors[0];
        
        if (newestAuthor && newestAuthor.id !== selectedAuthorId) {
          // Only select if it's different from current selection to avoid unnecessary updates
          onAuthorSelect(newestAuthor.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch authors:', err);
      setError(locale === 'ar' ? '\u0641\u0634\u0644 \u0641\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u0624\u0644\u0641\u064a\u0646' : 'Failed to load authors');
    } finally {
      setLoading(false);
    }
  };

  // Fetch authors on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchAuthors();
  }, [locale, refreshTrigger, autoSelectNewest]);

  const getAuthorDisplayName = (author: Author) => {
    const localeKey = `name_${locale}` as 'name_en' | 'name_ar';
    return author[localeKey] || author.name_en;
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <LoadingSpinner size="sm" />
        <span className="text-sm text-muted">
          {locale === 'ar' ? '\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u0624\u0644\u0641\u064a\u0646...' : 'Loading authors...'}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="text-sm text-red-600">{error}</div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-sm text-primary hover:text-primary-dark"
        >
          {locale === 'ar' ? '\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-main mb-2">
        {locale === 'ar' ? '\u0627\u0644\u0645\u0624\u0644\u0641' : 'Author'}
      </label>
      
      <div className="flex space-x-2">
        {/* Author Dropdown */}
        <div className="flex-1">
          <select
            value={selectedAuthorId || ''}
            onChange={(e) => onAuthorSelect(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">
              {locale === 'ar' ? '\u0627\u062e\u062a\u0631 \u0645\u0624\u0644\u0641\u0627\u064b' : 'Select an author'}
            </option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {getAuthorDisplayName(author)}
              </option>
            ))}
          </select>
        </div>

        {/* Add New Author Button */}
        <button
          type="button"
          onClick={onAddNewAuthor}
          className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 whitespace-nowrap"
        >
          {locale === 'ar' ? '+ \u0625\u0636\u0627\u0641\u0629 \u062c\u062f\u064a\u062f' : '+ Add New'}
        </button>
      </div>

      {/* Show selected author details */}
      {selectedAuthorId && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          {(() => {
            const selectedAuthor = authors.find(a => a.id === selectedAuthorId);
            if (!selectedAuthor) return null;
            
            return (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {selectedAuthor.image && (
                    <img
                      src={typeof selectedAuthor.image === 'string' ? selectedAuthor.image : selectedAuthor.image.url}
                      alt={selectedAuthor.name_en}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="text-sm font-medium text-main">
                      {getAuthorDisplayName(selectedAuthor)}
                    </div>
                    <div className="text-xs text-muted">
                      {selectedAuthor.name_en} / {selectedAuthor.name_ar}
                    </div>
                  </div>
                </div>
                {onEditAuthor && (
                  <button
                    type="button"
                    onClick={() => onEditAuthor(selectedAuthor)}
                    className="text-sm text-primary hover:text-primary-dark font-medium"
                  >
                    {locale === 'ar' ? '\u062a\u0639\u062f\u064a\u0644' : 'Edit'}
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* No authors available message */}
      {authors.length === 0 && (
        <div className="text-center py-4 px-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800 mb-2">
            {locale === 'ar' ? '\u0644\u0627 \u064a\u0648\u062c\u062f \u0645\u0624\u0644\u0641\u0648\u0646 \u0645\u062a\u0627\u062d\u0648\u0646' : 'No authors available'}
          </div>
          <button
            type="button"
            onClick={onAddNewAuthor}
            className="text-sm text-primary hover:text-primary-dark font-medium"
          >
            {locale === 'ar' ? '\u0625\u0646\u0634\u0627\u0621 \u0623\u0648\u0644 \u0645\u0624\u0644\u0641' : 'Create first author'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthorSelector;
