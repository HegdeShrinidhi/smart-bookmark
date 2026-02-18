# Smart Bookmark App

A modern bookmark management application built with Next.js, Supabase, and Tailwind CSS. Users can sign in with Google OAuth, add bookmarks with URLs and titles, and manage their private bookmark collection with real-time updates.

## Features

- 🔐 **Google OAuth Authentication** - Secure sign-in with Google accounts only
- 📑 **Bookmark Management** - Add bookmarks with URL and title
- 🔒 **Private Bookmarks** - Each user can only see and manage their own bookmarks
- ⚡ **Real-time Updates** - Bookmarks update instantly across all open tabs without page refresh
- 🗑️ **Delete Functionality** - Users can delete their own bookmarks
- 🎨 **Modern UI** - Clean, responsive design with dark mode support

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Backend/Database:** Supabase (Authentication, Database, Realtime)
- **Styling:** Tailwind CSS
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account ([sign up here](https://supabase.com))

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd smart-bookmark
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the migration file: `supabase/migrations/001_create_bookmarks_table.sql`
   - Enable Google OAuth in Authentication → Providers → Google
   - Add your Google OAuth credentials (Client ID and Client Secret)
   - Configure the redirect URL: `http://localhost:3000/auth/callback` (for development)
   - For production, add: `https://your-domain.vercel.app/auth/callback`

4. **Configure environment variables**
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     NEXT_PUBLIC_SITE_URL=http://localhost:3000
     ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your Vercel deployment URL)
4. Update Supabase redirect URLs to include your Vercel domain
5. Deploy!

## Problems Encountered and Solutions

### 1. **Supabase Authentication with Next.js App Router**

**Problem:** Initially tried to use the standard `@supabase/supabase-js` client, but it doesn't properly handle server-side authentication and cookie management in Next.js App Router.

**Solution:** Switched to `@supabase/ssr` package which provides:
- `createBrowserClient` for client components
- `createServerClient` for server components and server actions
- Proper cookie handling for session management
- Middleware integration for refreshing sessions

**Files affected:**
- `lib/supabase/client.ts` - Uses `createBrowserClient`
- `lib/supabase/server.ts` - Uses `createServerClient` with cookie handling
- `middleware.ts` - Handles session refresh on each request

### 2. **Row Level Security (RLS) Policies for User Privacy**

**Problem:** Initially created a policy that allowed all operations for anonymous users, which meant any user could see and modify any bookmark.

**Solution:** Implemented proper RLS policies that:
- Filter bookmarks by `user_id` matching `auth.uid()`
- Ensure users can only SELECT, INSERT, UPDATE, and DELETE their own bookmarks
- Added `user_id` column with foreign key reference to `auth.users`

**Files affected:**
- `supabase/migrations/001_create_bookmarks_table.sql` - Updated RLS policies
- `app/actions/bookmarks.ts` - Added user authentication checks and filtering

### 3. **Real-time Updates Across Tabs**

**Problem:** Needed to implement real-time synchronization so when a bookmark is added/deleted in one tab, it appears/disappears in other open tabs without manual refresh.

**Solution:** Used Supabase Realtime subscriptions:
- Enabled Realtime publication for the `bookmarks` table
- Created a channel subscription in the React component
- Filtered events by `user_id` to only receive updates for the current user
- Handled INSERT, UPDATE, and DELETE events to update local state

**Files affected:**
- `supabase/migrations/001_create_bookmarks_table.sql` - Added `ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks`
- `app/page.tsx` - Implemented `useEffect` hook with Supabase channel subscription

### 4. **Server Actions Authentication Context**

**Problem:** Server actions couldn't access the authenticated user context because they run in a separate context from the request.

**Solution:** Created a helper function `getAuthenticatedUser()` that:
- Uses the server-side Supabase client with cookie handling
- Calls `supabase.auth.getUser()` to get the current user
- Returns `null` if not authenticated, allowing graceful handling
- Each server action checks authentication before proceeding

**Files affected:**
- `app/actions/bookmarks.ts` - Added `getAuthenticatedUser()` helper
- All CRUD operations now check for authentication

### 5. **OAuth Callback Handling**

**Problem:** After Google OAuth redirect, needed to exchange the authorization code for a session and redirect to the home page.

**Solution:** Created an API route handler at `/auth/callback`:
- Extracts the `code` from query parameters
- Exchanges it for a session using `supabase.auth.exchangeCodeForSession()`
- Redirects to the home page

**Files affected:**
- `app/auth/callback/route.ts` - Handles OAuth callback

### 6. **Middleware Session Refresh**

**Problem:** Server components and server actions need fresh session data, but sessions can expire.

**Solution:** Created middleware that:
- Runs on every request (except static assets)
- Refreshes the session using `supabase.auth.getUser()`
- Updates cookies if the session is refreshed
- Ensures server components always have current auth state

**Files affected:**
- `middleware.ts` - Handles session refresh on each request

## Project Structure

```
smart-bookmark/
├── app/
│   ├── actions/
│   │   ├── auth.ts          # Authentication server actions
│   │   └── bookmarks.ts     # Bookmark CRUD server actions
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts     # OAuth callback handler
│   ├── layout.tsx            # Root layout
│   └── page.tsx             # Main application page
├── components/
│   ├── AddBookmarkForm.tsx  # Form to add new bookmarks
│   ├── AuthButton.tsx        # Login/logout button
│   └── BookmarkCard.tsx     # Individual bookmark display
├── lib/
│   └── supabase/
│       ├── client.ts        # Browser Supabase client
│       └── server.ts         # Server Supabase client
├── supabase/
│   └── migrations/
│       └── 001_create_bookmarks_table.sql
├── types/
│   └── database.ts          # TypeScript types
├── middleware.ts            # Next.js middleware for auth
└── README.md
```

## License

MIT
