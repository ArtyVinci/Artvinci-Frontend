// Category types used by the forum (should match backend ForumCategory.CategoryType values)
export const CATEGORY_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'announcements', label: 'Announcements' },
  { value: 'help', label: 'Help' },
  { value: 'tutorials', label: 'Tutorials' },
  { value: 'showcase', label: 'Showcase' },
  { value: 'events', label: 'Events' },
  { value: 'offtopic', label: 'Off-topic' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'jobs', label: 'Jobs' },
  { value: 'moderation', label: 'Moderation' },
];

export const DEFAULT_CATEGORY_TYPE = 'general';

// Helper to detect test/debug categories so the UI can hide them until cleaned server-side
export function isTestCategory(cat) {
  if (!cat || !cat.name) return false;
  const n = String(cat.name).trim().toLowerCase();
  return n === 'test' || n.startsWith('test-') || n.endsWith('-test') || n === 'test-category' || n.includes('test');
}
