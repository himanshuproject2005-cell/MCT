# MCT - Micro Concept Tracker

A modern, sleek micro concept tracking application built with Next.js, Supabase, and AI integration. MCT helps you organize, track, and manage your ideas and concepts with real-time updates and intelligent assistance.

## ✨ Features

- **🔐 Secure Authentication** - User registration and login with Supabase Auth
- **📊 Real-time Dashboard** - Live concept tracking with statistics and progress monitoring
- **🤖 AI-Powered Chatbot** - Intelligent assistant using Groq AI for productivity guidance
- **📝 Concept Management** - Create, edit, and organize concepts with categories and priorities
- **🎨 Modern Dark UI** - Sleek, responsive design with smooth animations
- **📱 Mobile Responsive** - Optimized for all device sizes
- **⚡ Real-time Updates** - Live synchronization across all connected clients

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Database + Auth)
- **AI Integration**: Groq AI for chatbot functionality
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- A Supabase account and project
- A Groq API account and key

## 🛠️ Setup Instructions

### 1. Clone and Install

\`\`\`bash
git clone <your-repo-url>
cd mct
npm install
\`\`\`

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Development Redirect URL
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Groq AI Configuration
GROQ_API_KEY=your_groq_api_key
\`\`\`

### 3. Database Setup

Run the following SQL scripts in your Supabase SQL editor or use the provided script files:

1. **Create Concepts Table** (`scripts/001_create_concepts_table.sql`)
2. **Create Profiles Table** (`scripts/002_create_profiles_table.sql`)
3. **Create Profile Trigger** (`scripts/003_create_profile_trigger.sql`)

### 4. Run the Application

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

\`\`\`
mct/
├── app/
│   ├── api/chat/          # AI chatbot API endpoint
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard page
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── chat-bot.tsx       # AI chatbot component
│   ├── concept-*.tsx      # Concept management components
│   └── dashboard-*.tsx    # Dashboard components
├── lib/
│   └── supabase/          # Supabase client configuration
├── scripts/               # Database setup scripts
└── middleware.ts          # Auth middleware
\`\`\`

## 🎯 Usage

### Getting Started

1. **Sign Up/Login**: Create an account or sign in at `/auth/signup` or `/auth/login`
2. **Dashboard**: Access your main dashboard at `/dashboard`
3. **Create Concepts**: Use the "New Concept" button to add ideas and tasks
4. **AI Assistant**: Chat with the AI bot for productivity tips and concept organization
5. **Track Progress**: Monitor your concepts with real-time statistics and status updates

### Concept Management

- **Categories**: Organize concepts by type (Idea, Task, Goal, Project, Note)
- **Priorities**: Set importance levels (Low, Medium, High, Urgent)
- **Status Tracking**: Monitor progress (Not Started, In Progress, Completed, On Hold)
- **Due Dates**: Set deadlines for time-sensitive concepts

### AI Chatbot Features

- Context-aware responses based on your concepts
- Productivity tips and organization suggestions
- Quick actions for concept creation
- Intelligent recommendations for concept management

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Enable Row Level Security (RLS) on all tables
3. Configure authentication providers as needed
4. Run the provided SQL scripts to set up the database schema

### Groq AI Setup

1. Sign up for a Groq account
2. Generate an API key
3. Add the key to your environment variables

## 🚀 Deployment

### Deploy to Vercel

1. Connect your repository to Vercel
2. Add all environment variables in the Vercel dashboard
3. Deploy the application

The app will automatically handle database migrations and setup.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page for existing solutions
2. Create a new issue with detailed information
3. Contact the development team

---

**MCT** - Organize your thoughts, track your progress, achieve your goals. 🎯
