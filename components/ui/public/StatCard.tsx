'use client';

import { useState } from 'react';

interface StatCardProps {
  number: string;
  label: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function StatCard({ number, label, className = '', style }: StatCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-700 ${className}`}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="article"
      aria-label={`${number}: ${label}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setIsHovered(!isHovered);
        }
      }}
    >
      {/* Glassmorphism card */}
      <div className={`relative backdrop-blur-xl bg-white/80 rounded-3xl p-8 border border-white/20 shadow-xl transition-all duration-700 ${
        isHovered ? 'transform scale-105 shadow-2xl bg-white/90' : ''
      }`}>
        
        {/* Animated background gradient */}
        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/10 to-primary-dark/10 transition-opacity duration-700 ${
          isHovered ? 'opacity-100' : 'opacity-50'
        }`}></div>
        
        {/* Floating orb decoration */}
        <div className={`absolute top-4 right-4 w-16 h-16 rounded-full transition-all duration-700 ${
          isHovered 
            ? 'bg-gradient-to-br from-primary to-primary-dark scale-100 opacity-30' 
            : 'bg-gradient-to-br from-primary to-primary-dark scale-75 opacity-20'
        }`}></div>
        
        {/* Content */}
        <div className="relative z-10 space-y-6">
          {/* Number with animated background */}
          <div className="relative text-center">
            <div className={`absolute inset-0 bg-gradient-to-br from-primary to-primary-dark rounded-2xl blur-xl transition-all duration-700 ${
              isHovered ? 'opacity-30 scale-110' : 'opacity-20 scale-100'
            }`}></div>
            <div className="relative">
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary-dark to-primary leading-none">
                {number}
              </div>
              {/* Animated underline */}
              <div className={`h-1 bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-700 mt-2 ${
                isHovered ? 'w-full scale-100' : 'w-0 scale-0'
              }`}></div>
            </div>
          </div>
          
          {/* Animated divider */}
          <div className={`relative h-px transition-all duration-700 ${
            isHovered ? 'bg-gradient-to-r from-transparent via-primary-light to-transparent' : 'bg-neutral-200'
          }`}>
            <div className={`absolute inset-0 bg-gradient-to-r from-primary to-primary-dark transition-all duration-700 ${
              isHovered ? 'scale-x-100' : 'scale-x-0'
            }`}></div>
          </div>
          
          {/* Label with hover effect */}
          <div className="relative text-center">
            <h3 className={`text-xl font-bold text-main leading-relaxed transition-all duration-700 ${
              isHovered ? 'text-main' : ''
            }`}>
              {label}
            </h3>
            {/* Subtle text shadow on hover */}
            <div className={`absolute inset-0 text-transparent transition-all duration-700 ${
              isHovered ? 'drop-shadow-lg' : ''
            }`}>
              {label}
            </div>
          </div>
        </div>
        
        {/* Corner accents */}
        <div className={`absolute top-2 left-2 w-4 h-4 rounded-full bg-gradient-to-br from-primary to-primary-dark transition-all duration-700 ${
          isHovered ? 'scale-150 opacity-60' : 'scale-100 opacity-30'
        }`}></div>
        <div className={`absolute bottom-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br from-primary to-primary-dark transition-all duration-700 ${
          isHovered ? 'scale-150 opacity-60' : 'scale-100 opacity-30'
        }`}></div>
        
        {/* Hover glow effect */}
        <div className={`absolute inset-0 rounded-3xl transition-all duration-700 pointer-events-none ${
          isHovered 
            ? 'shadow-2xl shadow-primary/20' 
            : 'shadow-lg shadow-neutral-200/50'
        }`}></div>
      </div>
      
      {/* Floating particles animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <div className={`absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full transition-all duration-1000 ${
          isHovered ? 'translate-y-2 opacity-60' : 'translate-y-0 opacity-0'
        }`}></div>
        <div className={`absolute top-3/4 right-1/4 w-1 h-1 bg-primary-dark rounded-full transition-all duration-1000 delay-100 ${
          isHovered ? 'translate-y-2 opacity-60' : 'translate-y-0 opacity-0'
        }`}></div>
        <div className={`absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-primary rounded-full transition-all duration-1000 delay-200 ${
          isHovered ? 'translate-y-2 opacity-60' : 'translate-y-0 opacity-0'
        }`}></div>
      </div>
    </div>
  );
}
