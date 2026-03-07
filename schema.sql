-- schema.sql
-- Run this in the Supabase SQL Editor to configure the project's database

-- 1. Create custom enum types
CREATE TYPE plan_tier AS ENUM ('Starter', 'Professional', 'District');
CREATE TYPE doc_status AS ENUM ('Pending', 'In Review', 'Translated', 'Flagged', 'Completed');
CREATE TYPE user_role AS ENUM ('Owner', 'Admin', 'Member');

-- 2. Organizations Table
-- Represents the team/plan billing unit
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan_type plan_tier NOT NULL DEFAULT 'Starter',
  documents_this_month INT DEFAULT 0,
  max_documents INT DEFAULT 25,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Profiles Table
-- Extends the auth.users table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Organization Members Table
-- Links users to an organization
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'Member',
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- 5. Documents Table
-- Tracks usage and document state
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size_kb INT,
  document_type TEXT,
  target_language TEXT,
  status doc_status NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to create a profile automatically after signing up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- 1. Create the profile
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name');
  
  -- 2. Create an organization for them (defaulting to Starter)
  INSERT INTO public.organizations (name, plan_type, max_documents)
  VALUES (COALESCE(new.raw_user_meta_data->>'first_name', 'My') || '''s Organization', 'Starter', 25)
  RETURNING id INTO new_org_id;

  -- 3. Add them as an Owner of that organization
  INSERT INTO public.organization_members (org_id, user_id, role, status)
  VALUES (new_org_id, new.id, 'Owner', 'Active');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Row Level Security (RLS) Settings
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can select and update their own profiles
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Org Members: Users can see members of orgs they belong to
CREATE POLICY "Users can view members of their orgs"
ON organization_members FOR SELECT USING (
  org_id IN (
    SELECT org_id FROM organization_members WHERE user_id = auth.uid()
  )
);

-- Organizations: Users can view their orgs
CREATE POLICY "Users can view their orgs"
ON organizations FOR SELECT USING (
  id IN (
    SELECT org_id FROM organization_members WHERE user_id = auth.uid()
  )
);

-- Documents: Users can view and insert documents in their orgs
CREATE POLICY "Users can view their org documents"
ON documents FOR SELECT USING (
  org_id IN (
    SELECT org_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their org documents"
ON documents FOR INSERT WITH CHECK (
  org_id IN (
    SELECT org_id FROM organization_members WHERE user_id = auth.uid()
  )
);
