"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReportsQAPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocs() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("documents")
        .select(`
          id, file_name, status, created_at,
          profiles (first_name, last_name)
        `)
        .eq("document_type", "QA Review")
        .order("created_at", { ascending: false });

      if (data) {
        setDocuments(data);
      }
      setLoading(false);
    }
    fetchDocs();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-black">Reports QA</h1>
        <p className="text-sm text-gray mt-1">Review flagged documents ensuring compliance with IDEA and state regulations.</p>
      </div>

      <div className="bg-white border border-gray-border rounded-xl p-8 text-center flex flex-col items-center justify-center shadow-sm">
        <div className="w-16 h-16 bg-beige rounded-full flex items-center justify-center text-moss mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-serif text-xl font-semibold text-black mb-2">No Reports Pending QA</h3>
        <p className="text-sm text-gray max-w-sm mb-6">Your document queue is clean! All previously uploaded IEPs and reports are marked as compliant.</p>
        <button className="bg-moss text-white px-6 py-2.5 rounded-md font-semibold text-sm hover:bg-moss-light transition-colors">
          Upload New Document
        </button>
      </div>
    </div>
  );
}
