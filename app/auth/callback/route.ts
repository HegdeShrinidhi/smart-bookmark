import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      // Check if session exchange failed
      if (error) {
        console.error('OAuth session exchange error:', error);
        return NextResponse.redirect(
          `${origin}/?error=${encodeURIComponent('Authentication failed. Please try again.')}`
        );
      }

      // Successful authentication, redirect to home
      return NextResponse.redirect(`${origin}/`);
    } catch (err) {
      console.error('OAuth callback error:', err);
      return NextResponse.redirect(
        `${origin}/?error=${encodeURIComponent('An error occurred during sign in. Please try again.')}`
      );
    }
  }

  // No code provided, redirect home with error
  return NextResponse.redirect(
    `${origin}/?error=${encodeURIComponent('Invalid authentication request.')}`
  );
}
