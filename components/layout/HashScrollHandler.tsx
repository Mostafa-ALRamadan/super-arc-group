'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function HashScrollHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isReady, setIsReady] = useState(false);

  // Mark when component is ready
  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    // Only proceed if component is ready and we have a pathname
    if (!isReady || !pathname) return;

    // Handle hash scrolling on page load and route changes
    const handleHashScroll = (retryCount = 0) => {
      const hash = window.location.hash;
      if (hash) {
        const targetId = hash.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          // Element found, scroll to it
          const headerOffset = 80; // Match the scroll-margin-top
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        } else if (retryCount < 5) {
          // Element not found, retry after a short delay
          setTimeout(() => {
            handleHashScroll(retryCount + 1);
          }, 200 * (retryCount + 1)); // Exponential backoff: 200ms, 400ms, 600ms, 800ms, 1000ms
        }
      }
    };

    // Initial scroll with a small delay to ensure DOM is ready
    const initialScrollTimeout = setTimeout(() => {
      handleHashScroll();
    }, 300);

    // Listen for hash changes
    const handleHashChange = () => {
      handleHashScroll();
    };

    window.addEventListener('hashchange', handleHashChange);

    // Handle when pathname changes (for Next.js routing)
    if (pathname) {
      // Small delay to allow page content to render
      setTimeout(() => {
        handleHashScroll();
      }, 100);
    }

    return () => {
      clearTimeout(initialScrollTimeout);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [pathname, searchParams, isReady]);

  // Handle anchor clicks for smooth scrolling
  useEffect(() => {
    if (!isReady) return;

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.hash) {
        e.preventDefault();
        const targetId = link.hash.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          const headerOffset = 80; // Match the scroll-margin-top
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // Update URL without triggering page reload
          window.history.pushState(null, '', link.hash);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, [isReady]);

  return null;
}
