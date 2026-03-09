"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [userRole, setUserRole] = useState("Member");
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Profile forms
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Get Session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        setSession(session);

      // 2. Get Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        setFirstName(profileData.first_name || session.user.user_metadata?.first_name || "");
        setLastName(profileData.last_name || session.user.user_metadata?.last_name || "");
      }

      // 3. Get Organization via organization_members
      const { data: memberData } = await supabase
        .from("organization_members")
        .select("org_id, role")
        .eq("user_id", session.user.id)
        .single();
      
      if (memberData?.org_id) {
        setUserRole(memberData.role);
        
        // fetch Org Details
        const { data: orgData } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", memberData.org_id)
          .single();
        
        setOrganization(orgData);

        // fetch Team Members
        const { data: teamData } = await supabase
          .from("organization_members")
          .select(`
            id, role, status,
            profiles (
              first_name, last_name, id
            )
          `)
          .eq("org_id", memberData.org_id);

        if (teamData) {
          // Format the team data
          const formatted = teamData.map(tm => ({
            id: tm.id,
            name: `${tm.profiles?.first_name || ""} ${tm.profiles?.last_name || ""}`.trim() || "Unknown User",
            email: "(email hidden)", // Real email exists in auth.users, but accessible to admins normally.
            role: tm.role,
            status: tm.status
          }));
          setTeamMembers(formatted);
        }
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  }
  loadData();
  }, []);

  const handleUpdateProfile = async () => {
    if (!session?.user?.id) return;
    const { error } = await supabase
      .from("profiles")
      .update({ first_name: firstName, last_name: lastName })
      .eq("id", session.user.id);
    
    if (!error) {
      alert("Profile updated successfully!");
    } else {
      alert("Error updating profile.");
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;
    
    setIsInviting(true);
    try {
      const res = await fetch("/api/invite-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          name: inviteName,
          role: inviteRole,
          org_id: organization?.id
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Successfully sent invite to ${inviteEmail}`);
        setShowInviteModal(false);
        setInviteEmail("");
        setInviteName("");
        
        // Optimistically add to list
        setTeamMembers(prev => [...prev, {
          id: Math.random().toString(),
          name: inviteName,
          email: inviteEmail,
          role: inviteRole,
          status: "Invited",
        }]);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert("Failed to send invite");
    } finally {
      setIsInviting(false);
    }
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType: userPlan === "Starter" ? "Professional" : "District",
          orgId: organization?.id,
          userId: session?.user?.id
        })
      });
      const data = await res.json();
      if (data.url) {
        // In mock mode, data.url is something like '/dashboard/settings?mock_payment=success&plan=Professional'
        const newPlan = userPlan === "Starter" ? "Professional" : "District";
        
        // Also update the backend so team features unlock permanently!
        if (organization?.id) {
          await supabase
            .from("organizations")
            .update({ plan_type: newPlan })
            .eq("id", organization.id);
        }

        // Just directly update the organization state so UI instantly updates!
        setOrganization(prev => ({
          ...prev,
          plan_type: newPlan
        }));
        alert("Payment successful! Your plan has been upgraded.");
      }
    } catch (err) {
      alert("Failed to initiate checkout");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray text-sm animate-pulse">Loading settings...</div>;
  }

  const userPlan = organization?.plan_type || "Starter";
  const usedCredits = organization?.documents_this_month || 0;
  const totalCredits = organization?.max_documents || 25;
  const isMultiUser = userPlan !== "Starter";
  const canInvite = isMultiUser && (userRole === "Admin" || userRole === "Owner");
  
  const calcPercent = (used, total) => {
    if (userPlan !== "Starter") return (used / 500) * 100; // Visual scale for unlimited
    return Math.min((used / total) * 100, 100);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-black">Settings & Team</h1>
        <p className="text-sm text-gray mt-1">Manage your account, billing, and team members.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-border">
        {["profile", "billing", "team"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium capitalize transition-colors relative ${
              activeTab === tab ? "text-moss" : "text-gray hover:text-black"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-moss"></div>
            )}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      
      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6 max-w-2xl animate-fade-slide">
          <div className="bg-white border border-gray-border rounded-xl p-6 shadow-sm">
            <h3 className="font-serif text-xl font-semibold text-black mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5 uppercase tracking-wider">First Name</label>
                  <input 
                    type="text" 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-border rounded-md focus:outline-none focus:ring-1 focus:ring-moss focus:border-moss" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5 uppercase tracking-wider">Last Name</label>
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-border rounded-md focus:outline-none focus:ring-1 focus:ring-moss focus:border-moss" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  value={session?.user?.email || ""} 
                  disabled 
                  className="w-full px-4 py-2 border border-gray-border bg-gray-50 rounded-md focus:outline-none text-gray" 
                />
              </div>
              <button onClick={handleUpdateProfile} className="bg-moss text-white px-5 py-2 rounded-md font-semibold text-sm hover:bg-moss-light transition-colors mt-2">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing & Usage Tab */}
      {activeTab === "billing" && (
        <div className="space-y-6 max-w-3xl animate-fade-slide">
          <div className="bg-white border border-gray-border rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-serif text-xl font-semibold text-black">Current Plan</h3>
                <div className="inline-flex items-center gap-2 mt-2">
                  <span className="bg-moss-pale text-moss text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">{userPlan} Plan</span>
                  <span className="text-sm text-gray">{userPlan === "Starter" ? "$49/mo" : userPlan === "Professional" ? "$199/mo" : "Custom"}</span>
                </div>
              </div>
              <button onClick={handleCheckout} className="border border-gray-border text-charcoal px-4 py-2 rounded-md text-sm font-semibold hover:border-moss hover:text-moss transition-colors">
                Change Plan
              </button>
            </div>

            <div className="bg-beige rounded-lg p-5">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-black">Document Usage (This Month)</span>
                <span className="text-sm text-gray font-medium">
                  {usedCredits} / {userPlan !== "Starter" ? "Unlimited" : totalCredits}
                </span>
              </div>
              <div className="h-2.5 bg-gray-border rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${userPlan === "Starter" && usedCredits >= (totalCredits * 0.8) ? "bg-red-500" : "bg-moss"}`} 
                  style={{ width: `${calcPercent(usedCredits, totalCredits)}%` }}
                ></div>
              </div>
              {userPlan === "Starter" ? (
                <p className="text-xs text-gray mt-2">You have used {((usedCredits/totalCredits) * 100).toFixed(0)}% of your monthly allotment. <a href="#" className="text-moss font-semibold hover:underline">Upgrade for unlimited.</a></p>
              ) : (
                <p className="text-xs text-gray mt-2">You have unlimited document processing on this plan.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Team Tab */}
      {activeTab === "team" && (
        <div className="space-y-6 animate-fade-slide">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-border rounded-xl p-6 shadow-sm">
             <div>
                <h3 className="font-serif text-xl font-semibold text-black">{organization?.name || "Team Members"}</h3>
                <p className="text-sm text-gray mt-1">
                  {isMultiUser 
                    ? "Manage access for educators in your district." 
                    : "The Starter plan only supports a single user."}
                </p>
             </div>
             {canInvite && (
               <button 
                onClick={() => setShowInviteModal(true)}
                className="bg-moss text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-moss-light transition-colors flex items-center gap-2"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                 Invite Member
               </button>
             )}
          </div>

          {/* Invite Modal */}
          {showInviteModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-serif text-xl font-semibold">Invite Team Member</h3>
                  <button onClick={() => setShowInviteModal(false)} className="text-gray hover:text-black">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-1.5">Full Name</label>
                    <input required type="text" value={inviteName} onChange={e=>setInviteName(e.target.value)} className="w-full px-4 py-2 border border-gray-border rounded-md focus:ring-1 focus:ring-moss focus:outline-none" placeholder="David Kim"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-1.5">Email Address</label>
                    <input required type="email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-border rounded-md focus:ring-1 focus:ring-moss focus:outline-none" placeholder="d.kim@district.edu"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-1.5">Role</label>
                    <select value={inviteRole} onChange={e=>setInviteRole(e.target.value)} className="w-full px-4 py-2 border border-gray-border rounded-md focus:ring-1 focus:ring-moss focus:outline-none bg-white">
                      <option value="Admin">Admin</option>
                      <option value="Member">Member</option>
                    </select>
                  </div>
                  <button type="submit" disabled={isInviting} className="w-full bg-moss text-white py-2.5 rounded-md font-semibold hover:bg-moss-light disabled:opacity-50 mt-2">
                    {isInviting ? "Sending Invite..." : "Send Invite"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {!isMultiUser ? (
             <div className="bg-beige border border-gray-border rounded-xl p-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-moss mb-4 shadow-sm">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                </div>
                <h4 className="font-serif text-lg font-semibold text-black mb-2">Team management unavailable</h4>
                <p className="text-sm text-gray max-w-sm mb-6">Upgrade to the District or Professional plan to add team members, share document history, and manage district compliance together.</p>
                <button className="bg-black text-white px-6 py-2.5 rounded-md font-semibold text-sm hover:bg-charcoal transition-colors">
                  View Upgrade Options
                </button>
             </div>
          ) : (
            <div className="bg-white border border-gray-border rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-beige-warm border-b border-gray-border">
                    <th className="px-6 py-3 text-xs font-semibold text-gray uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-border">
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-beige/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-moss-pale text-moss flex items-center justify-center font-serif text-xs font-bold shrink-0">
                            {member.name.charAt(0) || "U"}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-black">{member.name}</div>
                            <div className="text-xs text-gray">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-charcoal">{member.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          member.status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${member.status === "Active" ? "bg-green-500" : "bg-yellow-500"}`}></span>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {canInvite && (
                          <button className="text-gray hover:text-moss text-sm font-medium transition-colors">
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
