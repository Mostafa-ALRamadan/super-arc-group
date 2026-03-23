'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import type { OutputData, API } from '@editorjs/editorjs';

// Custom upload function with authentication
const uploadImageByFile = async (file: File) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  if (!token) {
    throw new Error('No authentication token available');
  }

  const formData = new FormData();
  formData.append('url', file); // Django backend expects 'url' for the file field
  
  // Generate alt text using filename (same as ImageUpload component)
  const altTextBase = file.name.split('.')[0] || 'Image';
  const altTextAr = file.name.split('.')[0] || 'صورة';
  
  formData.append('alt_en', altTextBase);
  formData.append('alt_ar', altTextAr);

  // Don't set a fixed caption - let the editor handle it based on content language
  // Store both captions in the file data for later use
  const captionText = altTextBase; // Default to English, will be overridden by editor

  const headers: HeadersInit = {
    'Authorization': `Bearer ${token}`,
  };
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/images/`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Return with locale-aware caption
    const imageUrl = data.url || data.image?.url;
    return {
      success: 1,
      file: {
        url: imageUrl,
        // Don't set caption here - let the editor handle content-specific captions
        // Store both alt texts for accessibility
        alt: altTextBase,
        alt_en: altTextBase,
        alt_ar: altTextAr,
      }
    };
  } catch (error) {
    throw error;
  }
};

const uploadImageByUrl = async (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  if (!token) {
    throw new Error('No authentication token available');
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/images/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return {
      success: 1,
      file: {
        url: data.url || data.image?.url,
      }
    };
  } catch (error) {
    throw error;
  }
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EditorImageUploadConfig {
  /** Endpoint to upload a file directly */
  byFile?: string;
  /** Endpoint to upload from a URL */
  byUrl?: string;
}

export interface EditorToolsConfig {
  paragraph?: boolean;
  header?: boolean;
  list?: boolean;
  quote?: boolean;
  code?: boolean;
  delimiter?: boolean;
  table?: boolean;
  /** Pass false to disable, or provide upload endpoint config */
  image?: false | EditorImageUploadConfig;
}

export interface EditorComponentProps {
  /** Initial EditorJS output data */
  data?: OutputData;
  /** Called on every content change with the latest saved output */
  onChange?: (data: OutputData) => void;
  /** Called when the editor is fully ready */
  onReady?: (api: API) => void;
  /** Placeholder shown in empty paragraph blocks */
  placeholder?: string;
  /** Text direction */
  dir?: 'ltr' | 'rtl';
  /** Which tools to enable (all enabled by default) */
  tools?: EditorToolsConfig;
  /** Whether to autofocus on mount */
  autofocus?: boolean;
  /** Min height of the editable area (CSS value) */
  minHeight?: string;
  /** Extra className applied to the outer wrapper */
  className?: string;
  /** Extra inline style applied to the outer wrapper */
  style?: React.CSSProperties;
  /** Disable editing */
  readOnly?: boolean;
}

// ─── Default tool endpoints ───────────────────────────────────────────────────

const DEFAULT_IMAGE_ENDPOINTS: EditorImageUploadConfig = {
  byFile: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/images/`,
  byUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/images/`,
};

// ─── Component ────────────────────────────────────────────────────────────────

const EditorComponent: React.FC<EditorComponentProps> = ({
  data,
  onChange,
  onReady,
  placeholder = 'Start writing…',
  dir = 'ltr',
  tools: toolsConfig = {},
  autofocus = true,
  minHeight = '120px',
  className,
  style,
  readOnly = false,
}) => {
  const holderRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const isUserEditingRef = useRef(false);
  const lastDataRef = useRef<any>(null);
  // Keep latest callbacks in refs so the stable effect closure can call them
  const onChangeRef = useRef(onChange);
  const onReadyRef  = useRef(onReady);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { onReadyRef.current  = onReady;  }, [onReady]);

  const handleChange = useCallback(async () => {
    if (!onChangeRef.current || !editorRef.current) return;
    try {
      isUserEditingRef.current = true;
      const saved: OutputData = await editorRef.current.save();
      onChangeRef.current(saved);
      // Reset user editing flag after a short delay
      setTimeout(() => {
        isUserEditingRef.current = false;
      }, 100);
    } catch (err) {
      // Error handling without console logging
    }
  }, []);

  useEffect(() => {
    if (!holderRef.current || editorRef.current) return;

    let destroyed = false;

    const init = async () => {
      try {
        const { default: EditorJS } = await import('@editorjs/editorjs');

        // ── Resolve which tools to load ──────────────────────────────────────
        const {
          paragraph  = true,
          header     = true,
          list       = true,
          quote      = true,
          code       = true,
          delimiter  = true,
          table      = true,
          image      = DEFAULT_IMAGE_ENDPOINTS,
        } = toolsConfig;

        const resolvedTools: Record<string, any> = {};

        if (paragraph) {
          const { default: Paragraph } = await import('@editorjs/paragraph');
          resolvedTools.paragraph = {
            class: Paragraph,
            inlineToolbar: true,
            config: { placeholder, preserveBlank: true },
          };
        }

        if (header) {
          const { default: Header } = await import('@editorjs/header');
          resolvedTools.header = {
            class: Header,
            inlineToolbar: true,
            config: {
              placeholder: 'Enter a heading',
              levels: [1, 2, 3, 4, 5, 6],
              defaultLevel: 2,
            },
          };
        }

        if (list) {
          const { default: List } = await import('@editorjs/list');
          resolvedTools.list = {
            class: List,
            inlineToolbar: true,
            config: { defaultStyle: 'unordered' },
          };
        }

        if (quote) {
          const { default: Quote } = await import('@editorjs/quote');
          resolvedTools.quote = {
            class: Quote,
            inlineToolbar: true,
            config: {
              quotePlaceholder: 'Enter a quote',
              captionPlaceholder: "Quote's author",
            },
          };
        }

        if (code) {
          const { default: Code } = await import('@editorjs/code');
          resolvedTools.code = {
            class: Code,
            config: { placeholder: 'Enter code' },
          };
        }

        if (delimiter) {
          const { default: Delimiter } = await import('@editorjs/delimiter');
          resolvedTools.delimiter = Delimiter;
        }

        if (table) {
          const { default: Table } = await import('@editorjs/table');
          resolvedTools.table = {
            class: Table,
            inlineToolbar: true,
            config: { rows: 2, cols: 3 },
          };
        }

        if (image !== false) {
          const { default: Image } = await import('@editorjs/image');
          resolvedTools.image = {
            class: Image,
            config: {
              uploader: {
                uploadByFile: uploadImageByFile,
                uploadByUrl: uploadImageByUrl,
              },
            },
          };
        }

        // ── Guard: component may have unmounted while awaiting imports ────────
        if (destroyed || !holderRef.current) return;

        // ── Create editor instance ────────────────────────────────────────────
        const editor = new EditorJS({
          holder: holderRef.current,
          data: data ?? { blocks: [{ type: 'paragraph', data: { text: '' } }] },
          placeholder,
          readOnly,
          autofocus,
          i18n: { direction: dir === 'rtl' ? 'rtl' : 'ltr' },
          tools: resolvedTools,
          onChange: handleChange,
          onReady: () => {
            onReadyRef.current?.(editorRef.current);
          },
        });

        editorRef.current = editor;
      } catch (err) {
        // Error handling without console logging
      }
    };

    init();

    return () => {
      destroyed = true;
      if (editorRef.current) {
        // destroy() is async in some versions; ignore the promise
        try { editorRef.current.destroy(); } catch (_) {}
        editorRef.current = null;
      }
    };
    // Intentionally run once on mount; prop changes are handled via refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update editor data when data prop changes
  useEffect(() => {
    if (data && !isUserEditingRef.current) {
      // Check if data actually changed (not just a re-render)
      const dataStr = JSON.stringify(data);
      if (dataStr === lastDataRef.current) {
        return; // No actual change, don't re-render
      }
      lastDataRef.current = dataStr;
      
      // Wait a bit for the editor to be ready
      const tryRender = () => {
        if (editorRef.current && typeof editorRef.current.render === 'function') {
          try {
            editorRef.current.render(data);
          } catch (err) {
            // Error handling without console logging
          }
        } else if (editorRef.current && typeof editorRef.current.configuration !== 'undefined') {
          // Editor is ready but render method might not be available, try using clear and load
          try {
            editorRef.current.clear();
            // Use the blocks directly if render is not available
            if (data.blocks && data.blocks.length > 0) {
              data.blocks.forEach((block: any) => {
                editorRef.current.blocks.insert(block.type, block.data);
              });
            }
          } catch (err) {
            // Error handling without console logging
          }
        } else {
          // Try again after a short delay
          setTimeout(tryRender, 100);
        }
      };
      
      // Start trying to render
      setTimeout(tryRender, 100);
    }
  }, [data]);

  return (
    <div
      className={className}
      style={{
        borderRadius: '0.5rem',
        padding: '8px',
        minHeight,
        direction: dir,
        ...style,
      }}
    >
      <div
        ref={holderRef}
        style={{
          minHeight,
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          backgroundColor: 'white',
          padding: '12px',
          textAlign: dir === 'rtl' ? 'right' : 'left',
        }}
      />
    </div>
  );
};

export default EditorComponent;