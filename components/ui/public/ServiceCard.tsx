'use client';

import { useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function ServiceCard({ 
  icon: Icon, 
  title, 
  description, 
  disabled = false,
  className = '', 
  style 
}: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <article
        className={`group relative bg-gradient-to-br from-white to-[#DAA424]/5 rounded-2xl border border-[#DAA424]/30 p-8 transition-all duration-500 cursor-pointer overflow-hidden ${
          isHovered ? 'border-[#DAA424] shadow-2xl -translate-y-2 ring-2 ring-[#DAA424]/20' : 'shadow-lg'
        } ${disabled ? 'cursor-default' : ''} ${className}`}
        style={style}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => !disabled && setIsHovered(false)}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={`${title}: ${description}`}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
          }
        }}
      >
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br from-[#DAA424]/10 via-[#DAA424]/5 to-[#B8891F]/10 rounded-2xl transition-all duration-500 ${
          isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-95'
        }`}></div>

        {/* Floating particles that appear on hover */}
        <div className={`absolute inset-0 transition-all duration-700 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="absolute top-8 right-8 w-2 h-2 bg-[#DAA424]/60 rounded-full animate-pulse"></div>
          <div className="absolute bottom-8 left-8 w-3 h-3 bg-[#B8891F]/60 rounded-full animate-pulse delay-100"></div>
          <div className="absolute top-1/2 right-6 w-1.5 h-1.5 bg-[#E5B84D]/60 rounded-full animate-pulse delay-200"></div>
        </div>

        {/* Centered Content */}
        <div className="relative flex flex-col items-center text-center space-y-6">
          {/* Icon Container with cool animation */}
          <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#DAA424]/20 to-[#E5B84D]/20 flex items-center justify-center transition-all duration-500 ${
            isHovered 
              ? 'scale-110 rotate-12 shadow-xl bg-gradient-to-br from-[#DAA424] via-[#E5B84D] to-[#B8891F]' 
              : ''
          }`}>
            {/* Rotating ring on hover */}
            <div className={`absolute inset-0 rounded-2xl border-2 border-[#DAA424]/30 transition-all duration-500 ${
              isHovered ? 'scale-110 opacity-100' : 'scale-100 opacity-0'
            }`} style={{ 
              animationDuration: '3s',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear',
              animationName: isHovered ? 'spin' : 'none'
            }}></div>
            
            <Icon className={`relative w-10 h-10 text-primary transition-all duration-500 z-10 ${
              isHovered ? 'text-white scale-110' : ''
            }`} />
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h3 className={`text-xl font-bold text-main leading-tight transition-all duration-500 ${
              isHovered ? 'text-primary scale-105' : ''
            }`}>
              {title}
            </h3>
            
            <p className="text-muted leading-relaxed text-sm max-w-xs">
              {description}
            </p>
          </div>
        </div>

        {/* Cool side lines that grow from edges */}
        <div className={`absolute top-1/2 left-0 w-8 h-0.5 bg-gradient-to-r from-[#DAA424] to-transparent transition-all duration-500 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
        }`}></div>
        
        <div className={`absolute top-1/2 right-0 w-8 h-0.5 bg-gradient-to-l from-[#DAA424] to-transparent transition-all duration-500 delay-100 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
        }`}></div>

        {/* Top and bottom accent lines */}
        <div className={`absolute top-0 left-1/2 right-1/2 h-0.5 bg-gradient-to-r from-transparent via-[#DAA424] to-transparent transition-all duration-500 ${
          isHovered ? 'opacity-100 scale-x-100 -translate-x-1/2' : 'opacity-0 scale-x-0 -translate-x-1/2'
        }`}></div>
        
        <div className={`absolute bottom-0 left-1/2 right-1/2 h-0.5 bg-gradient-to-r from-transparent via-[#DAA424] to-transparent transition-all duration-500 delay-100 ${
          isHovered ? 'opacity-100 scale-x-100 -translate-x-1/2' : 'opacity-0 scale-x-0 -translate-x-1/2'
        }`}></div>

        {/* Corner dots that appear on hover */}
        <div className={`absolute top-4 left-4 w-2 h-2 bg-[#DAA424] rounded-full transition-all duration-500 delay-200 ${
          isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        }`}></div>
        
        <div className={`absolute top-4 right-4 w-2 h-2 bg-[#DAA424] rounded-full transition-all duration-500 delay-300 ${
          isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        }`}></div>
        
        <div className={`absolute bottom-4 left-4 w-2 h-2 bg-[#B8891F] rounded-full transition-all duration-500 delay-400 ${
          isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        }`}></div>
        
        <div className={`absolute bottom-4 right-4 w-2 h-2 bg-[#DAA424] rounded-full transition-all duration-500 delay-500 ${
          isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        }`}></div>
      </article>
      
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
