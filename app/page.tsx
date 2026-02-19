'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getBookmarks, getAllTags } from './actions/bookmarks';
import type { Bookmark } from '@/types/database';
import type { User } from '@supabase/supabase-js';
import BookmarkCard from '@/components/BookmarkCard';
import AddBookmarkForm from '@/components/AddBookmarkForm';
import AuthButton from '@/components/AuthButton';
import LoginCard from '@/components/LoginCard';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(() => {
    // Show loading spinner if OAuth callback is happening
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).has('code');
    }
    return false;
  });
  const [error, setError] = useState<string | null>(null);

  const loadBookmarks = async () => {
    if (!user) return;
    setError(null);
    try {
      const data = await getBookmarks(
        searchQuery || undefined,
        selectedTag || undefined
      );
      setBookmarks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookmarks');
    }
  };

  const loadTags = async () => {
    if (!user) return;
    try {
      const tags = await getAllTags();
      setAllTags(tags);
    } catch (err) {
      console.error('Failed to load tags:', err);
    }
  };

  // Check authentication status
  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    // Listen for auth changes - this is the source of truth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        setIsLoading(false); // Stop loading after auth state is determined
        if (session?.user) {
          loadBookmarks();
          loadTags();
        } else {
          setBookmarks([]);
          setAllTags([]);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load bookmarks when user is authenticated
  useEffect(() => {
    if (user) {
      loadBookmarks();
      loadTags();
    }
  }, [user, searchQuery, selectedTag]);

  // Set up real-time subscription for bookmarks
  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    const channel = supabase
      .channel('bookmarks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time update:', payload);

          // Helper function to check if bookmark matches current filters
          const matchesFilters = (bookmark: Bookmark): boolean => {
            // Check tag filter
            if (selectedTag && !bookmark.tags?.includes(selectedTag)) {
              return false;
            }
            // Check search query
            if (searchQuery) {
              const query = searchQuery.toLowerCase();
              return (
                bookmark.title.toLowerCase().includes(query) ||
                bookmark.url.toLowerCase().includes(query) ||
                (bookmark.description?.toLowerCase()?.includes(query) ?? false)
              );
            }
            return true;
          };

          if (payload.eventType === 'INSERT') {
            const newBookmark = payload.new as Bookmark;
            if (matchesFilters(newBookmark)) {
              setBookmarks((prev) => [newBookmark, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedBookmark = payload.new as Bookmark;
            setBookmarks((prev) =>
              updatedBookmark.id && matchesFilters(updatedBookmark)
                ? prev.map((bookmark) =>
                    bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark
                  )
                : prev.filter((bookmark) => bookmark.id !== updatedBookmark.id)
            );
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((prev) =>
              prev.filter((bookmark) => bookmark.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, searchQuery, selectedTag]);

  const handleBookmarkAdded = (newBookmark: Bookmark) => {
    setShowAddForm(false);
    // Add new bookmark to state immediately
    setBookmarks((prev) => [newBookmark, ...prev]);
    // Also reload tags in case new tags were added
    loadTags();
  };

  const handleBookmarkDeleted = (bookmarkId?: string) => {
    // If bookmarkId provided, remove it directly
    if (bookmarkId) {
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
    }
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 animate-spin">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"></div>
          </div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse"></div>

        <main className="w-full max-w-md flex flex-col items-center justify-center relative z-10">
          <LoginCard />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
              Smart Bookmark
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Organize and manage your bookmarks efficiently
            </p>
          </div>
          <AuthButton />
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookmarks..."
              className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              {showAddForm ? 'Cancel' : '+ Add Bookmark'}
            </button>
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag('')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  selectedTag === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {showAddForm && (
          <div className="mb-6">
            <AddBookmarkForm
              onSuccess={handleBookmarkAdded}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="card text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">Loading bookmarks…</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {bookmarks.length === 0 ? (
              <div className="card text-center py-12 px-6">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {searchQuery || selectedTag
                    ? 'No bookmarks found matching your criteria.'
                    : 'No bookmarks yet. Add your first bookmark to get started!'}
                </p>
                {!showAddForm && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Add Your First Bookmark
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {bookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    onDelete={handleBookmarkDeleted}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {!isLoading && bookmarks.length > 0 && (
          <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            Showing {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
          </div>
        )}
      </main>
    </div>
  );
}
