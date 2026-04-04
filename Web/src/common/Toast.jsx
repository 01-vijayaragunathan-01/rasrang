import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, XCircle, X, Zap } from 'lucide-react';
import { useToastStack } from '../context/ToastContext';

// RasRang Festival Colour Palette (from logo)
// Purple: #9D01E9, Magenta: #C53099, Pink: #E31E6E, Cyan: #22D3EE, Yellow: #FACC15

const TOAST_TYPES = {
    success: {
        gradient: 'linear-gradient(135deg, #22D3EE, #9D01E9)',
        glow: 'rgba(34, 211, 238, 0.35)',
        iconBg: 'rgba(34, 211, 238, 0.15)',
        iconColor: '#22D3EE',
        icon: <CheckCircle className="w-5 h-5" />,
        label: 'SUCCESS',
        labelColor: '#22D3EE',
    },
    error: {
        gradient: 'linear-gradient(135deg, #E31E6E, #C53099)',
        glow: 'rgba(227, 30, 110, 0.35)',
        iconBg: 'rgba(227, 30, 110, 0.15)',
        iconColor: '#E31E6E',
        icon: <XCircle className="w-5 h-5" />,
        label: 'ERROR',
        labelColor: '#E31E6E',
    },
    warning: {
        gradient: 'linear-gradient(135deg, #FACC15, #E31E6E)',
        glow: 'rgba(250, 204, 21, 0.35)',
        iconBg: 'rgba(250, 204, 21, 0.15)',
        iconColor: '#FACC15',
        icon: <AlertTriangle className="w-5 h-5" />,
        label: 'WARNING',
        labelColor: '#FACC15',
    },
    info: {
        gradient: 'linear-gradient(135deg, #9D01E9, #C53099)',
        glow: 'rgba(157, 1, 233, 0.35)',
        iconBg: 'rgba(157, 1, 233, 0.15)',
        iconColor: '#9D01E9',
        icon: <Zap className="w-5 h-5" />,
        label: 'INFO',
        labelColor: '#9D01E9',
    },
};

const Toast = ({ id, message, type, duration = 5000, onRemove }) => {
    const config = TOAST_TYPES[type] || TOAST_TYPES.info;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 60, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative pointer-events-auto w-80 md:w-[360px] mb-3 overflow-hidden rounded-2xl"
            style={{
                // Deep festival-dark glass background matching website
                background: 'linear-gradient(135deg, rgba(30, 20, 60, 0.92) 0%, rgba(10, 5, 30, 0.96) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                boxShadow: `0 8px 32px ${config.glow}, 0 0 0 1px rgba(255,255,255,0.04)`,
            }}
        >
            {/* Gradient top accent line */}
            <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: config.gradient }}
            />

            {/* Subtle gradient glow overlay inside card */}
            <div
                className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{
                    background: `radial-gradient(ellipse at top left, ${config.glow} 0%, transparent 60%)`,
                    opacity: 0.4
                }}
            />

            <div className="relative flex items-start gap-3 px-4 pt-4 pb-3">
                {/* Icon bubble */}
                <div
                    className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
                    style={{ background: config.iconBg }}
                >
                    <span style={{ color: config.iconColor }}>{config.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div
                        className="text-[9px] font-black uppercase tracking-[0.35em] mb-1"
                        style={{
                            background: config.gradient,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        {config.label}
                    </div>
                    <p className="text-sm text-white/85 font-semibold leading-snug break-words">
                        {message}
                    </p>
                </div>

                {/* Close button */}
                <button
                    onClick={() => onRemove(id)}
                    className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all mt-0.5"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Auto-dismiss progress bar */}
            <div className="relative h-[2px] mx-4 mb-3 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: config.gradient }}
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: duration / 1000, ease: 'linear' }}
                />
            </div>

            {/* RasRang logo watermark — very subtle */}
            <div
                className="absolute bottom-2 right-3 text-[8px] font-black uppercase tracking-[0.25em] select-none pointer-events-none"
                style={{
                    background: config.gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    opacity: 0.35,
                }}
            >
                RASRANG
            </div>
        </motion.div>
    );
};

export const ToastContainer = () => {
    const { toasts, removeToast } = useToastStack();

    return (
        <div className="fixed top-6 right-6 z-[9999] pointer-events-none flex flex-col items-end max-h-screen">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onRemove={removeToast}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};
