'use server';

import { createClient } from '@/lib/supabase/server';
import type { Bookmark, BookmarkInsert, BookmarkUpdate } from '@/types/database';
import { redirect } from 'next/navigation';

// Helper function to escape special PostgREST ILIKE characters
function escapeSearchQuery(query: string): string {
  return query.replace(/[%_\\]/g, '\\$&');
}

// Helper function to validate URL format
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

export async function getBookmarks(searchQuery?: string, tagFilter?: string) {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    return [];
  }

  const supabase = await createClient();
  
  let query = supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (searchQuery) {
    const escapedQuery = escapeSearchQuery(searchQuery);
    query = query.or(`title.ilike.%${escapedQuery}%,description.ilike.%${escapedQuery}%,url.ilike.%${escapedQuery}%`);
  }

  if (tagFilter) {
    query = query.contains('tags', [tagFilter]);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch bookmarks: ${error.message}`);
  }

  return data as Bookmark[];
}

export async function getBookmark(id: string) {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch bookmark: ${error.message}`);
  }

  return data as Bookmark;
}

export async function createBookmark(bookmark: BookmarkInsert) {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Validate URL format
  if (!isValidUrl(bookmark.url)) {
    throw new Error('Invalid URL format. Please provide a valid HTTP or HTTPS URL.');
  }

  // Validate title length
  if (bookmark.tags && bookmark.tags.length > 20) {
    throw new Error('Maximum 20 tags allowed per bookmark.');
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('bookmarks')
    .insert([{
      ...bookmark,
      user_id: user.id,
      tags: bookmark.tags || [],
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create bookmark: ${error.message}`);
  }

  return data as Bookmark;
}

export async function updateBookmark(id: string, updates: BookmarkUpdate) {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('bookmarks')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update bookmark: ${error.message}`);
  }

  return data as Bookmark;
}

export async function deleteBookmark(id: string) {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();
  
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete bookmark: ${error.message}`);
  }

  return { success: true };
}

export async function getAllTags() {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    return [];
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('bookmarks')
    .select('tags')
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to fetch tags: ${error.message}`);
  }

  const allTags = data.flatMap(bookmark => bookmark.tags || []);
  const uniqueTags = Array.from(new Set(allTags)).sort();
  
  return uniqueTags;
}
