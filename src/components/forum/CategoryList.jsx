import React from 'react';
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';

const item = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.22 } },
};

export default function CategoryList({ categories = [], loading, onSelect, selected }) {
  if (loading) return <div className="p-4">Loading categories...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold">Categories</h4>
      </div>

      <div className="flex flex-col gap-2">
        <motion.button
          initial="hidden"
          animate="visible"
          variants={item}
          className={`w-full text-left px-3 py-2 rounded text-sm ${!selected ? 'bg-gray-100 text-gray-800' : 'hover:bg-gray-50'}`}
          onClick={() => onSelect(null)}
        >
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-500" />
            <span>All</span>
          </div>
        </motion.button>

        {categories.map((c, idx) => (
          <motion.button
            key={c.id}
            initial="hidden"
            animate="visible"
            variants={item}
            transition={{ delay: idx * 0.03 }}
            className={`w-full text-left px-3 py-2 rounded text-sm ${selected === c.id ? 'bg-purple-50 text-purple-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
            onClick={() => onSelect(c.id)}
          >
            <div className="flex items-start gap-3">
              <Tag className="w-5 h-5 text-purple-600 mt-1" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">{c.name}</div>
                {c.description ? <div className="text-xs text-gray-400 mt-1">{c.description}</div> : null}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
