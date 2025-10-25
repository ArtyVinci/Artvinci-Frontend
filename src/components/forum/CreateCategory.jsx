import React, { useState } from 'react';
import { forumService } from '../../services/api';
import { showToast } from '../../services/toast';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import { CATEGORY_TYPES, DEFAULT_CATEGORY_TYPE } from '../../utils/categoryTypes';

export default function CreateCategory({ onCreated, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState(DEFAULT_CATEGORY_TYPE);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name || !name.trim()) {
      showToast.error('Category name is required');
      return;
    }
    setLoading(true);
    try {
      await forumService.createCategory({ name: name.trim(), description: description.trim(), type });
      showToast.success('Category created');
      setName('');
      setDescription('');
      setType(DEFAULT_CATEGORY_TYPE);
      if (onCreated) onCreated();
    } catch (err) {
      console.error('Create category failed', err);
      const msg = err.response?.data?.error || err.response?.data || err.message || 'Failed to create category';
      showToast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-4 bg-white rounded shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Create Category</h3>
      <div className="mb-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="w-full rounded border px-3 py-2" />
      </div>
      <div className="mb-3">
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description (optional)" className="w-full rounded border px-3 py-2" />
      </div>
      <div className="mb-3">
        <label className="block text-sm text-gray-600 mb-1">Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded border px-3 py-2">
          {CATEGORY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn-primary inline-flex items-center gap-2" disabled={loading}>
          <PlusCircle className="w-4 h-4" />
          {loading ? 'Creating...' : 'Create'}
        </motion.button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-3 py-2 rounded border bg-white text-sm">Cancel</button>
        )}
      </div>
    </form>
  );
}
