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
  status: "pending" | "accepted" | "rejected";
  submittedAt: string;
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
