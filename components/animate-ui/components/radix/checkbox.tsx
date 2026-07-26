'use client';

import * as React from 'react';

import {
  Checkbox as CheckboxPrimitive,
  CheckboxIndicator as CheckboxIndicatorPrimitive,
  type CheckboxProps as CheckboxPrimitiveProps,
} from '@/components/animate-ui/primitives/radix/checkbox';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const checkboxVariants = cva(
  'peer shrink-0 flex items-center justify-center outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-500 focus-visible:ring-offset-2 [&[data-state=checked],&[data-state=indeterminate]]:bg-primary [&[data-state=checked],&[data-state=indeterminate]]:text-primary-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background border border-primary',
        accent: 'bg-input border border-input',
      },
      size: {
        default: 'size-4 rounded-sm',
        sm: 'size-3.5 rounded-[4px]',
        lg: 'size-5 rounded-[6px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const checkboxIndicatorVariants = cva('', {
  variants: {
    size: {
      default: 'size-3.5',
      sm: 'size-3',
      lg: 'size-4',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

type CheckboxProps = CheckboxPrimitiveProps &
  VariantProps<typeof checkboxVariants>;

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  function Checkbox(
    { className, children, variant, size, ...props },
    ref
  ) {
    return (
      <CheckboxPrimitive
        ref={ref}
        className={cn(checkboxVariants({ variant, size, className }))}
        {...props}
      >
        {children}
        <CheckboxIndicatorPrimitive
          className={cn(checkboxIndicatorVariants({ size }))}
        />
      </CheckboxPrimitive>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox, type CheckboxProps };

