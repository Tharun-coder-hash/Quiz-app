# QuizMaster Nexus

A comprehensive MCQ quiz platform inspired by NPTEL educational content. Features course browsing, interactive quiz-taking with single/multiple-choice questions, composite quizzes that combine multiple quizzes, admin panel for content management, and token-based bulk import for MCQs.

## Project Overview

### Purpose
QuizMaster Nexus is a full-stack quiz platform designed to help educators create and manage educational quizzes. Students can browse courses, take quizzes, and track their progress. Admins can create courses, quizzes, and import questions in bulk using a simple token-based format.

### Current State
- Full-stack application with React frontend and Express backend
- In-memory storage with seed data for development
- Admin authentication with session-based login
- Complete CRUD for courses, quizzes, questions, and options
- Composite quiz support for combining multiple quizzes
- Token-based bulk import for MCQs
- Dark mode support

## Project Architecture

### Frontend (`client/src/`)
- **Framework**: React with TypeScript
- **Routing**: wouter
- **State Management**: TanStack Query (React Query)
- **UI Components**: shadcn/ui with Tailwind CSS
- **Styling**: Tailwind CSS with custom design system

### Backend (`server/`)
- **Framework**: Express with TypeScript
- **Storage**: In-memory storage (MemStorage)
- **Authentication**: Passport.js with local strategy
- **Session**: express-session with memory store

### Shared (`shared/`)
- **Schema**: Drizzle schema definitions in `schema.ts`
- **Types**: Shared TypeScript types for frontend and backend

## Key Files

| File | Purpose |
|------|---------|
| `shared/schema.ts` | Database schema and TypeScript types |
| `server/storage.ts` | Storage interface and in-memory implementation |
| `server/routes.ts` | API route definitions |
| `server/parser.ts` | Token-based MCQ parser |
| `client/src/App.tsx` | Main application with routing |
| `client/src/pages/HomePage.tsx` | Public course/quiz browser |
| `client/src/pages/QuizPage.tsx` | Quiz taking interface |
| `client/src/pages/AdminDashboardPage.tsx` | Admin content management |
| `client/src/components/BulkImportModal.tsx` | Bulk import with token parser |

## API Endpoints

### Public Routes
- `GET /api/courses` - List all courses
- `GET /api/quizzes` - List all quizzes
- `GET /api/quizzes/:id` - Get quiz with questions
- `GET /api/quizzes/:id/resolved` - Get quiz with all questions (resolves composite)
- `POST /api/quizzes/:id/submit` - Submit quiz answers

### Admin Routes (require auth)
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/session` - Check session status
- `GET /api/admin/courses` - List courses for admin
- `POST /api/admin/courses` - Create course
- `PATCH /api/admin/courses/:id` - Update course
- `DELETE /api/admin/courses/:id` - Delete course
- `POST /api/admin/courses/:id/quizzes` - Create quiz for course
- `GET /api/admin/quizzes/:id` - Get quiz with questions/children
- `PATCH /api/admin/quizzes/:id` - Update quiz
- `DELETE /api/admin/quizzes/:id` - Delete quiz
- `POST /api/admin/quizzes/:id/questions` - Add question to quiz
- `DELETE /api/admin/quizzes/:id/questions/:qId` - Delete question
- `POST /api/admin/quizzes/:id/compose` - Set child quizzes for composite
- `POST /api/admin/quizzes/:id/import-paste` - Parse token-format MCQs
- `POST /api/admin/quizzes/:id/import-confirm` - Save parsed questions

## Token-Based MCQ Import Format

The bulk import feature uses a simple token-based format:

```
::q::What is 2+2?::/q::
::o::1::/o::
::o::3::/o::
::o*::4::/o::
::o::5::/o::
::end::
```

### Tokens
- `::q::...::/q::` - Question text (closing tag optional)
- `::o::...::/o::` - Option (closing tag optional)
- `::o*::...::/o::` - Correct option (use `*` for correct answer)
- `::end::` - Separates questions

### Multiple Correct Answers
Mark multiple options with `*` for multiple-choice questions:
```
::q::Select all prime numbers::/q::
::o*::2::/o::
::o*::3::/o::
::o::4::/o::
::o*::5::/o::
::end::
```

## Admin Access

The admin panel is accessed via a hidden search code feature:
1. Enter search code: `26122005`
2. Login with password: `admin123`

## Composite Quizzes

Composite quizzes can include other quizzes, creating hierarchical quiz structures:
- Mark a quiz as "Composite Quiz" in the editor
- Add child quizzes from the available quizzes panel
- When resolved, all questions from child quizzes are flattened
- Recursive resolution up to 5 levels deep

## Running the Project

The application starts with `npm run dev` which:
1. Starts the Express backend server
2. Starts the Vite development server for the frontend
3. Serves both on port 5000

## Development Notes

### User Preferences
- Design uses indigo (#4F46E5) as primary color
- Purple accents for composite quiz indicators
- Dark mode fully supported

### Architecture Decisions
- In-memory storage for simplicity (no database required)
- Session-based authentication for admin security
- Composite quiz resolution happens server-side
- Token parser runs in server memory only (raw text not stored)

## Recent Changes

- [2024] Implemented full-stack MCQ quiz platform
- [2024] Added composite quiz support with recursive resolution
- [2024] Added token-based bulk import with preview and editing
- [2024] Integrated all frontend pages with real API calls
- [2024] Added dark mode support
