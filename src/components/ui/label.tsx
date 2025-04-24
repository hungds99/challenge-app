import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label
        className={cn('text-sm font-medium text-gray-700 block', className)}
        ref={ref}
        {...props}
      >
        {children}
        {required && <span className='text-red-500 ml-1'>*</span>}
      </label>
    );
  },
);
Label.displayName = 'Label';

export { Label };
