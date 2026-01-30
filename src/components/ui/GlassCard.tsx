/**
 * LUMBAR - GlassCard Component
 * Glassmorphism card with multiple variants
 */

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { glassCardEnter } from '../../lib/animations';

// ============================================
// TYPES
// ============================================

export type GlassVariant = 'light' | 'medium' | 'heavy';

export interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
    /** Card content */
    children: ReactNode;
    /** Glass effect intensity */
    variant?: GlassVariant;
    /** Enable entrance animation */
    animated?: boolean;
    /** Additional class names */
    className?: string;
    /** Enable hover effect */
    hoverable?: boolean;
}

// ============================================
// VARIANT STYLES
// ============================================

const variantStyles: Record<GlassVariant, string> = {
    light: [
        'bg-white/25 dark:bg-white/10',
        'backdrop-blur-[10px]',
        'border border-white/20 dark:border-white/10',
        'shadow-glass dark:shadow-glass-dark',
    ].join(' '),

    medium: [
        'bg-white/40 dark:bg-white/15',
        'backdrop-blur-[15px]',
        'border border-white/25 dark:border-white/15',
        'shadow-glass dark:shadow-glass-dark',
    ].join(' '),

    heavy: [
        'bg-white/60 dark:bg-white/25',
        'backdrop-blur-[20px]',
        'border border-white/30 dark:border-white/20',
        'shadow-glass dark:shadow-glass-dark',
    ].join(' '),
};

const hoverStyles = 'hover:bg-white/30 dark:hover:bg-white/15 hover:shadow-lg transition-all duration-200';

// ============================================
// COMPONENT
// ============================================

/**
 * GlassCard - A glassmorphism styled card component
 * 
 * @example
 * ```tsx
 * <GlassCard variant="medium" animated>
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </GlassCard>
 * ```
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
    ({
        children,
        variant = 'light',
        animated = false,
        hoverable = false,
        className = '',
        ...props
    }, ref) => {
        const baseStyles = 'rounded-2xl p-6';
        const glassStyles = variantStyles[variant];
        const interactionStyles = hoverable ? hoverStyles : '';

        const combinedClassName = [
            baseStyles,
            glassStyles,
            interactionStyles,
            className,
        ].filter(Boolean).join(' ');

        if (animated) {
            return (
                <motion.div
                    ref={ref}
                    className={combinedClassName}
                    variants={glassCardEnter}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    {...props}
                >
                    {children}
                </motion.div>
            );
        }

        return (
            <motion.div
                ref={ref}
                className={combinedClassName}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

GlassCard.displayName = 'GlassCard';

// ============================================
// SUB-COMPONENTS
// ============================================

export interface GlassCardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export const GlassCardHeader = ({ children, className = '', ...props }: GlassCardHeaderProps) => (
    <div className={`mb-4 ${className}`} {...props}>
        {children}
    </div>
);

export interface GlassCardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    children: ReactNode;
}

export const GlassCardTitle = ({ children, className = '', ...props }: GlassCardTitleProps) => (
    <h3 className={`text-lg font-semibold text-gray-800 dark:text-gray-100 ${className}`} {...props}>
        {children}
    </h3>
);

export interface GlassCardContentProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export const GlassCardContent = ({ children, className = '', ...props }: GlassCardContentProps) => (
    <div className={`text-gray-600 dark:text-gray-300 ${className}`} {...props}>
        {children}
    </div>
);

export interface GlassCardFooterProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export const GlassCardFooter = ({ children, className = '', ...props }: GlassCardFooterProps) => (
    <div className={`mt-4 pt-4 border-t border-white/10 ${className}`} {...props}>
        {children}
    </div>
);

// ============================================
// EXPORTS
// ============================================

export default GlassCard;
