'use client';

import { useState } from 'react';
import { deleteBookmark } from '@/app/actions/bookmarks';
import type { Bookmark } from '@/types/database';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onDelete?: (bookmarkId: string) => void;
}

export default function BookmarkCard({ bookmark, onDelete }: BookmarkCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this bookmark?');
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteBookmark(bookmark.id);
      if (result.success) {
        // Pass bookmark ID to callback for immediate UI update
        onDelete?.(bookmark.id);
      } else {
        alert('Failed to delete bookmark');
        setIsDeleting(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete bookmark';
      alert(errorMessage);
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <article className="card p-5 h-full flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors underline-offset-2 hover:underline"
            >
              {bookmark.title}
            </a>
          </h3>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2 block truncate"
          >
            {bookmark.url}
          </a>
          {bookmark.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
              {bookmark.description}
            </p>
          )}
          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {bookmark.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Added {formatDate(bookmark.created_at)}
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="shrink-0 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
          title="Delete bookmark"
        >
          {isDeleting ? '…' : 'Delete'}
        </button>
      </div>
    </article>
  );
}
