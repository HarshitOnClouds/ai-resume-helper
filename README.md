# GetMeTheJob 🚀

**GetMeTheJob** is an AI-powered career operating system designed to help early-career professionals and students land their dream roles. 

Instead of being a one-shot resume checker, GetMeTheJob acts as a persistent platform where users can parse their resumes, evaluate their skill readiness against industry-standard taxonomies, generate personalized learning roadmaps, and optimize their resumes line-by-line for ATS compatibility.

## 📊 Project Presentation
You can view the full architecture and concept details in the included [presentation.pdf](./presentation.pdf) file.

## ✨ Features

- **📄 AI Resume Parsing:** Upload a PDF/DOCX resume and extract structured profile data using Groq's blazing-fast LLM APIs.
- **🎯 Job Readiness Engine:** Compare your current skill profile against 17+ different tech and business roles (Software Engineer, Product Manager, Data Scientist, etc.). Receive a fit score and detailed skill gap analysis.
- **🗺️ Personalized AI Roadmaps:** Generate a tailored Kanban-style roadmap (Pending, In Progress, Done) containing actionable steps to bridge your skill gaps.
- **✨ AI Resume Optimizer:** Paste your target Job Description (JD) and let the AI rewrite weak bullet points into impactful, metrics-driven statements. 
- **✍️ Live Resume Editor & PDF Export:** Review AI suggestions in a clean Diff view, apply them, and open a live WYSIWYG editor. Add a profile photo, tweak the layout, and instantly export a beautiful, recruiter-ready PDF.

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 (App Router), React, Tailwind CSS, shadcn/ui
- **Backend:** Next.js Server Actions & API Routes
- **Database:** PostgreSQL managed via Prisma ORM
- **Authentication:** NextAuth (Auth.js)
- **AI / LLM:** Groq API (Powered by OSS model :`gpt-oss-120b`)
- **PDF Generation:** `@react-pdf/renderer`
- **File Parsing:** `unpdf` & `mammoth`

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17 or later
- A PostgreSQL database (e.g., NeonDB, Supabase, Railway)
- API Keys for Groq

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/getmethejob.git
cd getmethejob
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root directory and add the following keys:

```env
# Database
DATABASE_URL="postgresql://user:password@host/db"

# Authentication (NextAuth)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key" # Generate via: openssl rand -base64 32

# AI Inference
GROQ_API_KEY="gsk_your_groq_api_key_here"
```

### 3. Initialize Database
Push the Prisma schema to your PostgreSQL database:
```bash
npx prisma db push
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app running!

## 📜 License
All rights reserved
