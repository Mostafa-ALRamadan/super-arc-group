import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'huge';
  className?: string;
  priority?: boolean;
  variant?: 'default' | 'light';
  showBackground?: boolean;
}

export default function Logo({ size = 'md', className = '', priority = false, variant = 'default', showBackground = false }: LogoProps) {
  const sizeMap = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
    xl: { width: 96, height: 96 },
    xxl: { width: 128, height: 128 },
    xxxl: { width: 160, height: 160 },
    huge: { width: 200, height: 200 }
  };

  const { width, height } = sizeMap[size];

  // Background styling for transparent header
  const backgroundClass = showBackground ? 'bg-white/90 backdrop-blur-sm rounded-lg p-2' : '';

  return (
    <div className={`relative ${className}`}>
      <div className={`inline-flex items-center justify-center ${backgroundClass}`}>
        {/* Use SVG logo if available, otherwise fallback to PNG */}
        <img
          src="/logo.svg"
          alt="Super Arc Group Logo"
          width={width}
          height={height}
          className="object-contain"
          // Fallback for browsers that don't support SVG well
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/favicon/android-chrome-512x512.png';
          }}
        />
      </div>
    </div>
  );
}
