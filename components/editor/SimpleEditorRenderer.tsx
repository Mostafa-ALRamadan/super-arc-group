'use client';

import React from 'react';

// Editor.js block types
interface EditorBlock {
  id?: string;
  type: string;
  data: any;
}

interface EditorData {
  time: number;
  blocks: EditorBlock[];
  version: string;
}

// Props for the renderer component
interface EditorRendererProps {
  blocks: EditorBlock[];
  className?: string;
  locale?: 'en' | 'ar';
}

// Individual block components
const ParagraphBlock: React.FC<{ data: { text: string }; locale?: 'en' | 'ar' }> = ({ data, locale }) => {
  const isRTL = locale === 'ar';
  const textDirection = isRTL ? 'text-right' : 'text-left';
  
  return (
    <p 
      className={`text-gray-700 leading-relaxed mb-8 text-lg lg:text-xl font-light animate-fade-in bg-white/40 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 ${textDirection}`}
      dangerouslySetInnerHTML={{ __html: data.text }}
      dir={isRTL ? 'rtl' : 'ltr'}
    />
  );
};

const HeaderBlock: React.FC<{ data: { text: string; level: number }; locale?: 'en' | 'ar' }> = ({ data, locale }) => {
  const { text, level } = data;
  const isRTL = locale === 'ar';
  const textDirection = isRTL ? 'text-right' : 'text-left';
  const baseClasses = `font-bold mb-8 leading-tight animate-fade-in bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 text-gray-900 ${textDirection}`;
  const borderClasses = isRTL ? 'border-r-4 pr-4' : 'border-l-4 pl-4';
  
  switch (level) {
    case 1:
      return (
        <h1 className={`${baseClasses} text-4xl md:text-5xl lg:text-6xl border-primary/30 ${borderClasses}`} dangerouslySetInnerHTML={{ __html: text }} dir={isRTL ? 'rtl' : 'ltr'} />
      );
    case 2:
      return (
        <h2 className={`${baseClasses} text-3xl md:text-4xl lg:text-5xl border-primary/20 ${borderClasses}`} dangerouslySetInnerHTML={{ __html: text }} dir={isRTL ? 'rtl' : 'ltr'} />
      );
    case 3:
      return (
        <h3 className={`${baseClasses} text-2xl md:text-3xl lg:text-4xl border-primary/15 ${borderClasses}`} dangerouslySetInnerHTML={{ __html: text }} dir={isRTL ? 'rtl' : 'ltr'} />
      );
    case 4:
      return (
        <h4 className={`${baseClasses} text-xl md:text-2xl border-primary/10 ${borderClasses}`} dangerouslySetInnerHTML={{ __html: text }} dir={isRTL ? 'rtl' : 'ltr'} />
      );
    case 5:
      return (
        <h5 className={`${baseClasses} text-lg md:text-xl border-primary/10 ${borderClasses}`} dangerouslySetInnerHTML={{ __html: text }} dir={isRTL ? 'rtl' : 'ltr'} />
      );
    case 6:
      return (
        <h6 className={`${baseClasses} text-base md:text-lg border-primary/10 ${borderClasses}`} dangerouslySetInnerHTML={{ __html: text }} dir={isRTL ? 'rtl' : 'ltr'} />
      );
    default:
      return (
        <h2 className={`${baseClasses} text-3xl md:text-4xl border-primary/20 ${borderClasses}`} dangerouslySetInnerHTML={{ __html: text }} dir={isRTL ? 'rtl' : 'ltr'} />
      );
  }
};

const ImageBlock: React.FC<{ data: { file: { url: string }; caption?: string; withBorder?: boolean; withBackground?: boolean; stretched?: boolean } }> = ({ data }) => {
  const { file, caption, withBorder, withBackground, stretched } = data;
  
  if (caption) {
    // Render with figure and figcaption for proper semantics when caption exists
    return (
      <figure className="mb-8 animate-fade-in bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
        <div className={`relative overflow-hidden rounded-lg ${stretched ? 'w-full' : 'max-w-md mx-auto'}`}>
          <img 
            src={file.url} 
            alt={caption}
            className={`w-full h-auto object-contain rounded-lg ${withBorder ? 'border-2 border-primary/20' : ''} ${withBackground ? 'p-3 bg-gradient-to-br from-primary/5 to-primary/10' : ''}`}
            loading="lazy"
          />
        </div>
        <figcaption className="text-gray-600 text-sm mt-4 text-center italic font-medium">
          {caption}
        </figcaption>
      </figure>
    );
  }

  // Render simple image without figure when no caption
  return (
    <div className="mb-8 animate-fade-in bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className={`relative overflow-hidden rounded-lg ${stretched ? 'w-full' : 'max-w-md mx-auto'}`}>
        <img 
          src={file.url} 
          alt=""
          className={`w-full h-auto object-contain rounded-lg ${withBorder ? 'border-2 border-primary/20' : ''} ${withBackground ? 'p-3 bg-gradient-to-br from-primary/5 to-primary/10' : ''}`}
          loading="lazy"
        />
      </div>
    </div>
  );
};

