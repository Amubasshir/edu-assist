"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DocumentQueuePage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocs() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("documents")
        .select(`
          id, file_name, file_size_kb, document_type, target_language, status, created_at,
          profiles (first_name, last_name)
        `)
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
        <h1 className="font-serif text-3xl font-semibold text-black">Document Queue</h1>
        <p className="text-sm text-gray mt-1">View the status of all translated and analyzed documents.</p>
      </div>

      <div className="bg-white border border-gray-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray animate-pulse">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center text-gray">No documents found. Upload one to get started!</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-beige-warm border-b border-gray-border">
                <th className="px-6 py-3 text-xs font-semibold text-gray uppercase tracking-wider">Document Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray uppercase tracking-wider">Type / Lang</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray uppercase tracking-wider">Uploaded By</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray uppercase tracking-wider text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-border">
              {documents.map((doc) => {
                const isCompleted = doc.status === "Completed" || doc.status === "Translated";
                const isFlagged = doc.status === "Flagged";
                const isPending = doc.status === "Pending" || doc.status === "In Review";
                
                return (
                  <tr key={doc.id} className="hover:bg-beige/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-beige flex items-center justify-center text-moss">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="text-sm font-semibold text-black truncate max-w-xs">{doc.file_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-sm text-gray">{doc.document_type || "Translation"} ({doc.target_language || "Auto"})</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-sm text-gray">{doc.profiles?.first_name} {doc.profiles?.last_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                        isCompleted ? "bg-moss-pale text-moss" : isFlagged ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-gray">{new Date(doc.created_at).toLocaleDateString()}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
