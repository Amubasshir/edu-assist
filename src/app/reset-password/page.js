"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tokenExtracted, setTokenExtracted] = useState(false);

  useEffect(() => {
    // Extract token from URL hash (Supabase puts access_token in the hash fragment for implicit flow)
    const hash = window.location.hash;
    
    // Supabase JS v2 now generally handles the hash parameters and sets the session automatically
    // during the auth flow (if the client is initialized). 
    // However, if we're on this page and we have an active session from recovery, we're good.
    const setupRecovery = async () => {
      // First check if there's a hash with access_token (manual extraction as per request)
      if (hash && hash.includes("access_token")) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");
        const type = params.get("type");

        if (accessToken && type === "recovery") {
          // Set the session with the recovery token
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: params.get("refresh_token") || "",
          });
          
          if (sessionError) {
            setError("Invalid or expired reset link. Please request a new one.");
          } else {
            setTokenExtracted(true);
          }
        } else {
          setError("Invalid reset link. Please request a new password reset.");
        }
      } else {
        // As a fallback, check if supabase already consumed the URL and gave us a session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setTokenExtracted(true);
        } else {
          setError("No reset token found. Please request a new password reset.");
        }
      }
    };

    setupRecovery();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Update password using Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || "Failed to update password");
        setLoading(false);
        return;
      }

      // Password updated successfully
      setSuccess(true);
      
      // Auto redirect to dashboard using the active session from the reset
      setTimeout(() => {
        router.replace("/dashboard");
      }, 2000);

    } catch (err) {
      console.error(err);
      setError("An error occurred while updating your password. Please try again.");
    } finally {
      setLoading(false);
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
            Set New Password
          </h2>
          <p className="text-center text-sm text-gray mb-8">
            Create a new, strong password for your account.
          </p>
        </div>

        {error && !tokenExtracted ? (
          <div className="text-center space-y-6">
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
              {error}
            </div>
            <Link
              href="/forgot-password"
              className="inline-block font-semibold text-moss hover:text-moss-light transition-colors text-sm"
            >
              Request a new reset link
            </Link>
          </div>
        ) : success ? (
          <div className="text-center space-y-6">
            <div className="bg-green-50 text-green-800 p-4 rounded-lg text-sm border border-green-200">
              Password updated successfully! Redirecting to your dashboard...
            </div>
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
                <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-1.5">
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-border placeholder-gray-light text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-moss focus:border-moss sm:text-sm transition-shadow"
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-charcoal mb-1.5">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-border placeholder-gray-light text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-moss focus:border-moss sm:text-sm transition-shadow"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !password || !confirmPassword || !tokenExtracted}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white transition-all shadow-md mt-6 ${
                  loading || !password || !confirmPassword || !tokenExtracted
                    ? "bg-moss-light cursor-not-allowed" 
                    : "bg-moss hover:bg-moss-light hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-moss focus:ring-offset-white"
                }`}
              >
                {loading ? "Updating..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
