import { Spinner } from '@/components/Spinner';
import { useState } from 'react';
import { DetailItem, DetailItemComponent } from './DetailItemComponent';
import React from 'react';
import toast from 'react-hot-toast';
import { Copy } from 'lucide-react';

interface DetailsPageProps {
  details: DetailItem[];
  isLoading: boolean;
}

export default function DetailsPage({ details, isLoading }: DetailsPageProps) {
  const [copiedAll, setCopiedAll] = useState(false);

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

  const handleCopyAll = () => {
    if (copiedAll) return;

    const textToCopy = details
      .map(item => `${item.label}: ${extractTextValue(item.value)}`)
      .join('\n');

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopiedAll(true);
        toast.success('Copied to clipboard!', { position: 'top-right' });
        setTimeout(() => setCopiedAll(false), 3000);
      })
      .catch(() => toast.error('Failed to copy', { position: 'top-right' }));
  };

  if (isLoading) {
    return <Spinner className="mt-20" />;
  }

  if (!details.length) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        No details available
      </div>
    );
  }

  return (
    <div className="bg-white dark:!bg-gray-800 rounded-lg shadow-md p-6 relative mt-4 mb-4">
      <button
        onClick={handleCopyAll}
        disabled={copiedAll}
        className="absolute top-3 right-4 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition duration-300 sm:right-6"
      >
        <span className="transition duration-300">
          {copiedAll ? 'Copied!' : 'Copy'}
        </span>
        <Copy className="w-4 h-4 transition duration-300" />
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 max-w-6xl mx-auto gap-6 mt-8">
        {details.map((item, index) => (
          <DetailItemComponent key={index} item={item} />
        ))}
      </div>
    </div>
  );
}
