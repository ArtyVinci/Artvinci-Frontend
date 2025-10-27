import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Eye, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

export default function TopicList({ topics = [], loading }) {
  if (loading) return <div className="p-6">Loading topics...</div>;
  if (!topics || topics.length === 0) return <div className="text-gray-600">No topics yet.</div>;
  return (
    <motion.div className="space-y-4" initial="hidden" animate="visible" variants={container}>
      {topics.map((t) => (
        <motion.div key={t.id} className="bg-white rounded-lg shadow-sm border overflow-hidden" variants={item}>
          <div className="grid grid-cols-12 gap-4 items-center p-4">
            <div className="col-span-8">
              <Link to={`/forum/${t.id}`} className="text-lg font-semibold text-gray-800 hover:text-purple-700">{t.title}</Link>
              <div className="text-sm text-gray-600 mt-2 line-clamp-2">{t.content && t.content.length > 220 ? `${t.content.slice(0,220)}…` : t.content}</div>
            </div>

            <div className="col-span-1 text-center">
              <div className="flex flex-col items-center text-sm text-gray-700">
                <MessageCircle className="w-5 h-5 text-gray-400" />
                <div className="font-semibold">{t.replies_count ?? (t.replies ? t.replies.length : 0)}</div>
              </div>
            </div>

            <div className="col-span-1 text-center">
              <div className="flex flex-col items-center text-sm text-gray-700">
                <Eye className="w-5 h-5 text-gray-400" />
                <div className="font-semibold">{t.views_count ?? '—'}</div>
              </div>
            </div>

            <div className="col-span-2 text-right">
              <div className="flex items-center justify-end gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <div className="text-sm text-gray-600">{t.author?.username}</div>
              </div>
              <div className="text-xs text-gray-400">{t.created_at ? formatDistanceToNow(new Date(t.created_at), { addSuffix: true }) : ''}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
