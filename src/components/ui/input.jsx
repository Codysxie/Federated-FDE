import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50',
        type === 'file' &&
          'p-0 pr-3 italic text-gray-400 file:me-3 file:h-full file:border-0 file:border-r file:border-solid file:border-gray-300 file:bg-transparent file:px-3 file:text-sm file:font-medium file:not-italic file:text-gray-700',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
