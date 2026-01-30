/**
 * LUMBAR - Framer Motion Animation Variants
 * Design System animations for consistent UI motion
 */

import type { Variants, Transition } from 'framer-motion';

// ============================================
// TRANSITION CONFIGS
// ============================================

export const transitions = {
    fast: { duration: 0.15 },
    normal: { duration: 0.2 },
    slow: { duration: 0.3 },
    spring: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
    },
    springBouncy: {
        type: 'spring',
        stiffness: 400,
        damping: 15,
    },
    springGentle: {
        type: 'spring',
        stiffness: 200,
        damping: 25,
    },
} as const satisfies Record<string, Transition>;

// ============================================
// BASIC ANIMATIONS
// ============================================

/** Fade in animation */
export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

/** Slide up with fade */
export const slideUp: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
};

/** Slide down with fade */
export const slideDown: Variants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

/** Scale in with fade */
export const scaleIn: Variants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
};

/** Bounce in animation */
export const bounceIn: Variants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: transitions.spring,
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        transition: transitions.fast,
    },
};

// ============================================
// OVERLAY ANIMATIONS
// ============================================

/** Overlay backdrop animation */
export const overlayBackdrop: Variants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.3 },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.2 },
    },
};

/** Overlay content animation */
export const overlayContent: Variants = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: transitions.springGentle,
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 10,
        transition: transitions.fast,
    },
};

// ============================================
// MASCOT ANIMATIONS
// ============================================

/** Mascot bounce animation */
export const mascotBounce: Variants = {
    animate: {
        y: [0, -10, 0],
        transition: {
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 2,
            ease: 'easeInOut',
        },
    },
};

/** Mascot float animation */
export const mascotFloat: Variants = {
    animate: {
        y: [0, -5, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

/** Mascot states based on mood */
export const mascotStates = {
    happy: {
        scale: 1,
        rotate: 0,
        filter: 'none',
    },
    sad: {
        scale: 0.95,
        rotate: -5,
        filter: 'grayscale(30%)',
    },
    angry: {
        scale: 1.05,
        rotate: [0, -3, 3, -3, 0],
        filter: 'hue-rotate(340deg)',
    },
    sleeping: {
        scale: 0.9,
        rotate: 10,
        filter: 'brightness(0.8)',
    },
};

/** Mascot shake animation (for angry state) */
export const mascotShake: Variants = {
    animate: {
        rotate: [0, -3, 3, -3, 3, 0],
        transition: {
            duration: 0.5,
            ease: 'easeInOut',
        },
    },
};

// ============================================
// BUTTON ANIMATIONS
// ============================================

/** Button tap animation */
export const buttonTap = {
    scale: 0.95,
};

/** Button hover animation */
export const buttonHover = {
    scale: 1.02,
    transition: transitions.fast,
};

/** Button variants for motion component */
export const buttonVariants: Variants = {
    idle: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.95 },
};

// ============================================
// CARD ANIMATIONS
// ============================================

/** Glass card entrance */
export const glassCardEnter: Variants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: transitions.springGentle,
    },
    exit: {
        opacity: 0,
        y: 10,
        scale: 0.98,
        transition: transitions.fast,
    },
};

/** Stagger children animation container */
export const staggerContainer: Variants = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

/** Stagger child item */
export const staggerItem: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
};

// ============================================
// NOTIFICATION ANIMATIONS
// ============================================

/** Toast notification slide in */
export const toastSlideIn: Variants = {
    initial: { opacity: 0, x: 100 },
    animate: {
        opacity: 1,
        x: 0,
        transition: transitions.spring,
    },
    exit: {
        opacity: 0,
        x: 100,
        transition: transitions.fast,
    },
};

// ============================================
// TIMER ANIMATIONS
// ============================================

/** Timer pulse animation */
export const timerPulse: Variants = {
    animate: {
        scale: [1, 1.05, 1],
        transition: {
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

/** Timer countdown tick */
export const timerTick: Variants = {
    initial: { scale: 1.1, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Create a delay transition variant
 */
export function withDelay(delay: number): Transition {
    return { delay };
}

/**
 * Create stagger animation with custom delay
 */
export function createStagger(staggerDelay: number = 0.1): Variants {
    return {
        animate: {
            transition: {
                staggerChildren: staggerDelay,
            },
        },
    };
}
