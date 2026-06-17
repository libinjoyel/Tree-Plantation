import type { Variants, Transition } from 'framer-motion';

export const easeOut = [0.4, 0, 0.2, 1] as const;

export const fastTransition: Transition = {
  duration: 0.2,
  ease: easeOut,
};

export const cardTransition: Transition = {
  duration: 0.35,
  ease: easeOut,
};

export const slowTransition: Transition = {
  duration: 0.5,
  ease: easeOut,
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: cardTransition,
  },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -12 },
  animate: {
    opacity: 1,
    x: 0,
    transition: cardTransition,
  },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: easeOut },
  },
};

export const cardHover = {
  whileHover: {
    y: -4,
    transition: cardTransition,
  },
};

export const cardHoverLight = {
  whileHover: {
    y: -2,
    transition: cardTransition,
  },
};

export const navItem: Variants = {
  initial: { opacity: 0, x: -8 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: easeOut },
  },
  tap: { scale: 0.96 },
};

export const scaleOnHover = {
  whileHover: {
    scale: 1.05,
    transition: fastTransition,
  },
};

export const staggerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};
