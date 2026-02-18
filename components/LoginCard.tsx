'use client';

import AuthButton from './AuthButton';

export default function LoginCard() {
  return (
    <div className="w-full max-w-md">
      {/* Logo/Icon Section */}
      <div className="mb-8 flex justify-center">
        <div className="relative w-20 h-20 bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 animate-fadeIn">
          <div className="text-white text-4xl font-bold">📑</div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-800/95 shadow-2xl shadow-cyan-500/20 dark:shadow-black/40 border border-slate-200/50 dark:border-slate-700/50 p-8 sm:p-10 text-center backdrop-blur-sm animate-slideUp">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold mb-3 animate-fadeIn animation-delay-100">
          <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 dark:from-teal-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
            Smart Bookmark
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 animate-fadeIn animation-delay-200">
          Organize your digital life
        </p>

        {/* Description */}
        <p className="text-slate-600 dark:text-slate-400 mb-10 text-sm sm:text-base leading-relaxed animate-fadeIn animation-delay-300">
          Save and organize your favorite bookmarks with powerful tagging and search capabilities.
        </p>

        {/* Auth Button */}
        <div className="animate-fadeIn animation-delay-400">
          <AuthButton />
        </div>

        {/* Footer Text */}
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-8 animate-fadeIn animation-delay-500">
          Secure authentication with Google
        </p>
      </div>
    </div>
  );
}
