import { forwardRef } from 'react';
import type { IconProps } from './types';

export const Icon = forwardRef<SVGSVGElement, IconProps & { children: React.ReactNode }>(
  ({ size = 24, color = 'currentColor', children, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"

        style={{ color, ...props.style }}
        {...props}
      >
        {children}
      </svg>
    );
  }
);

Icon.displayName = 'Icon';
