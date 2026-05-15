# AI-Powered DSA Mentor Platform

An intelligent coding interview preparation platform that combines secure code execution, AI-powered debugging assistance, and personalized DSA progress tracking.

Unlike traditional coding platforms that only return verdicts like “Wrong Answer” or “Time Limit Exceeded,” this system helps users understand *why* their solution failed and how to improve it.

---

# Features

## Secure Online Code Execution
- Multi-language code execution
- Docker-based sandboxing
- Isolated execution environment
- CPU, memory, and timeout restrictions
- Compilation/runtime error handling

## AI Debugging Assistant
- Analyze failed solutions
- Detect logical mistakes
- Explain edge-case failures
- Suggest debugging directions
- Provide optimization guidance
- Progressive hint system
- Optional optimal solution reveal

## DSA Progress Tracking
- Track solved problems across:
  - LeetCode
  - Codeforces
  - HackerRank
  - Custom problems
- Difficulty/topic tracking
- Time taken analytics
- Revision tracking
- AI struggle analysis
- Topic mastery insights

## Coding Workspace
- Monaco Editor integration
- Dark-themed modern UI
- Multi-language support
- Custom input testing
- Run code before submission

---

# Tech Stack

## Frontend
- Next.js App Router
- TypeScript
- Tailwind CSS
- Monaco Editor

## Backend
- Node.js
- Express.js
- Docker Sandbox Execution

## Database & Auth
- Supabase
- PostgreSQL

## AI Integration
- Gemini API

## Deployment
- Vercel
- Railway / Render

---

# Architecture

```text
Frontend (Next.js)
        ↓
API Layer
        ↓
Execution Service
        ↓
Docker Sandbox
        ↓
Judge System
        ↓
AI Analysis Engine
        ↓
Progress Analyticsors of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
