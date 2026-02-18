# Supabase Setup Guide

This application requires a Supabase database to store bookmarks. Follow these steps to set up your database:

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Wait for the project to be fully initialized

## 2. Create the Bookmarks Table

Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor):

Run the SQL from `supabase/migrations/001_create_bookmarks_table.sql` or copy this:

```sql
-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure description and tags columns exist (for tables created before they were added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookmarks' AND column_name = 'description'
  ) THEN
    ALTER TABLE bookmarks ADD COLUMN description TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookmarks' AND column_name = 'tags'
  ) THEN
    ALTER TABLE bookmarks ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_title ON bookmarks USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_bookmarks_description ON bookmarks USING gin(to_tsvector('english', COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_bookmarks_tags ON bookmarks USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations for anon users" ON bookmarks;

-- Policy: Users can only see their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only insert their own bookmarks
CREATE POLICY "Users can insert own bookmarks" ON bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own bookmarks
CREATE POLICY "Users can update own bookmarks" ON bookmarks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks" ON bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable Realtime for bookmarks table
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

## 3. Configure Google OAuth

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Find **Google** in the list and click to enable it
3. You'll need Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable Google+ API
   - Go to **Credentials** → **Create Credentials** → **OAuth client ID**
   - Choose **Web application**
   - Add authorized redirect URIs:
     - `https://<your-project-ref>.supabase.co/auth/v1/callback` (for Supabase)
     - `http://localhost:3000/auth/callback` (for local development)
     - `https://your-domain.vercel.app/auth/callback` (for production)
   - Copy the **Client ID** and **Client Secret**
4. Paste these credentials into Supabase Google provider settings
5. Save the configuration

## 4. Get Your API Credentials

1. Go to your Supabase project settings
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (this is your `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## 5. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
   
   Note: For production, set `NEXT_PUBLIC_SITE_URL` to your Vercel deployment URL.

## 6. Restart Your Development Server

After setting up the environment variables, restart your Next.js development server:

```bash
npm run dev
```

## Security Note

The RLS policies are configured to ensure:
- Users can only see their own bookmarks
- Users can only create bookmarks for themselves
- Users can only update/delete their own bookmarks
- All operations require authentication

The application uses Supabase Auth with Google OAuth, ensuring secure authentication and proper user isolation.
