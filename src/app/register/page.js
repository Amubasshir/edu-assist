"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Directs user to OTP page, passing their email
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-beige-warm font-sans text-black animate-fade-in-up">
      <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-border relative overflow-hidden">
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
            Create an account
          </h2>
          <p className="text-center text-sm text-gray mb-8">
            Start your 14-day free trial, no credit card required.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="first-name" className="block text-sm font-medium text-charcoal mb-1.5">
                  First name
                </label>
                <input
                  id="first-name"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-border placeholder-gray-light text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-moss focus:border-moss sm:text-sm transition-shadow"
                  placeholder="Sarah"
                />
              </div>
              <div>
                <label htmlFor="last-name" className="block text-sm font-medium text-charcoal mb-1.5">
                  Last name
                </label>
                <input
                  id="last-name"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-border placeholder-gray-light text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-moss focus:border-moss sm:text-sm transition-shadow"
                  placeholder="Jenkins"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-1.5">
                School or District Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-border placeholder-gray-light text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-moss focus:border-moss sm:text-sm transition-shadow"
                placeholder="s.jenkins@district.edu"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-border placeholder-gray-light text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-moss focus:border-moss sm:text-sm transition-shadow"
                placeholder="Create a strong password"
              />
              <p className="mt-1.5 text-xs text-gray-light">Must be at least 8 characters long.</p>
            </div>
          </div>

          <div className="flex items-start mt-4">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-moss focus:ring-moss border-gray-border rounded cursor-pointer accent-moss"
              />
            </div>
            <div className="ml-2 text-sm">
              <label htmlFor="terms" className="text-gray cursor-pointer">
                I agree to the{" "}
                <a href="#" className="font-medium text-moss hover:text-moss-light">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="font-medium text-moss hover:text-moss-light">
                  Privacy Policy
                </a>.
              </label>
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
               {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-border text-center">
          <p className="text-sm text-gray">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-moss hover:text-moss-light transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
