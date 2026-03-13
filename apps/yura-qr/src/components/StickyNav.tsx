'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

const SECTIONS = [
  { id: 'memorial', key: 'memorial' },
  { id: 'timeline', key: 'timeline' },
  { id: 'before-after', key: 'beforeAfter' },
  { id: 'voices', key: 'voices' },
  { id: 'lessons', key: 'lessons' },
  { id: 'namie-now', key: 'namieNow' },
  { id: 'garment', key: 'garment' },
  { id: 'action', key: 'action' },
] as const;

export function StickyNav() {
  const t = useTranslations('nav');
  const [activeSection, setActiveSection] = useState('hero');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { threshold: 0.3 }
    );

    for (const section of SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > window.innerHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
        >
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-6 overflow-x-auto hide-scrollbar">
            <span className="font-display text-accent text-sm tracking-wider shrink-0">
              YURA
            </span>
            <div className="flex gap-4">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollTo(section.id)}
                  className={`text-xs tracking-wider whitespace-nowrap transition-colors ${
                    activeSection === section.id
                      ? 'text-accent'
                      : 'text-foreground/60 hover:text-foreground/80'
                  }`}
                >
                  {t(section.key)}
                </button>
              ))}
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
