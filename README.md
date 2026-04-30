# 🦉 OwlCV — Smart Resume Builder

![OwlCV Homepage Screenshot Placeholder](public/screenshot-home.png)
<!-- Replace the path above with your actual homepage screenshot path -->

OwlCV is a comprehensive, modern full-stack web application engineered to solve the most common challenges in job hunting. By combining an intuitive, real-time dynamic resume builder with advanced AI integrations, OwlCV helps users effortlessly craft professional, highly optimized, ATS-friendly resumes. Beyond just document generation, it serves as a central hub for developers to manage their project portfolios, automatically parse existing documents, and gain actionable insights into how their applications align with specific job descriptions. Whether you are a fresh graduate or an experienced professional, OwlCV provides all the tools needed to stand out to recruiters and tracking systems alike.

## ✨ Key Features

*   **AI-Powered Enhancements:** Integrated with Google Gemini AI to optimize your experience descriptions for Applicant Tracking Systems (ATS).
    <br>![ATS Scoring Screenshot Placeholder](public/screenshot-ats.png)
*   **Smart Document Parsing:** Import existing resumes (PDF/Word) using `pdf.js` and `mammoth` to automatically populate your profile.
*   **Project Portfolio Management:** Save, manage, and track your development projects in a centralized database.
*   **Dynamic Resume Editor:** Build and preview your resume in real-time.
    <br>![Resume Editor Screenshot Placeholder](public/screenshot-editor.png)
*   **PDF Export:** High-fidelity PDF rendering using `html2canvas` and `html2pdf.js` to ensure your resume looks exactly as designed.
*   **Secure Authentication:** User sign-up, login, and OAuth (Google/GitHub) powered by Supabase.
*   **Responsive & Beautiful UI:** Styled with Tailwind CSS v4 and animated with Framer Motion for a premium user experience.

## 🛠️ Tech Stack

### Frontend
*   **Framework:** React 19 + TanStack Start (Full-stack React framework)
*   **Routing:** TanStack Router
*   **Styling:** Tailwind CSS v4, clsx, tailwind-merge
*   **UI Components:** Radix UI primitives, Lucide React (Icons)
*   **Forms & Validation:** React Hook Form, Zod

### Backend & Database
*   **Database:** PostgreSQL (Hosted on Neon)
*   **Authentication:** Supabase Auth
*   **ORM:** Prisma (`@prisma/client`)
*   **Data Fetching:** TanStack Query

### Build & Tooling
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **Package Manager:** Bun / npm

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd owlcv-ui-showcase-main
   ```

2. **Install dependencies:**
   ```bash
   bun install
   # or npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add the following keys:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Database URL for Prisma
   DATABASE_URL=your_supabase_connection_string

   # Gemini API Key for AI features
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Database Setup (Prisma):**
   Push the database schema to your Supabase PostgreSQL instance:
   ```bash
   npx prisma db push
   # or bunx prisma db push
   ```
   *(Alternatively, you can run the provided `schema.sql` script directly in your Supabase SQL editor to set up tables and Row Level Security (RLS) policies).*

5. **Start the Development Server:**
   ```bash
   bun run dev
   # or npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 🗄️ Database Schema

The application revolves around three main entities:
*   **User:** Handled by Supabase Auth (`auth.users`).
*   **Resume:** Stores the user's generated resume content (Title, JSON Content, Views, Downloads).
*   **Project:** Stores individual portfolio projects (Title, Description, Tech Stack, Repo URL).

## 📜 Scripts

*   `bun run dev` - Starts the Vite development server.
*   `bun run build` - Builds the application for production.
*   `bun run preview` - Locally previews the production build.
*   `bun run lint` - Runs ESLint to catch code issues.
*   `bun run format` - Formats code using Prettier.
