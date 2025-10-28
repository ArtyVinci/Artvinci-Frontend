import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { forumService } from '../../services/api';
import TopicForm from '../../components/forum/TopicForm';
import { ProtectedRoute } from '../../components/common/ProtectedRoute';

function TopicEditPageInner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await forumService.getTopic(id);
        setTopic(data);
      } catch (err) {
        console.error('Failed to load topic for edit', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (loading) return <div className="container-custom py-12">Loading...</div>;
  if (!topic) return <div className="container-custom py-12">Topic not found.</div>;

  return (
    <div className="container-custom py-12">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Edit topic</h2>
        <TopicForm
          categories={[]}
          initialTitle={topic.title}
          initialContent={topic.content}
          initialCategory={topic.category?.id || ''}
          topicId={id}
          onCreated={() => navigate(`/forum/${id}`)}
        />
      </div>
    </div>
  );
}

// export wrapped component as default
export default function TopicEditPage() {
  return (
    <ProtectedRoute>
      <TopicEditPageInner />
    </ProtectedRoute>
  );
}
