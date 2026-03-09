'use client'

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardOverview() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: memberData } = await supabase
        .from("organization_members")
        .select("org_id")
        .eq("user_id", session.user.id)
        .single();

      if (!memberData) return;

      // Get org stats
      const { data: orgData } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", memberData.org_id)
        .single();
      
      // Get documents
      const { data: docs } = await supabase
        .from("documents")
        .select("*")
        .eq("org_id", memberData.org_id)
        .order("created_at", { ascending: false });

      if (orgData && docs) {
        setStats({
          translated: docs.filter(d => d.document_type === "Translation").length,
          analyzed: docs.filter(d => d.document_type === "QA Review").length,
          flags: docs.filter(d => d.status === "Flagged").length,
          used: orgData.documents_this_month,
          total: orgData.plan_type === "Starter" ? orgData.max_documents : "unlim",
          plan: orgData.plan_type
        });
        setRecentDocs(docs.slice(0, 4));
      }
      setLoading(false);
    }
    loadDashboard();
  }, []);

  if (loading) return <div className="animate-pulse p-8 text-gray">Loading dashboard...</div>;
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-black">Dashboard</h1>
          <p className="text-sm text-gray mt-1">Overview of your recent activity and documents.</p>
        </div>
        <button onClick={() => router.push("/dashboard/translations")} className="bg-moss text-white px-5 py-2.5 rounded-md font-semibold text-sm hover:bg-moss-light transition-colors shadow-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Analysis
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Documents Translated", val: stats?.translated || 0, trend: "Overall" },
          { label: "Reports Analyzed", val: stats?.analyzed || 0, trend: "Overall" },
          { label: "Compliance Flags", val: stats?.flags || 0, trend: stats?.flags > 0 ? "Needs review" : "All clean", isAlert: stats?.flags > 0 },
          { label: "Credits Used", val: `${stats?.used || 0}/${stats?.total}`, trend: `${stats?.plan || "Starter"} Plan` },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-border rounded-xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-gray uppercase tracking-wider mb-2">{stat.label}</div>
            <div className="font-serif text-3xl font-semibold text-black mb-1.5">{stat.val}</div>
            <div className={`text-xs font-medium ${stat.isAlert ? "text-red-500" : "text-moss"}`}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold text-black">Recent Documents</h2>
            <Link href="/dashboard/queue" className="text-sm font-medium text-moss hover:text-moss-light">
              View all
            </Link>
          </div>
          
          <div className="bg-white border border-gray-border rounded-xl shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-border">
              {recentDocs.length === 0 ? (
                <li className="p-8 text-center text-sm text-gray">No activity yet.</li>
              ) : recentDocs.map((doc, i) => {
                const isCompleted = doc.status === "Completed" || doc.status === "Translated";
                const isFlagged = doc.status === "Flagged";
                const color = isCompleted ? "text-moss bg-moss-pale" : isFlagged ? "text-red-800 bg-red-100" : "text-yellow-800 bg-yellow-100";
                
                return (
                  <li key={i} className="p-4 hover:bg-beige-warm transition-colors flex items-center justify-between gap-4 cursor-pointer">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 shrink-0 bg-beige rounded-lg flex items-center justify-center text-gray">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="truncate">
                        <div className="text-sm font-semibold text-black truncate">{doc.file_name}</div>
                        <div className="text-xs text-gray mt-0.5">{doc.document_type} • {new Date(doc.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap ${color}`}>
                      {doc.status}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold text-black">Quick Actions</h2>
          <div className="grid gap-3">
            {[
              { label: "Translate Document", desc: "40+ languages", icon: "translate", action: () => router.push("/dashboard/translations") },
              { label: "Analyze Report", desc: "Extract findings", icon: "search", action: () => router.push("/dashboard/qa") },
              { label: "Check Compliance", desc: "IDEA standards", icon: "shield", action: () => router.push("/dashboard/qa") }
            ].map((action, i) => (
              <button key={i} onClick={action.action} className="flex items-center gap-4 p-4 text-left bg-white border border-gray-border rounded-xl hover:border-moss hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-lg bg-beige group-hover:bg-moss-pale flex items-center justify-center text-charcoal group-hover:text-moss transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-black">{action.label}</div>
                  <div className="text-xs text-gray mt-0.5">{action.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
