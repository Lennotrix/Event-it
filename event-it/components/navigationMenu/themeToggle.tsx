'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (
            savedTheme === 'dark' ||
            (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    function toggleTheme() {
        setIsDark((prev) => {
            const newDark = !prev;
            if (newDark) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
            return newDark;
        });
    }

    const variants = {
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -20, opacity: 0 },
    };

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="relative overflow-hidden w-10 h-10 rounded-md transition flex items-center justify-center"
        >
            <AnimatePresence mode="wait">
                {isDark ? (
                    <motion.span
                        key="sun"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.2 }}
                        className="absolute"
                    >
                        <Sun size={24} />
                    </motion.span>
                ) : (
                    <motion.span
                        key="moon"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.2 }}
                        className="absolute"
                    >
                        <Moon size={24} />
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    );
}
