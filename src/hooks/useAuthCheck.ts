import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '../contexts/TranslationContext';

export function useAuthCheck() {
  const router = useRouter();
  const { locale } = useTranslations() as { locale: 'en' | 'ar' };

  useEffect(() => {
    // Check if token exists and is not expired
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        // No token, redirect to login with page reload for clean state
        window.location.href = `/${locale}/admin/auth`;
        return;
      }

      try {
        // Check if token is expired
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (payload.exp < currentTime) {
          // Token expired, clear it and redirect with reload
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = `/${locale}/admin/auth`;
        }
      } catch (error) {
        // Invalid token, clear it and redirect with reload
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = `/${locale}/admin/auth`;
      }
    };

    checkAuth();
  }, [router, locale]);
}
