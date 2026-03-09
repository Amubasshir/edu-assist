import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    const { email, name, role, org_id } = await req.json();

    if (!email || !org_id) {
      return NextResponse.json({ error: "Email and Org ID required" }, { status: 400 });
    }

    // 1. Invite the user via Supabase Auth Admin
    // This sends an invite email. The user will click the link and set their password.
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        first_name: name.split(" ")[0] || "",
        last_name: name.split(" ").slice(1).join(" ") || "",
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Add them to organization_members table
    const { error: memberError } = await supabaseAdmin
      .from("organization_members")
      .insert({
        org_id,
        user_id: userId,
        role: role || "Member",
        status: "Invited"
      });

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
