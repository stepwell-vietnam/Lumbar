import { FC, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type GlassVariant = 'light' | 'medium' | 'heavy';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
    children: ReactNode;
    className?: string;
    variant?: GlassVariant;
    animated?: boolean;
}

const variantClasses: Record<GlassVariant, string> = {
    light: 'bg-white/25 backdrop-blur-[10px]',
    medium: 'bg-white/40 backdrop-blur-[15px]',
    heavy: 'bg-white/60 backdrop-blur-[20px]',
};

export const GlassCard: FC<GlassCardProps> = ({
    children,
    className = '',
    variant = 'light',
    animated = false,
    ...props
}) => {
    const baseClasses = `
    ${variantClasses[variant]}
    rounded-2xl
    border border-white/20
    shadow-lg
    ${className}
  `;

    if (animated) {
        return (
            <motion.div
                className={baseClasses}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                {...props}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <div className={baseClasses} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
            {children}
        </div>
    );
};

export default GlassCard;
