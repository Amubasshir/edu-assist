"use client";

import Link from "next/link";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const redirectTo = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
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
            Reset Password
          </h2>
          <p className="text-center text-sm text-gray mb-8">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="bg-green-50 text-green-800 p-4 rounded-lg text-sm border border-green-200">
              Check your email for the password reset link.
            </div>
            <Link
              href="/login"
              className="inline-block font-semibold text-moss hover:text-moss-light transition-colors text-sm"
            >
              Return to signing in
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !email}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white transition-all shadow-md mt-6 ${
                  loading || !email ? "bg-moss-light cursor-not-allowed" : "bg-moss hover:bg-moss-light hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-moss focus:ring-offset-white"
                }`}
              >
                {loading ? "Sending link..." : "Send Reset Link"}
              </button>
            </div>
            
            <div className="text-center mt-4">
              <Link
                href="/login"
                className="font-semibold text-moss hover:text-moss-light transition-colors text-sm"
              >
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
