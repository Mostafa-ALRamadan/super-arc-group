'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { companiesService } from '../../src/services/entities/companies.service';
import Logo from '../brand/Logo';

const translations = {
  en: {
    companyDescription: 'Super Arc Group is a multidisciplinary organization delivering engineering, construction, and consulting services across multiple sectors.',
    quickLinks: 'Quick Links',
    ourCompanies: 'Our Companies',
    contact: 'Contact',
    home: 'Home',
    about: 'About',
    companies: 'Companies',
    services: 'Services',
    projects: 'Projects',
    blog: 'Blog',
    contactNav: 'Contact',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    allRightsReserved: '© 2026 Super Arc Group. All rights reserved.'
  },
  ar: {
    companyDescription: 'مجموعة سوبر آرك هي منظمة متعددة التخصصات تقدم خدمات الهندسة والإنشاءات والاستشارات عبر قطاعات متعددة.',
    quickLinks: 'روابط سريعة',
    ourCompanies: 'شركاتنا',
    contact: 'اتصل بنا',
    home: 'الرئيسية',
    about: 'من نحن',
    companies: 'الشركات',
    services: 'الخدمات',
    projects: 'المشاريع',
    blog: 'المدونة',
    contactNav: 'اتصل بنا',
    privacyPolicy: 'سياسة الخصوصية',
    termsOfService: 'شروط الخدمة',
    allRightsReserved: '© 2026 مجموعة سوبر آرك. جميع الحقوق محفوظة.'
  }
};

// Social media links
const socialLinks = [
  { name: 'LinkedIn', icon: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z', href: '#' },
  { name: 'X', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z', href: '#' },
  { name: 'Facebook', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', href: '#' },
  { name: 'Instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z', href: '#' }
];

export default function Footer() {
  const [locale, setLocale] = useState<'en' | 'ar'>('en');
  const [mounted, setMounted] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const router = useRouter();
  const isRTL = locale === 'ar';
  const t = translations[locale];

  useEffect(() => {
    setMounted(true);
    const pathname = window.location.pathname;
    
    if (pathname.startsWith('/ar')) {
      setLocale('ar');
    } else if (pathname.startsWith('/en')) {
      setLocale('en');
    } else {
      setLocale('en');
    }
  }, []);

  useEffect(() => {
    // Fetch companies when component mounts
    const fetchCompanies = async () => {
      try {
        // Use the public method to fetch published companies (no authentication required)
        const companiesData = await companiesService.getPublishedCompanies();
        setCompanies(companiesData);
      } catch (error) {
        console.error('Error fetching companies for footer:', error);
      }
    };

    if (mounted) {
      fetchCompanies();
    }
  }, [mounted]);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!mounted) {
    return null;
  }

  const quickLinks = [
    { id: 'home', label: t.home, href: '/' },
    { id: 'about', label: t.about, href: '/#about' },
    { id: 'companies', label: t.companies, href: '/#companies' },
    { id: 'services', label: t.services, href: '/#services' },
    { id: 'projects', label: t.projects, href: '/#projects' },
    { id: 'blog', label: t.blog, href: '/blog' },
    { id: 'contact', label: t.contactNav, href: '/#contact' }
  ];

  return (
    <footer style={{ backgroundColor: '#1F5142' }} className="text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Column 1 - Company Information */}
          <div className={`${isRTL ? 'lg:order-last' : ''}`}>
            {/* Company Logo */}
            <div className="mb-6">
              <Link href={`/${locale}`} className="inline-block">
                <div className="bg-white p-3 rounded-lg inline-block">
                  <Logo size="huge" className="flex-shrink-0" />
                </div>
              </Link>
            </div>
            
            {/* Company Description */}
            <p className="text-white/90 leading-relaxed mb-6">
              {t.companyDescription}
            </p>
            
            {/* Social Media Icons */}
            <div className={`flex ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:text-secondary group"
                  aria-label={social.name}
                >
                  <svg className="w-5 h-5 group-hover:fill-[#FFD700] transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">{t.quickLinks}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      if (link.href.startsWith('/#')) {
                        handleSmoothScroll(e, link.href.replace('/#', ''));
                      }
                    }}
                    className="text-white/80 hover:text-secondary transition-colors duration-300 relative group"
                  >
                    {link.label}
                    <span className={`absolute bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full`}></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Our Companies */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">{t.ourCompanies}</h3>
            <ul className="space-y-3">
              {companies.map((company) => {
                // Helper function to get localized company name
                const getCompanyName = (company: any, locale: string): string => {
                  if (typeof company.name === 'string') {
                    return company.name;
                  }
                  if (company.name && typeof company.name === 'object' && 'en' in company.name && 'ar' in company.name) {
                    return locale === 'ar' ? company.name.ar : company.name.en;
                  }
                  return company.name || 'Unknown Company';
                };

                return (
                  <li key={company.id}>
                    <Link
                      href={`/${locale}/companies/${company.slug}`}
                      className="text-white/80 hover:text-secondary transition-colors duration-300 relative group"
                    >
                      {getCompanyName(company, locale)}
                      <span className={`absolute bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full`}></span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 4 - Contact Information */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">{t.contact}</h3>
            <div className="space-y-4">
              {/* Address */}
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-muted">Dubai, United Arab Emirates</span>
              </div>
              
              {/* Phone */}
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+971000000000" className="text-white/80 hover:text-secondary transition-colors duration-300">
                  +971 00 000 0000
                </a>
              </div>
              
              {/* Email */}
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:info@superarcgroup.com" className="text-white/80 hover:text-secondary transition-colors duration-300">
                  info@superarcgroup.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="border-t border-text-main/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Copyright */}
            <div className="text-muted text-sm">
              {t.allRightsReserved}
            </div>
            
            {/* Legal Links */}
            <div className={`flex ${isRTL ? 'space-x-reverse space-x-6' : 'space-x-6'}`}>
              <a
                href={`/${locale}/privacy-policy`}
                className="text-white/80 hover:text-secondary transition-colors duration-300 text-sm relative group"
              >
                {t.privacyPolicy}
                <span className={`absolute bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full`}></span>
              </a>
              <a
                href={`/${locale}/terms-of-service`}
                className="text-white/80 hover:text-secondary transition-colors duration-300 text-sm relative group"
              >
                {t.termsOfService}
                <span className={`absolute bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full`}></span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
