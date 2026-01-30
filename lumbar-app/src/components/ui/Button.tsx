import { FC, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    children?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-[#FF6B35] hover:bg-[#e55a2b] text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-[#4ECDC4] hover:bg-[#3dbdb4] text-white shadow-lg hover:shadow-xl',
    ghost: 'bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white/90 border border-white/20',
    danger: 'bg-[#E17055] hover:bg-red-600 text-white shadow-lg',
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
};

export const Button: FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    className = '',
    ...props
}) => {
    const isDisabled = disabled || loading;

    return (
        <motion.button
            className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        font-semibold
        inline-flex items-center justify-center gap-2
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B35]/50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
            disabled={isDisabled}
            whileHover={!isDisabled ? { scale: 1.02 } : undefined}
            whileTap={!isDisabled ? { scale: 0.95 } : undefined}
            {...props}
        >
            {loading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}
            {!loading && leftIcon && <span>{leftIcon}</span>}
            {children}
            {rightIcon && <span>{rightIcon}</span>}
        </motion.button>
    );
};

export default Button;

