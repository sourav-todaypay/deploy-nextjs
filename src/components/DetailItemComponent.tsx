import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Copy } from 'lucide-react';

export interface DetailItem {
  label: string;
  value: React.ReactNode;
  copyable?: boolean;
  fullWidth?: boolean;
  halfWidth?: boolean;
  contentWidth?: boolean;
  forceFullWidth?: boolean;
}

export const DetailItemComponent = ({ item }: { item: DetailItem }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [copied, setCopied] = useState(false);

  const extractTextValue = (value: React.ReactNode): string => {
    if (React.isValidElement<{ children?: React.ReactNode }>(value)) {
      const children = value.props.children;
      return typeof children === 'string'
        ? children
        : Array.isArray(children)
          ? children.join(' ')
          : 'N/A';
    }
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value)
        .map(([key, val]) => `${key}: ${String(val)}`)
        .join(', ');
    }
    return String(value ?? 'N/A');
  };

  useEffect(() => {
    if (textRef.current && item.forceFullWidth) {
      const element = textRef.current;
      const hasOverflow =
        element.scrollWidth > element.clientWidth ||
        element.scrollHeight > element.clientHeight;
      setIsOverflowing(hasOverflow);
    }
  }, [item.value, item.forceFullWidth]);

  const getWidthClass = () => {
    if (item.fullWidth) return 'col-span-full';
    if (item.halfWidth) return 'lg:col-span-2';
    if (item.contentWidth) return 'w-max';
    if (item.forceFullWidth && isOverflowing) return 'col-span-full';
    return '';
  };

  const handleCopy = () => {
    if (copied) return;
    const textToCopy = extractTextValue(item.value);

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopied(true);
        toast.success('Copied to clipboard!', { position: 'top-right' });
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(() => toast.error('Failed to copy', { position: 'top-right' }));
  };

  return (
    <div
      className={`relative p-3 border border-gray-300 dark:!border-gray-700 rounded-lg transition-all duration-300 hover:shadow-md dark:hover:shadow-gray-700 cursor-pointer
        ${getWidthClass()}
        ${item.contentWidth ? 'min-w-[200px]' : ''}`}
    >
      <div className="text-sm font-semibold text-gray-500 dark:text-gray-300">
        {item.label}
      </div>
      <div
        ref={textRef}
        className={`text-md text-gray-900 dark:text-gray-100 break-words mt-1
          ${typeof item.value === 'string' ? 'whitespace-pre-line' : ''}
          ${item.contentWidth ? 'truncate hover:whitespace-normal' : ''}`}
      >
        {item.value || '-'}
      </div>

      {item.copyable && item.value && (
        <button
          onClick={handleCopy}
          disabled={copied}
          className="absolute top-3 right-3 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition duration-300"
        >
          <span className="transition duration-300">
            {copied ? 'Copied!' : ''}
          </span>
          {!copied && <Copy className="w-4 h-4 transition duration-300" />}
        </button>
      )}
    </div>
  );
};
