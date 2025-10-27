import { useEffect, useState } from 'react';
import { forumService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import CategoryList from '../../components/forum/CategoryList';
import CreateCategory from '../../components/forum/CreateCategory';
import TopicList from '../../components/forum/TopicList';
import TopicForm from '../../components/forum/TopicForm';
import ComposerModal from '../../components/forum/ComposerModal';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';

export default function ForumPage() {
  const { isAuthenticated, user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showComposer, setShowComposer] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async (categoryId = null) => {
    setLoading(true);
    try {
      const cats = await forumService.getCategories();
      setCategories(cats || []);

      const params = categoryId ? { category: categoryId } : {};
      const t = await forumService.getTopics(params);
      setTopics(t.results || []);
    } catch (err) {
      console.error('Failed to load forum data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedCategory);
  }, [selectedCategory]);

  const handleCategorySelect = (id) => {
    setSelectedCategory(id);
  };

  const handleTopicCreated = () => {
    // reload topics after creation
    loadData(selectedCategory);
  };

  return (
    <div className="container-custom py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <h2 className="text-2xl font-semibold mb-4">Categories</h2>
          {/* Create category (admin/artist only) */}
          <CategoryList
            categories={categories}
            loading={loading}
            onSelect={handleCategorySelect}
            selected={selectedCategory}
          />
          {/* Create category as a modal (admin/artist only) */}
          {isAuthenticated && (user?.role === 'admin' || user?.role === 'artist') && (
            <div className="mt-4">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowCreateCategory(true)} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 btn-outline">
                <PlusCircle className="w-4 h-4" />
                <span className="text-sm">Create category</span>
              </motion.button>
            </div>
          )}

          {showCreateCategory && (
            <ComposerModal onClose={() => setShowCreateCategory(false)} title="Create Category">
              <CreateCategory onCreated={() => { setShowCreateCategory(false); loadData(selectedCategory); }} onCancel={() => setShowCreateCategory(false)} />
            </ComposerModal>
          )}
        </aside>

        <main className="md:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Forum</h1>
              <p className="text-sm text-gray-500">Discuss artworks, events and more with the community.</p>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowComposer(true)} className="inline-flex items-center gap-2 btn-primary">
                  <PlusCircle className="w-5 h-5" />
                  <span>Nouvelle discussion</span>
                </motion.button>
              ) : (
                <div className="text-sm text-gray-600">Log in to create a topic.</div>
              )}
            </div>
          </div>

          {showComposer && (
            <ComposerModal onClose={() => setShowComposer(false)} title="Start a discussion">
              <TopicForm
                categories={categories}
                onCreated={() => { setShowComposer(false); handleTopicCreated(); }}
                onCancel={() => setShowComposer(false)}
                hideHeader={true}
              />
            </ComposerModal>
          )}

          <TopicList topics={topics} loading={loading} />
        </main>
      </div>
    </div>
  );
}
