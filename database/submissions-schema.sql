-- Submissions table for Feature 4: Design/Prototype Submission
-- Run this in your Supabase SQL Editor

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  submission_links JSONB DEFAULT '[]'::jsonb, -- Array of {type: 'figma'|'drive'|'github'|'behance'|'other', url: string, label: string}
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'selected', 'rejected')),
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for submissions
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Freelancers can view their own submissions
CREATE POLICY "Freelancers can view own submissions"
  ON submissions FOR SELECT
  USING (auth.uid() = user_id);

-- Freelancers can create submissions for their shortlisted applications
CREATE POLICY "Freelancers can create submissions"
  ON submissions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = application_id 
      AND applications.user_id = auth.uid()
      AND applications.status = 'shortlisted'
    )
  );

-- Freelancers can update their own submissions before deadline
CREATE POLICY "Freelancers can update own submissions"
  ON submissions FOR UPDATE
  USING (
    auth.uid() = user_id AND
    (deadline IS NULL OR deadline > NOW())
  );

-- Companies can view submissions for their projects
CREATE POLICY "Companies can view project submissions"
  ON submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = submissions.project_id 
      AND projects.company_id = auth.uid()
    )
  );

-- Companies can update submissions for their projects (rating, feedback, status)
CREATE POLICY "Companies can update project submissions"
  ON submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = submissions.project_id 
      AND projects.company_id = auth.uid()
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_project_id ON submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_submissions_application_id ON submissions(application_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_submissions_updated_at();

-- Update applications table to support shortlisting
-- Add status column if it doesn't exist with proper values
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'applications' AND column_name = 'status'
  ) THEN
    ALTER TABLE applications ADD COLUMN status TEXT DEFAULT 'submitted';
  END IF;
END $$;

-- Add constraint to applications status
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications ADD CONSTRAINT applications_status_check 
  CHECK (status IN ('submitted', 'shortlisted', 'rejected', 'awarded'));

-- Add deadline column to applications for submission deadlines
ALTER TABLE applications ADD COLUMN IF NOT EXISTS submission_deadline TIMESTAMPTZ;

-- Add indexes for applications
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_project_id ON applications(project_id);
