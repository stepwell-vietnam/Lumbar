/**
 * LUMBAR - Button Component
 * Glass-style buttons with multiple variants
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { buttonVariants, buttonTap, buttonHover } from '../../lib/animations';

// ============================================
// TYPES
// ============================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
    /** Button content */
    children: ReactNode;
    /** Button style variant */
    variant?: ButtonVariant;
    /** Button size */
    size?: ButtonSize;
    /** Full width button */
    fullWidth?: boolean;
    /** Loading state */
    loading?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Left icon */
    leftIcon?: ReactNode;
    /** Right icon */
    rightIcon?: ReactNode;
    /** Additional class names */
    className?: string;
}

// ============================================
// VARIANT STYLES
// ============================================

const variantStyles: Record<ButtonVariant, string> = {
    primary: [
        'bg-primary hover:bg-primary-hover',
        'text-white font-semibold',
        'shadow-lg hover:shadow-xl hover:shadow-primary/20',
        'border-0',
    ].join(' '),

    secondary: [
        'bg-secondary hover:bg-secondary-hover',
        'text-white font-semibold',
        'shadow-lg hover:shadow-xl hover:shadow-secondary/20',
        'border-0',
    ].join(' '),

    ghost: [
        'bg-white/20 hover:bg-white/30',
        'dark:bg-white/10 dark:hover:bg-white/20',
        'backdrop-blur-sm',
        'text-gray-800 dark:text-white/90 font-medium',
        'border border-white/20 dark:border-white/10',
    ].join(' '),

    danger: [
        'bg-error hover:bg-red-600',
        'text-white font-semibold',
        'shadow-lg hover:shadow-xl',
        'border-0',
    ].join(' '),

    success: [
        'bg-success hover:bg-green-600',
        'text-white font-semibold',
        'shadow-lg hover:shadow-xl',
        'border-0',
    ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
};

// ============================================
// COMPONENT
// ============================================

/**
 * Button - A glass-style button component with variants
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md">
 *   Take a Break
 * </Button>
 * 
 * <Button variant="ghost" leftIcon={<Clock />}>
 *   Snooze 5 min
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        children,
        variant = 'primary',
        size = 'md',
        fullWidth = false,
        loading = false,
        disabled = false,
        leftIcon,
        rightIcon,
        className = '',
        ...props
    }, ref) => {
        const isDisabled = disabled || loading;

        const baseStyles = [
            'inline-flex items-center justify-center gap-2',
            'transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        ].join(' ');

        const combinedClassName = [
            baseStyles,
            variantStyles[variant],
            sizeStyles[size],
            fullWidth ? 'w-full' : '',
            className,
        ].filter(Boolean).join(' ');

        return (
            <motion.button
                ref={ref}
                className={combinedClassName}
                disabled={isDisabled}
                whileHover={!isDisabled ? buttonHover : undefined}
                whileTap={!isDisabled ? buttonTap : undefined}
                {...props}
            >
                {/* Loading spinner */}
                {loading && (
                    <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}

                {/* Left icon */}
                {!loading && leftIcon && (
                    <span className="flex-shrink-0">{leftIcon}</span>
                )}

                {/* Button text */}
                <span>{children}</span>

                {/* Right icon */}
                {rightIcon && (
                    <span className="flex-shrink-0">{rightIcon}</span>
                )}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';

// ============================================
// SPECIAL BUTTON VARIANTS
// ============================================

/**
 * PassiveAggressiveButton - Snooze button with guilt-trip styling
 */
export interface PassiveAggressiveButtonProps extends Omit<ButtonProps, 'variant'> {
    /** Snooze count affects the button text */
    snoozeCount?: number;
}

export const PassiveAggressiveButton = forwardRef<HTMLButtonElement, PassiveAggressiveButtonProps>(
    ({ children, snoozeCount = 0, className = '', ...props }, ref) => {
        // Change appearance based on snooze count
        const getStyle = () => {
            if (snoozeCount >= 3) {
                return 'bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-500/30';
            }
            if (snoozeCount >= 1) {
                return 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 border-yellow-500/30';
            }
            return 'bg-white/20 hover:bg-white/30 text-white/80 border-white/20';
        };

        return (
            <Button
                ref={ref}
                variant="ghost"
                className={`${getStyle()} ${className}`}
                {...props}
            >
                {children}
            </Button>
        );
    }
);

PassiveAggressiveButton.displayName = 'PassiveAggressiveButton';

// ============================================
// ICON BUTTON
// ============================================

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'leftIcon' | 'rightIcon'> {
    /** Icon element */
    icon: ReactNode;
    /** Accessible label */
    label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ icon, label, size = 'md', className = '', ...props }, ref) => {
        const iconSizes: Record<ButtonSize, string> = {
            sm: 'p-2',
            md: 'p-3',
            lg: 'p-4',
        };

        return (
            <Button
                ref={ref}
                size={size}
                className={`${iconSizes[size]} !rounded-full ${className}`}
                aria-label={label}
                {...props}
            >
                {icon}
            </Button>
        );
    }
);

IconButton.displayName = 'IconButton';

// ============================================
// EXPORTS
// ============================================

export default Button;
