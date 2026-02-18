export interface Bookmark {
  id: string;
  user_id: string;
  url: string;
  title: string;
  description: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface BookmarkInsert {
  url: string;
  title: string;
  description?: string | null;
  tags?: string[];
}

export interface BookmarkUpdate {
  url?: string;
  title?: string;
  description?: string | null;
  tags?: string[];
}