const ListBlock: React.FC<{ data: { style: 'ordered' | 'unordered'; items: any[] }; locale?: 'en' | 'ar' }> = ({ data, locale }) => {
  const { style, items } = data;
  const isRTL = locale === 'ar';
  const textDirection = isRTL ? 'text-right' : 'text-left';
  const ListComponent = style === 'ordered' ? 'ol' : 'ul';
  const borderClasses = isRTL ? 'border-r-4 pr-8' : 'border-l-4 pl-8';
  const listClasses = style === 'ordered' 
    ? `list-decimal list-inside mb-10 space-y-4 pl-6 ${borderClasses}`
    : `list-disc list-inside mb-10 space-y-4 pl-6 ${borderClasses}`;

  return (
    <div className="mb-10 animate-fade-in bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <ListComponent className={`${listClasses} ${textDirection}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {items.map((item, index) => {
          // Handle different item structures from Editor.js
          let itemContent = '';
          if (typeof item === 'string') {
            itemContent = item;
          } else if (item && typeof item === 'object') {
            itemContent = item.content || item.text || '';
          }
          
          return (
            <li 
              key={index}
              className="text-gray-700 leading-relaxed text-lg lg:text-xl font-light relative animate-fade-in hover:text-primary transition-colors duration-200"
              dangerouslySetInnerHTML={{ __html: itemContent }}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          );
        })}
      </ListComponent>
    </div>
  );
};

