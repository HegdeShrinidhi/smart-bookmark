'use client';

import { useState, FormEvent } from 'react';
import { createBookmark } from '@/app/actions/bookmarks';

interface AddBookmarkFormProps {
  onSuccess?: (newBookmark: any) => void;
  onCancel?: () => void;
}

export default function AddBookmarkForm({ onSuccess, onCancel }: AddBookmarkFormProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const newBookmark = await createBookmark({
        url,
        title: title || url,
        description: description || null,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      });

      setUrl('');
      setTitle('');
      setDescription('');
      setTags('');
      onSuccess?.(newBookmark);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bookmark');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow';

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Add New Bookmark</h2>
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          URL *
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className={inputClass}
          placeholder="https://example.com"
        />
      </div>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="Bookmark title (optional)"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="Add a description..."
        />
      </div>
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Tags
        </label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className={inputClass}
          placeholder="tag1, tag2, tag3"
        />
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Separate tags with commas</p>
      </div>
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isLoading || !url}
          className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors"
        >
          {isLoading ? 'Adding…' : 'Add Bookmark'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
