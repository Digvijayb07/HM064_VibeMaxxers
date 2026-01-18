export type UserRole = "company" | "developer" | "freelancer";

export interface User {
  email: string;
  name: string;
  userType: UserRole;
  id: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: string;
  deadline: string;
  skills: string[];
  company: string;
  status: "open" | "in-progress" | "completed" | "closed";
  applicants?: number;
}

export interface Application {
  id: string;
  projectId: string;
  projectTitle: string;
  freelancerId: string;
  freelancerName: string;
  proposal: string;
  status: "submitted" | "shortlisted" | "rejected" | "awarded";
  submittedAt: string;
  submission_deadline?: string;
}

export interface FreelancerProfile {
  id?: string;
  user_id: string;
  professional_title: string;
  about: string;
  hourly_rate: number;
  availability: "available" | "available-limited" | "unavailable";
  skills: string[];
  created_at?: string;
  updated_at?: string;
}

export interface SubmissionLink {
  type: 'figma' | 'drive' | 'github' | 'behance' | 'other';
  url: string;
  label: string;
}

export interface Submission {
  id: string;
  application_id: number;
  user_id: string;
  project_id: number;
  title: string;
  description: string;
  submission_links: SubmissionLink[];
  status: 'submitted' | 'selected' | 'rejected';
  feedback?: string;
  rating?: number;
  submitted_at: string;
  deadline?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  project?: {
    id: number;
    title: string;
    company_id: string;
  };
  user?: {
    id: string;
    email: string;
    user_metadata: {
      name: string;
    };
  };
}

export interface Compensation {
  id: string;
  submission_id: string;
  user_id: string;
  project_id: number;
  amount: number;
  type: 'winner' | 'participation';
  status: 'pending' | 'approved' | 'paid';
  approved_by?: string;
  approved_at?: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  submission?: Submission;
  user?: {
    id: string;
    email: string;
    user_metadata: {
      name: string;
    };
  };
}

export interface ProjectStats {
  total_applications: number;
  shortlisted_count: number;
  submissions_count: number;
  winner_selected: boolean;
  avg_rating?: number;
  total_compensation?: number;
}

export interface ProjectSettings {
  id: string;
  project_id: number;
  participation_compensation: number;
  winner_compensation?: number;
  auto_approve_participation: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectMessage {
  id: string;
  project_id: number;
  sender_id: string;
  recipient_filter: string;
  subject: string;
  message: string;
  sent_at: string;
  created_at: string;
}
