"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      email: emailParam,
      token: otp,
      type: "signup",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-border relative overflow-hidden animate-fade-in-up">
      {/* Decorative Top Accent */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-moss"></div>

      <div className="text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-2.5 mb-6 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-moss rounded-md flex items-center justify-center shadow-md">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="font-serif text-2xl font-semibold tracking-wide text-black">
            Edu<span className="text-moss">Assist</span>
          </div>
        </Link>
        <h2 className="text-center font-serif text-3xl font-bold text-black mb-2">Check your email</h2>
        <p className="text-center text-sm text-gray mb-8">
          We sent a verification code to <br/>
          <span className="font-semibold text-charcoal">{emailParam || "your email"}</span>.
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleVerify}>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-charcoal mb-1.5">
            Verification Code
          </label>
          <input
            id="otp"
            type="text"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="appearance-none relative block w-full px-4 py-3 border border-gray-border placeholder-gray-light text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-moss focus:border-moss sm:text-sm text-center tracking-[0.5em] font-semibold"
            placeholder="123456"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !otp}
          className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white transition-all shadow-md ${
            loading || !otp ? "bg-moss-light cursor-not-allowed" : "bg-moss hover:bg-moss-light hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-moss focus:ring-offset-white"
          }`}
        >
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>
      </form>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-beige-warm font-sans text-black">
      <Suspense fallback={<div>Loading...</div>}>
         <VerifyOtpContent />
      </Suspense>
    </div>
  );
}
