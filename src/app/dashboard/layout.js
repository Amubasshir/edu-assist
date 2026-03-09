"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      if (mounted) {
        setSession(session);
        // Also fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", session.user.id)
          .single();

        setProfile(profileData);
        setLoading(false);
      }
    }

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        if (!session) {
          router.replace("/login");
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: "home" },
    { label: "Document Queue", href: "/dashboard/queue", icon: "document" },
    { label: "Translations", href: "/dashboard/translations", icon: "language" },
    { label: "Reports QA", href: "/dashboard/qa", icon: "check" },
    { label: "Team & Usage", href: "/dashboard/settings", icon: "users" },
  ];

  const renderIcon = (iconName) => {
    switch (iconName) {
      case "home":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case "document":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "language":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
        );
      case "check":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case "users":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
     return <div className="min-h-screen bg-beige-warm flex items-center justify-center font-sans tracking-widest uppercase font-semibold text-gray">Loading...</div>;
  }

  const firstName = profile?.first_name || session?.user?.user_metadata?.first_name || "User";
  const lastName = profile?.last_name || session?.user?.user_metadata?.last_name || "";
  const initial = firstName.charAt(0);

  return (
    <div className="min-h-screen bg-beige-warm flex text-black font-sans relative">
      
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden animate-fade-in-up" 
          style={{ animationDuration: "200ms" }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-border flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-border shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-moss rounded-md flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="font-serif text-lg font-semibold tracking-wide">
              Edu<span className="text-moss">Assist</span>
            </div>
          </Link>
          <button 
            className="md:hidden text-gray hover:text-black shrink-0" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <nav className="flex flex-col gap-1.5">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-light px-3 mb-2 mt-2">
              Menu
            </div>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-moss-pale text-moss"
                      : "text-gray hover:bg-beige hover:text-black"
                  }`}
                >
                  <span className={isActive ? "text-moss" : "text-gray-light"}>
                    {renderIcon(item.icon)}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Mini */}
        <div className="p-4 border-t border-gray-border">
          <Link href="/dashboard/settings" className="flex items-center gap-3 hover:bg-beige p-2 rounded-lg transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-moss text-white flex items-center justify-center font-serif text-sm font-bold uppercase">
              {initial}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-semibold truncate">{firstName} {lastName}</div>
              <div className="text-xs text-gray truncate">{session?.user?.email}</div>
            </div>
            <svg className="w-4 h-4 text-gray-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden md:ml-0">
        {/* TOP NAV (MOBILE HEADER + BREADCRUMBS) */}
        <header className="h-16 bg-white border-b border-gray-border flex items-center justify-between px-6 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-gray hover:text-black"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="text-sm font-medium text-gray hidden sm:block">
              Welcome back, {firstName}!
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-gray hover:text-moss transition-colors">
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full border border-white"></span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button onClick={handleLogout} className="text-sm text-gray hover:text-red-600 font-medium transition-colors">
              Log out
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="p-6 lg:p-10 flex-1 max-w-7xl mx-auto w-full animate-fade-in-up">
          {children}
        </main>
      </div>
    </div>
  );
}
