import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { forumService } from '../../services/api';
import ReplyForm from '../../components/forum/ReplyForm';
import Modal from '../../components/common/Modal';
import { showToast } from '../../services/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Clock, Tag, ThumbsUp, CornerUpLeft } from 'lucide-react';
import { useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function TopicDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFull, setShowFull] = useState(false);
  // Hooks must be called unconditionally and in the same order on every render
  const replyAreaId = 'reply-textarea';
  const replySectionRef = useRef(null);
  // auth and modal state must be declared before any early returns to keep Hooks order stable
  const { user, isAuthenticated } = useAuth();
  const [replyToDelete, setReplyToDelete] = useState(null);
  const [showReplyDeleteModal, setShowReplyDeleteModal] = useState(false);
  const [showTopicDeleteModal, setShowTopicDeleteModal] = useState(false);
  

  const loadTopic = async () => {
    setLoading(true);
    try {
      const data = await forumService.getTopic(id);
      setTopic(data);
    } catch (err) {
      console.error('Failed to load topic', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadTopic();
  }, [id]);

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            {/* header skeleton: avatar + title + meta */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>

            {/* content skeleton */}
            <div className="h-40 bg-gray-200 rounded" />

            {/* replies skeleton */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-12 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-12 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!topic) return <div className="container-custom py-12">Topic not found.</div>;

  // small helper: safely extract initial from author's username
  const authorInitial = (author) => {
    try {
      if (!author || !author.username) return 'U';
      return author.username && author.username.length > 0 ? author.username[0].toUpperCase() : 'U';
    } catch (e) {
      return 'U';
    }
  };

  const safeFormat = (iso) => {
    try {
      if (!iso) return '';
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      return formatDistanceToNow(d, { addSuffix: true });
    } catch (e) {
      return '';
    }
  };

  const scrollToReply = () => {
      try {
      const el = document.getElementById(replyAreaId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (typeof el.focus === 'function') el.focus();
      } else if (replySectionRef.current) {
        replySectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (e) {
      // fallback: ignore
    }
  };

  const isOwner = () => {
    try {
      if (!user || !topic) return false;
      // compare by id if available, fallback to username
      return String(user.id) === String(topic.author?.id) || (user.username && topic.author?.username && user.username === topic.author.username);
    } catch (e) { return false; }
  };

  const handleDeleteTopic = async () => {
    // open topic delete modal
    setShowTopicDeleteModal(true);
  };

  const handleHelpfulTopic = async () => {
    try {
      const res = await forumService.helpfulTopic(id);
      setTopic((t) => ({ ...t, helpful_count: res.helpful_count }));
    } catch (err) {
      console.error('Helpful topic failed', err);
    }
  };

  

  const confirmDeleteReply = async () => {
    if (!replyToDelete) return;
    try {
      await forumService.deleteReply(replyToDelete);
      setTopic((t) => ({ ...t, replies: t.replies.filter(rr => rr.id !== replyToDelete) }));
      setShowReplyDeleteModal(false);
      setReplyToDelete(null);
      showToast.success('Commentaire supprimé');
    } catch (err) {
      console.error('Failed to delete reply', err);
      showToast.error('Impossible de supprimer le commentaire.');
    }
  };

  const confirmDeleteTopic = async () => {
    try {
      await forumService.deleteTopic(id);
      setShowTopicDeleteModal(false);
      showToast.success('Sujet supprimé');
      navigate('/forum');
    } catch (err) {
      console.error('Delete topic failed', err);
      showToast.error('Impossible de supprimer le sujet.');
    }
  };



  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">{topic.title}</h1>
            <div className="mt-1 text-sm text-gray-500">in <span className="capitalize">{topic.category?.name}</span></div>
          </div>
                  <div>
                    <button onClick={() => navigate('/forum')} className="inline-flex items-center gap-2 px-3 py-2 border rounded text-sm">
                      <CornerUpLeft className="w-4 h-4" /> Write a post
                    </button>
                  </div>
        </div>

        {/* Original post highlighted like forum examples (brand primary) */}
        <article className="mb-6 bg-primary-50 border rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-12 gap-4 items-start">
            <div className="col-span-1">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">{topic.author?.username ? topic.author.username[0].toUpperCase() : 'U'}</div>
            </div>
            <div className="col-span-11">
              <div className="text-sm text-gray-600 mb-2">{topic.author?.username} • {safeFormat(topic.created_at)}</div>
              <div className="text-gray-800 mb-3">
                {topic.content && topic.content.length > 400 ? (
                  <>
                    <AnimatePresence initial={false}>
                      <motion.div
                        key={showFull ? 'full' : 'preview'}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.22 }}
                      >
                        <div>{showFull ? topic.content : topic.content.slice(0, 400) + '...'}</div>
                      </motion.div>
                    </AnimatePresence>
                    <button onClick={() => setShowFull(s => !s)} className="mt-2 text-sm text-primary-600 hover:underline">
                      {showFull ? 'Show less' : 'Show more'}
                    </button>
                  </>
                ) : (
                  <div>{topic.content}</div>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <button onClick={handleHelpfulTopic} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800">
                  <ThumbsUp className="w-4 h-4" /> Helpful ({topic.helpful_count ?? 0})
                </button>
                <button onClick={scrollToReply} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800">
                  <CornerUpLeft className="w-4 h-4" /> Reply
                </button>
                {isOwner() && (
                  <>
                    <button onClick={() => navigate(`/forum/${id}/edit`)} className="inline-flex items-center gap-2 text-sm text-primary-600 hover:underline">Edit</button>
                    <button onClick={handleDeleteTopic} className="inline-flex items-center gap-2 text-sm text-red-600 hover:underline">Delete</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </article>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Replies</h2>
          {topic.replies && topic.replies.length > 0 ? (
            <ul className="space-y-4">
              {topic.replies.map((r, idx) => (
                <motion.li key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} className="bg-white border rounded-lg shadow-sm">
                  <div className="p-4 grid grid-cols-12 gap-4 items-start">
                    <div className="col-span-1">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">{r.author?.username ? r.author.username[0].toUpperCase() : 'U'}</div>
                    </div>
                    <div className="col-span-11">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                          <div className="font-medium">{r.author?.username}</div>
                          <div className="text-xs text-gray-400 inline-flex items-center gap-1"><Clock className="w-3 h-3 text-gray-300" /> {safeFormat(r.created_at)}</div>
                        </div>
                      </div>
                      <div className="text-gray-800">{r.content}</div>
                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                        <button onClick={async () => {
                          try {
                            const res = await forumService.helpfulReply(r.id);
                            // update local replies in topic state
                            setTopic((t) => ({
                              ...t,
                              replies: t.replies.map(rr => rr.id === r.id ? { ...rr, helpful_count: res.helpful_count } : rr)
                            }));
                          } catch (err) { console.error(err); }
                        }} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800">
                          <ThumbsUp className="w-4 h-4" /> Helpful ({r.helpful_count ?? 0})
                        </button>
                        {user && String(user.id) === String(r.author?.id) && (
                          <>
                            <button onClick={() => { setReplyToDelete(r.id); setShowReplyDeleteModal(true); }} className="text-sm text-red-600 hover:underline ml-2">Delete</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-600">No replies yet.</div>
          )}
        </section>
        {/* Reply deletion modal */}
        <Modal
          isOpen={showReplyDeleteModal}
          onClose={() => { setShowReplyDeleteModal(false); setReplyToDelete(null); }}
          title="Supprimer le commentaire ?"
          footer={(
            <>
              <button onClick={() => { setShowReplyDeleteModal(false); setReplyToDelete(null); }} className="px-4 py-2 rounded-lg border mr-2">Annuler</button>
              <button onClick={confirmDeleteReply} className="px-4 py-2 rounded-lg bg-red-600 text-white">Supprimer</button>
            </>
          )}
          size="sm"
        >
          <p>Voulez-vous vraiment supprimer ce commentaire ? Cette action est irréversible.</p>
        </Modal>

        {/* Topic deletion modal */}
        <Modal
          isOpen={showTopicDeleteModal}
          onClose={() => setShowTopicDeleteModal(false)}
          title="Supprimer le sujet ?"
          footer={(
            <>
              <button onClick={() => setShowTopicDeleteModal(false)} className="px-4 py-2 rounded-lg border mr-2">Annuler</button>
              <button onClick={confirmDeleteTopic} className="px-4 py-2 rounded-lg bg-red-600 text-white">Supprimer</button>
            </>
          )}
          size="sm"
        >
          <p>Voulez-vous vraiment supprimer ce sujet ? Cette action est irréversible.</p>
        </Modal>

        <section>
          <h3 className="text-lg font-semibold mb-3">Add a reply</h3>
          {/* Sticky composer: sticky on large screens, in-flow on mobile */}
          <div className="mt-4">
            <div className="lg:sticky lg:bottom-6 lg:z-40">
              <div className="bg-white border rounded-lg shadow-sm p-4">
                <ReplyForm topicId={id} onReplyCreated={loadTopic} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