const CheckListBlock: React.FC<{ data: { items: any[] }; locale?: 'en' | 'ar' }> = ({ data, locale }) => {
  const { items } = data;
  const isRTL = locale === 'ar';
  const textDirection = isRTL ? 'text-right' : 'text-left';
  const spacingClasses = isRTL ? 'space-x-reverse space-x-4' : 'space-x-4';

  return (
    <div className="mb-10 animate-fade-in bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="space-y-4">
        {items.map((item, index) => {
          let itemContent = '';
          let isChecked = false;
          
          if (typeof item === 'string') {
            itemContent = item;
            isChecked = false;
          } else if (item && typeof item === 'object') {
            itemContent = item.content || item.text || '';
            isChecked = item.checked || false;
          }
          
          return (
            <div key={index} className={`flex items-start ${spacingClasses} group hover:bg-white/50 p-3 rounded-lg transition-all duration-200`}>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isChecked}
                  readOnly
                  className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2 cursor-pointer"
                />
                {isChecked && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <span 
                className={`text-gray-700 leading-relaxed text-lg lg:text-xl font-light flex-1 ${textDirection}`}
                dangerouslySetInnerHTML={{ __html: itemContent }}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CodeBlock: React.FC<{ data: { code: string; language?: string } }> = ({ data }) => {
  const { code, language } = data;

  return (
    <div className="my-10 animate-fade-in bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        {language && (
          <div className="bg-gray-800/50 px-6 py-3 border-b border-gray-700 flex items-center justify-between">
            <div className="text-xs text-primary font-mono uppercase tracking-wider font-semibold">
              {language}
            </div>
            <button 
              onClick={() => navigator.clipboard.writeText(code)}
              className="text-gray-400 hover:text-white transition-colors duration-200 text-xs font-mono"
            >
              Copy Code
            </button>
          </div>
        )}
        <div className="p-6 overflow-x-auto">
          <pre className="text-sm lg:text-base font-mono leading-relaxed">
            <code className="text-gray-100">{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

const TableBlock: React.FC<{ data: { content: any[][]; withHeadings?: boolean }; locale?: 'en' | 'ar' }> = ({ data, locale }) => {
  const { content, withHeadings = true } = data;
  const isRTL = locale === 'ar';

  if (!content || !Array.isArray(content) || content.length === 0) {
    return null;
  }

  const textAlignClass = isRTL ? 'text-right' : 'text-left';
  const cornerClasses = isRTL ? 'first:rounded-tr-xl last:rounded-tl-xl' : 'first:rounded-tl-xl last:rounded-tr-xl';

  return (
    <div className="my-10 animate-fade-in overflow-x-auto">
      <div className="inline-block min-w-full">
        <table className="min-w-full border-separate border-spacing-0 rounded-xl overflow-hidden shadow-lg border border-gray-200">
          <thead>
            {withHeadings && content[0] && (
              <tr className="bg-gradient-to-r from-primary/10 to-primary/5">
                {content[0].map((cell, cellIndex) => {
                  const cellContent = typeof cell === 'object' ? cell.content || cell.text || '' : cell;
                  
                  return (
                    <th
                      key={cellIndex}
                      className={`border-b border-gray-200 px-6 py-4 ${textAlignClass} text-sm font-semibold text-gray-900 ${cornerClasses}`}
                      dangerouslySetInnerHTML={{ __html: cellContent }}
                    />
                  );
                })}
              </tr>
            )}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(withHeadings ? content.slice(1) : content).map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors duration-200">
                {row.map((cell, cellIndex) => {
                  const cellContent = typeof cell === 'object' ? cell.content || cell.text || '' : cell;
                  
                  return (
                    <td
                      key={cellIndex}
                      className={`px-6 py-4 text-sm text-gray-700 border-b border-gray-100 last:border-r-0 ${textAlignClass}`}
                      dangerouslySetInnerHTML={{ __html: cellContent }}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Warning component for unknown block types

const QuoteBlock: React.FC<{ data: { text: string; caption: string; alignment?: 'left' | 'center' }; locale?: 'en' | 'ar' }> = ({ data, locale }) => {
  const { text, caption, alignment = 'left' } = data;
  const isRTL = locale === 'ar';
  
  const alignmentClasses = {
    left: isRTL ? 'text-right' : 'text-left',
    center: 'text-center',
  };

  const borderClasses = isRTL ? 'border-r-4 rounded-l-2xl' : 'border-l-4 rounded-r-2xl';

  return (
    <blockquote className={`my-12 p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent ${borderClasses} border-primary ${alignmentClasses[alignment]} animate-fade-in`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative">
        <div className={`absolute -top-4 ${isRTL ? '-right-2' : '-left-2'} text-6xl text-primary/20 font-serif`}>"</div>
        <p 
          className="text-gray-800 text-xl md:text-2xl font-light italic leading-relaxed mb-4 relative z-10"
          dangerouslySetInnerHTML={{ __html: text }}
        />
        {caption && (
          <cite className="text-gray-600 text-lg font-medium not-italic">
            — {caption}
          </cite>
        )}
      </div>
    </blockquote>
  );
};

const DelimiterBlock: React.FC = () => {
  return (
    <div className="my-16 flex items-center justify-center animate-fade-in">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      <div className="mx-8 flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center shadow-sm">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary-dark rounded-full shadow-sm"></div>
          </div>
          <div className="absolute inset-0 w-12 h-12 bg-primary/20 rounded-full animate-ping"></div>
        </div>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
    </div>
  );
};

// Enhanced warning block for alerts and notices
const WarningBlock: React.FC<{ data: { message: string; type?: 'info' | 'warning' | 'danger' | 'success' } }> = ({ data }) => {
  const { message, type = 'info' } = data;
  
  const typeStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  };
  
  const icons = {
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    danger: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };
  
  return (
    <div className={`mb-8 p-6 border-l-4 rounded-r-xl ${typeStyles[type]} animate-fade-in`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className="font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: message }} />
        </div>
      </div>
    </div>
  );
};

// Embed block for videos and external content
const EmbedBlock: React.FC<{ data: { embed: string; caption?: string } }> = ({ data }) => {
  const { embed, caption } = data;
  
  return (
    <div className="mb-8 animate-fade-in">
      <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
        <div 
          className="bg-gray-100"
          dangerouslySetInnerHTML={{ __html: embed }}
        />
      </div>
      {caption && (
        <p className="text-gray-600 text-sm mt-3 text-center italic font-medium">
          {caption}
        </p>
      )}
    </div>
  );
};

// Raw HTML block for custom content
const RawBlock: React.FC<{ data: { html: string } }> = ({ data }) => {
  const { html } = data;
  
  return (
    <div className="mb-8 animate-fade-in">
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

// Warning component for unknown block types
const UnknownBlock: React.FC<{ type: string }> = ({ type }) => {
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl shadow-sm animate-fade-in">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-amber-800 font-semibold text-sm mb-1">Unknown Block Type</h4>
            <p className="text-amber-700 text-sm">
              The block type <code className="bg-amber-100 px-2 py-1 rounded font-mono text-amber-900">{type}</code> is not recognized by the editor renderer.
            </p>
            <p className="text-amber-600 text-xs mt-2">
              This warning only appears in development mode.
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Main renderer component
const EditorRenderer: React.FC<EditorRendererProps> = ({ blocks, className = '', locale }) => {
  if (!blocks || !Array.isArray(blocks)) {
    return null;
  }

  const renderBlock = (block: EditorBlock, index: number) => {
    const { type, data } = block;
    const key = block.id || `${type}-${index}`;

    switch (type) {
      case 'paragraph':
        return <ParagraphBlock key={key} data={data} locale={locale} />;
      
      case 'header':
        return <HeaderBlock key={key} data={data} locale={locale} />;
      
      case 'image':
        return <ImageBlock key={key} data={data} />;
      
      case 'list':
        return <ListBlock key={key} data={data} locale={locale} />;
      
      case 'checklist':
        return <CheckListBlock key={key} data={data} locale={locale} />;
      
      case 'quote':
        return <QuoteBlock key={key} data={data} locale={locale} />;
      
      case 'delimiter':
        return <DelimiterBlock key={key} />;
      
      case 'code':
        return <CodeBlock key={key} data={data} />;
      
      case 'table':
        return <TableBlock key={key} data={data} locale={locale} />;
      
      case 'warning':
        return <WarningBlock key={key} data={data} />;
      
      case 'embed':
        return <EmbedBlock key={key} data={data} />;
      
      case 'raw':
        return <RawBlock key={key} data={data} />;
      
      default:
        return <UnknownBlock key={key} type={type} />;
    }
  };

  return (
    <div className={`editor-renderer max-w-4xl mx-auto ${className}`}>
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
};

export default EditorRenderer;

// Export types for external use
export type { EditorBlock, EditorData, EditorRendererProps };
