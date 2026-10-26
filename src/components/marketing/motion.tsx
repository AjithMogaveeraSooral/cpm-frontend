'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { useSyncExternalStore, type ElementType } from 'react';

const motionQuery = '(prefers-reduced-motion: reduce)';
function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
const motionPreference = () => window.matchMedia(motionQuery).matches;
const serverMotionPreference = () => false;
function useReducedMotion() {
  // The first client render must match SSR; read the OS preference after hydration.
  return useSyncExternalStore(subscribeToMotionPreference, motionPreference, serverMotionPreference);
}

type RevealProps = {
  as?: 'div' | 'section' | 'article' | 'li' | 'ul' | 'ol' | 'figure' | 'header' | 'span';
  delay?: number;
  /** Distance travelled in px while fading in. */
  y?: number;
  once?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<HTMLMotionProps<'div'>, 'children' | 'className'>;

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Scroll-triggered fade/rise used across the marketing site. Respects the
 * user's reduced-motion preference (handled by MotionConfig + this hook) and
 * keeps markup deterministic during hydration.
 */
export function Reveal({ as = 'div', delay = 0, y = 28, once = true, className, children, ...rest }: RevealProps) {
  const reduce = useReducedMotion();
  const Component = motion[as] as ElementType;
  return (
    <Component
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      animate={reduce ? { opacity: 1, y: 0 } : undefined}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2, margin: '0px 0px -8% 0px' }}
      transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : delay, ease }}
      {...rest}
    >
      {children}
    </Component>
  );
}

/** Staggers direct children that are themselves `Reveal`s or motion elements. */
export function Stagger({ as = 'div', className, children, gap = 0.08 }: { as?: 'div' | 'ul' | 'ol'; className?: string; children: React.ReactNode; gap?: number }) {
  const reduce = useReducedMotion();
  const Component = motion[as] as ElementType;
  return (
    <Component
      className={className}
      initial={reduce ? false : 'hidden'}
      animate={reduce ? 'show' : undefined}
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : gap } } }}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({ as = 'div', className, children }: { as?: 'div' | 'li' | 'article'; className?: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const Component = motion[as] as ElementType;
  return (
    <Component className={className} variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.6, ease } } }}>
      {children}
    </Component>
  );
}

/** Gentle continuous float for hero decorations. */
export function Float({ className, children, amplitude = 10, duration = 6 }: { className?: string; children: React.ReactNode; amplitude?: number; duration?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} animate={reduce ? undefined : { y: [0, -amplitude, 0] }} transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}>
      {children}
    </motion.div>
  );
}
