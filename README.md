# Smart Bookmark App
Smart Bookmark is a modern bookmark management application built with Next.js and Supabase. It provides secure Google authentication, real-time synchronization, and strict data isolation using Row Level Security
The project demonstrates full-stack development using the Next.js App Router architecture, server actions, Supabase authentication, and real-time database subscriptions.

## Features

- **🔐 Google OAuth** - One-click sign-in with Google
- **📑 Smart Organization** - Add and delete bookmarks instantly
- **🔒 Private & Secure** - Your bookmarks, only you can see them
- **⚡ Real-time Sync** - Changes sync across all open tabs instantly
- **🎨 Beautiful UI** - Responsive design 

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS, PostCSS |
| Backend | Supabase (Auth, Database, Realtime) |
| Testing | Jest, React Testing Library |

### Prerequisites

### Installation


# Clone and install
git clone <repo-url>
cd smart-bookmark
npm install

# Run development server
npm run dev
```

Navigate to `http://localhost:3000`

## ⚙️ Setup Supabase

1. **Create a new Supabase project**

2. **Run the database migration:**
   - Go to SQL Editor in Supabase dashboard
   - Run: `supabase/migrations/001_create_bookmarks_table.sql`

3. **Enable Google OAuth:**
   - Auth → Providers → Google
   - Add credentials from Google Cloud Console
   - Authorized URIs:
     - Development: `http://localhost:3000/auth/callback`
     - Production: `https://your-domain.vercel.app/auth/callback`

4. **Set environment variables** (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Deployment to Vercel

1. **Push to GitHub** and connect to Vercel
2. **Add environment variables in Vercel dashboard:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
   ```
3. **⚠️ IMPORTANT:** Update Supabase OAuth redirect URLs to include your Vercel domain
4. Deploy!

## Key Technical Implementations
1. Production-Ready Authentication Architecture

Designed a secure Google OAuth flow using @supabase/ssr, ensuring seamless authentication across server and client components with proper cookie management.

2. Database-Level Security with Row Level Security (RLS)

Implemented strict PostgreSQL RLS policies to guarantee complete user data isolation at the database layer, preventing unauthorized access.

3. Real-Time Data Synchronization

Integrated Supabase Realtime subscriptions to enable instant UI updates across multiple active sessions without manual refresh.

4. Environment-Aware OAuth Redirect Handling

Engineered a dynamic redirect system using environment variables to support both development and production deployments without hardcoded URLs.

5. Secure Server Actions with User Context

Developed auth-aware server actions that validate the authenticated user before executing database operations, ensuring secure backend logic.

6. Automated Session Management

Built middleware to automatically refresh authentication sessions on every request, improving reliability and user experience.

## 📂 Project Structure

```
smart-bookmark/
├── app/
│   ├── actions/           # Server actions (auth, bookmarks)
│   ├── auth/              # OAuth callback handler
│   └── page.tsx           # Main app page
├── components/            # React components
│   ├── AddBookmarkForm.tsx
│   ├── AuthButton.tsx
│   └── BookmarkCard.tsx
├── lib/supabase/         # Supabase client setup
├── supabase/migrations/  # Database schema
├── types/                # TypeScript types
└── middleware.ts         # Session refresh
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📝 Available Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests
```

## 📄 License

MIT © 2026

