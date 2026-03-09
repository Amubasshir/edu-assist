"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-beige-warm font-sans text-black animate-fade-in-up">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-border relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-moss"></div>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2.5 mb-6 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-moss rounded-md flex items-center justify-center shadow-md">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="font-serif text-2xl font-semibold tracking-wide text-black">
              Edu<span className="text-moss">Assist</span>
            </div>
          </Link>
          <h2 className="text-center font-serif text-3xl font-bold text-black mb-2">
            Welcome back
          </h2>
          <p className="text-center text-sm text-gray mb-8">
            Sign in to access your dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-border placeholder-gray-light text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-moss focus:border-moss sm:text-sm transition-shadow"
                placeholder="you@district.edu"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-border placeholder-gray-light text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-moss focus:border-moss sm:text-sm transition-shadow"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-moss focus:ring-moss border-gray-border rounded cursor-pointer accent-moss"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray cursor-pointer">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-semibold text-moss hover:text-moss-light transition-colors">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white transition-all shadow-md mt-6 ${
                loading ? "bg-moss-light cursor-not-allowed" : "bg-moss hover:bg-moss-light hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-moss focus:ring-offset-white"
              }`}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-border text-center">
          <p className="text-sm text-gray">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-moss hover:text-moss-light transition-colors">
              Sign up today
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
