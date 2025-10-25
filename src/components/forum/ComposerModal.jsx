import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
};

const panel = {
  hidden: { opacity: 0, y: 12, scale: 0.995 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22 } },
};

export default function ComposerModal({ children, onClose, title = 'Create Topic' }) {
  return (
    <motion.div initial="hidden" animate="visible" exit="hidden" className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
        variants={backdrop}
      />

      {/* Modal panel */}
      <motion.div variants={panel} className="relative w-full max-w-2xl mx-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
