'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from '../../../../contexts/TranslationContext';
import { useAuth } from '../../../../contexts/AuthContext';

export default function AdminAuthPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const { t } = useTranslations();
  const locale = useLocale();
  const { login, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only hide header/footer if this is an admin page (has admin-page class)
    // If user just logged out, admin-page class was removed, so show public elements
    const isAdminPage = document.body.classList.contains('admin-page');
    
    const publicHeader = document.querySelector('header.fixed.top-0.left-0.right-0') as HTMLElement;
    const publicFooter = document.querySelector('footer') as HTMLElement;
    const headerSpacer = document.querySelector('div[style*="height: 80px"]') as HTMLElement;
    
    if (isAdminPage) {
      // Hide public elements for admin pages
      if (publicHeader) publicHeader.style.display = 'none';
      if (headerSpacer) headerSpacer.style.display = 'none';
      if (publicFooter) publicFooter.style.display = 'none';
    } else {
      // Show public elements if not an admin page (e.g., after logout)
      if (publicHeader) publicHeader.style.display = '';
      if (headerSpacer) headerSpacer.style.display = '';
      if (publicFooter) publicFooter.style.display = '';
    }
    
    // Cleanup when component unmounts
    return () => {
      if (publicHeader) publicHeader.style.display = '';
      if (headerSpacer) headerSpacer.style.display = '';
      if (publicFooter) publicFooter.style.display = '';
    };
  }, []);

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    // Add a small delay to prevent redirect loops when manually setting tokens
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        // Only redirect if we're on the auth page specifically
        // This prevents redirect loops during testing
        if (window.location.pathname.includes('/admin/auth')) {
          router.push(`/${locale}/admin`);
        }
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // Real authentication with backend using auth context
      await login(formData.username, formData.password);
      
      // Redirect to admin dashboard
      router.push(`/${locale}/admin`);
    } catch (error) {
      // Display the error message from the backend with localization
      let errorMessage = error instanceof Error ? error.message : t('admin.auth.invalidCredentials');
      
      // Check for rate limit error pattern and localize it
      const rateLimitMatch = errorMessage.match(/Too many failed login attempts.*?(\d+)\s*minutes?/i);
      if (rateLimitMatch) {
        const minutes = rateLimitMatch[1];
        errorMessage = t('admin.auth.rateLimit').replace('{minutes}', minutes);
      }
      // Check for invalid credentials and localize it
      else if (errorMessage.toLowerCase().includes('invalid') && 
               (errorMessage.toLowerCase().includes('credentials') || 
                errorMessage.toLowerCase().includes('username') || 
                errorMessage.toLowerCase().includes('password'))) {
        errorMessage = t('admin.auth.invalidCredentials');
      }
      
      setError(errorMessage);
      console.error('Login error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-light via-white to-primary-light flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-main mb-2">
              {t('admin.auth.welcome')}
            </h1>
            <p className="text-muted">
              {t('admin.auth.signIn')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-main mb-2">
                {t('admin.auth.username')}
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-main mb-2">
                {t('admin.auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full ${locale === 'ar' ? 'pr-4 pl-12' : 'pl-4 pr-12'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent`}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className={`absolute inset-y-0 ${locale === 'ar' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-gray-400 hover:text-gray-600 focus:outline-none`}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {isLoading ? t('admin.auth.pleaseWait') : t('admin.auth.signInButton')}
            </button>

            <div className="text-center">
              <p className="text-sm text-muted">
                {t('admin.auth.forgotPassword')}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
