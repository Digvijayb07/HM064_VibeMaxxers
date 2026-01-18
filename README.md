# 🚀 TalentHub - Freelance Marketplace Platform

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)

> A modern, full-featured freelance marketplace connecting companies with talented developers through a fair, transparent project workflow.

---

## ✨ Features

### 🏢 For Companies
- **Project Management** - Create and manage design/development projects
- **Application Review** - Review and shortlist qualified candidates
- **Submission Evaluation** - Rate and provide feedback on design submissions
- **Fair Compensation** - Automatic winner and participation compensation system
- **Project Dashboard** - Track applications, submissions, and project metrics

### 👨‍💻 For Freelancers
- **Browse Projects** - Discover opportunities matching your skills
- **Submit Applications** - Apply with proposals and portfolio links
- **Design Submission** - Submit work via Figma, Drive, GitHub, Behance
- **Earnings Tracking** - View all compensations with transparent status
- **Application Status** - Real-time updates on application progress

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Hooks
- **Notifications**: Sonner

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Next.js Server Actions
- **Real-time**: Supabase Realtime (ready)
- **Storage**: Supabase Storage (ready)

### DevOps
- **Deployment**: Vercel
- **Package Manager**: pnpm
- **Version Control**: Git/GitHub

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- pnpm package manager
- Supabase account
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Digvijayb07/HM064_VibeMaxxers.git
   cd HM064_VibeMaxxers
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Run database migrations**
   
   Open your Supabase SQL Editor and execute in order:
   - `database/submissions-schema.sql`
   - `database/compensation-schema.sql`

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
HM064_VibeMaxxers/
├── app/                          # Next.js App Router
│   ├── company/                  # Company-specific pages
│   │   ├── applications/         # Application management
│   │   ├── compensations/        # Payment management
│   │   ├── projects/             # Project CRUD & dashboard
│   │   └── submissions/          # Submission review
│   ├── freelancer/               # Freelancer-specific pages
│   │   ├── applications/         # Application tracking
│   │   ├── earnings/             # Earnings dashboard
│   │   └── submissions/          # Submission management
│   └── (auth)/                   # Authentication pages
├── components/                   # Reusable UI components
│   └── ui/                       # shadcn/ui components
├── lib/                          # Utility functions & actions
│   ├── application-actions.ts    # Application server actions
│   ├── compensation-actions.ts   # Compensation server actions
│   ├── submission-actions.ts     # Submission server actions
│   └── types.ts                  # TypeScript type definitions
├── database/                     # SQL migration scripts
│   ├── submissions-schema.sql    # Submissions & applications
│   └── compensation-schema.sql   # Compensations & settings
└── utils/                        # Supabase client utilities
```

---

## 🔐 Database Schema

### Core Tables
- **`users`** - User authentication and profiles
- **`projects`** - Project listings and details
- **`applications`** - Job applications with status tracking
- **`submissions`** - Design/prototype submissions
- **`compensations`** - Payment tracking (winner + participation)
- **`project_settings`** - Per-project compensation configuration
- **`project_messages`** - Communication system (infrastructure ready)

### Security
- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Secure authentication via Supabase Auth

---

## 🎯 Key Workflows

### 1. Application & Shortlisting
```
Developer applies → Company reviews → Shortlist candidates → Set deadline
```

### 2. Design Submission
```
Shortlisted developer → Submit design links → Company rates & reviews
```

### 3. Winner Selection & Compensation
```
Company selects winner → Auto-create compensations:
  ├─ Winner: Approved immediately
  └─ Participants: Pending approval ($50 default)
```

### 4. Payment Management
```
Company approves → Mark as paid → Freelancer sees earnings
```

---

## 💰 Compensation System

### Automatic Fair Compensation
- **Winner Compensation**: Configurable per project (approved immediately)
- **Participation Compensation**: $50 default for all rejected submissions
- **Status Tracking**: Pending → Approved → Paid
- **Transparency**: Freelancers see all earnings with clear status

### Configuration
Set custom amounts per project via `project_settings` table or UI (coming soon).

---

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev          # Start dev server (localhost:3000)

# Production
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SITE_URL` | Application URL | ✅ |
| `NEXT_PUBLIC_SITE_URL` | Public application URL | ✅ |

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Import project from GitHub
   - Select the `aahil` branch

2. **Configure Environment Variables**
   - Add all required environment variables
   - Use production Supabase credentials

3. **Deploy**
   - Vercel will automatically build and deploy
   - Each push to `aahil` triggers a new deployment

### Manual Deployment

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

---

## 📊 Features Implemented

### ✅ Phase 1: Core Features
- [x] User authentication (Company/Freelancer)
- [x] Project creation and management
- [x] Application submission
- [x] Application shortlisting
- [x] Submission deadline tracking

### ✅ Phase 2: Submission System
- [x] Design submission with multiple link types
- [x] Rating and feedback system
- [x] Winner selection
- [x] Automatic status updates

### ✅ Phase 3: Compensation System
- [x] Automatic winner compensation
- [x] Participation compensation
- [x] Bulk approval system
- [x] Payment tracking
- [x] Freelancer earnings dashboard
- [x] Company compensation management

### ✅ Phase 4: Dashboard & Analytics
- [x] Project statistics dashboard
- [x] Application breakdown
- [x] Financial overview
- [x] Quick action links

### 🚧 Future Enhancements
- [ ] Real-time notifications
- [ ] In-app messaging system
- [ ] File upload support (Supabase Storage)
- [ ] Advanced analytics and charts
- [ ] Email notifications
- [ ] Freelancer profile system
- [ ] Search and filtering improvements

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is part of the HM064 Hackmatrix competition.

---

## 👥 Team: VibeMaxxers

Built with ❤️ for Hackmatrix 2026

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the [walkthrough documentation](./walkthrough.md)
- Review the [implementation plan](./implementation_plan.md)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open Source Firebase Alternative
- [Vercel](https://vercel.com/) - Deployment Platform
- [shadcn/ui](https://ui.shadcn.com/) - UI Component Library
- [Radix UI](https://www.radix-ui.com/) - Unstyled UI Primitives

---

**Made with 🚀 by Team VibeMaxxers**