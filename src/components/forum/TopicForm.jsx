import React, { useState, useEffect } from 'react';
import { forumService } from '../../services/api';
import { showToast } from '../../services/toast';
import { motion } from 'framer-motion';
import { Send, X } from 'lucide-react';

export default function TopicForm({ categories = [], onCreated, onCancel, hideHeader = false }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(categories?.[0]?.id || '');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // If categories load after mount, set default category
    if ((!category || category === '') && categories && categories.length > 0) {
      setCategory(categories[0].id);
    }
  }, [categories]);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    // Local validation
    const newErrors = {};
    if (!title || !title.trim()) newErrors.title = 'Title is required';
    if (!category || category === '') newErrors.category = 'Category is required';
    if (!content || !content.trim()) newErrors.content = 'Content is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showToast.error('Please fill the required fields');
      return;
    }

    setLoading(true);
    try {
      await forumService.createTopic({ title, content, category });
      setTitle('');
      setContent('');
      showToast.success('Topic created');
      if (onCreated) onCreated();
    } catch (err) {
      console.error('Failed to create topic', err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.response?.data || err.message || 'Failed to create topic';
      showToast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border">
      {!hideHeader && (
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Start a discussion</h3>
            <p className="text-sm text-gray-500">Share something interesting with the community</p>
          </div>
          {onCancel && (
            <button onClick={onCancel} aria-label="Close" className="text-gray-400 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      <form onSubmit={submit} className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your discussion a short, descriptive title"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          {errors.title && <div className="mt-1 text-xs text-red-600">{errors.title}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">▾</div>
          </div>
          {errors.category && <div className="mt-1 text-xs text-red-600">{errors.category}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="What do you want to talk about? Add details, context, or questions."
            className="w-full min-h-[140px] resize-y rounded-lg border border-gray-200 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <div>{errors.content ? <span className="text-red-600">{errors.content}</span> : <span>{content.length} characters</span>}</div>
            <div className="text-gray-400">Markdown supported</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 py-2 shadow"
              disabled={loading}
            >
              <Send className="w-4 h-4" />
              {loading ? 'Posting...' : 'Publish'}
            </motion.button>
            {onCancel && (
              <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            )}
          </div>
          <div className="text-xs text-gray-400">Be kind — follow community guidelines</div>
        </div>

        {errors && Object.keys(errors).length > 0 && (
          <div className="mt-1 text-sm text-red-600">
            {Object.values(errors).map((v, i) => (
              <div key={i}>{v}</div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
