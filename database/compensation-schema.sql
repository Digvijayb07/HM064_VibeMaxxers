-- Feature 5 & 6: Compensation and Dashboard Schema
-- Run this in your Supabase SQL Editor after submissions-schema.sql

-- Add compensation fields to submissions table
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS compensation_amount DECIMAL(10,2);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS compensation_status TEXT DEFAULT 'pending' 
  CHECK (compensation_status IN ('pending', 'approved', 'paid'));
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS compensation_type TEXT 
  CHECK (compensation_type IN ('winner', 'participation', 'none'));

-- Create compensations tracking table
CREATE TABLE IF NOT EXISTS compensations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('winner', 'participation')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project settings table
CREATE TABLE IF NOT EXISTS project_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER REFERENCES projects(id) UNIQUE,
  participation_compensation DECIMAL(10,2) DEFAULT 50.00,
  winner_compensation DECIMAL(10,2),
  auto_approve_participation BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project messages table for communication
CREATE TABLE IF NOT EXISTS project_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_filter TEXT DEFAULT 'all', -- 'all', 'shortlisted', 'specific'
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for compensations
ALTER TABLE compensations ENABLE ROW LEVEL SECURITY;

-- Freelancers can view their own compensations
CREATE POLICY "Freelancers can view own compensations"
  ON compensations FOR SELECT
  USING (auth.uid() = user_id);

-- Companies can view compensations for their projects
CREATE POLICY "Companies can view project compensations"
  ON compensations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = compensations.project_id 
      AND projects.company_id = auth.uid()
    )
  );

-- Companies can create compensations for their projects
CREATE POLICY "Companies can create compensations"
  ON compensations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_id 
      AND projects.company_id = auth.uid()
    )
  );

-- Companies can update compensations for their projects
CREATE POLICY "Companies can update compensations"
  ON compensations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = compensations.project_id 
      AND projects.company_id = auth.uid()
    )
  );

-- RLS Policies for project_settings
ALTER TABLE project_settings ENABLE ROW LEVEL SECURITY;

-- Companies can manage their project settings
CREATE POLICY "Companies can manage project settings"
  ON project_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_settings.project_id 
      AND projects.company_id = auth.uid()
    )
  );

-- RLS Policies for project_messages
ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;

-- Companies can create and view messages for their projects
CREATE POLICY "Companies can manage project messages"
  ON project_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_messages.project_id 
      AND projects.company_id = auth.uid()
    )
  );

-- Applicants can view messages for projects they applied to
CREATE POLICY "Applicants can view project messages"
  ON project_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.project_id = project_messages.project_id 
      AND applications.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_compensations_user_id ON compensations(user_id);
CREATE INDEX IF NOT EXISTS idx_compensations_project_id ON compensations(project_id);
CREATE INDEX IF NOT EXISTS idx_compensations_status ON compensations(status);
CREATE INDEX IF NOT EXISTS idx_project_settings_project_id ON project_settings(project_id);
CREATE INDEX IF NOT EXISTS idx_project_messages_project_id ON project_messages(project_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_compensations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER compensations_updated_at
  BEFORE UPDATE ON compensations
  FOR EACH ROW
  EXECUTE FUNCTION update_compensations_updated_at();

CREATE OR REPLACE FUNCTION update_project_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_settings_updated_at
  BEFORE UPDATE ON project_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_project_settings_updated_at();
