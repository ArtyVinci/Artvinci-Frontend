import React, { useState } from 'react';
import { forumService } from '../../services/api';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { showToast } from '../../services/toast';

export default function ReplyForm({ topicId, onReplyCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!content) return;
    setLoading(true);
    try {
      await forumService.createReply(topicId, { content });
      setContent('');
      if (onReplyCreated) onReplyCreated();
    } catch (err) {
      console.error('Failed to create reply', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white border rounded-lg shadow-sm p-4">
      <div className="grid grid-cols-12 gap-4 items-start">
        <div className="col-span-1">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">{user?.username ? user.username[0].toUpperCase() : 'U'}</div>
        </div>

        <div className="col-span-11">
          <div className="mb-3">
            <textarea id="reply-textarea" value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full rounded border px-3 py-2" placeholder="Write your reply..." />
          </div>
          <div className="flex items-center justify-end">
            <div className="mr-2">
              <button type="button" onClick={async () => {
                if (suggesting) return;
                setSuggesting(true);
                try {
                  const res = await forumService.suggestReply(topicId, { tone: 'friendly', max_length: 400 });
                  if (res && res.suggestion) {
                    setContent((c) => (c ? c + '\n\n' + res.suggestion : res.suggestion));
                    const ta = document.getElementById('reply-textarea');
                    if (ta) ta.focus();
                  } else {
                    showToast.error('Aucune suggestion renvoyée.');
                  }
                } catch (err) {
                  console.error('Suggest reply failed', err);
                  const msg = err.response?.data?.error || err.response?.data?.detail || err.message || 'Erreur lors de la suggestion';
                  showToast.error(msg);
                } finally {
                  setSuggesting(false);
                }
              }} className="btn-secondary inline-flex items-center gap-2" disabled={suggesting}>
                {suggesting ? 'Suggesting...' : 'Suggest reply'}
              </button>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary inline-flex items-center gap-2" disabled={loading}>
              <Send className="w-4 h-4" />
              {loading ? 'Posting...' : 'Post Reply'}
            </motion.button>
          </div>
        </div>

      </div>
    </form>
  );
}
