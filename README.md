# AI Interview Assistant

A React + TypeScript web application that streamlines technical interviews for both candidates and interviewers. Candidates upload a resume, confirm details, and complete a timed, chat-style interview. Interviewers get a dashboard to review candidate profiles, scores, answers, and AI feedback.

This project ships with a AI service to generate questions, score answers, and produce summaries. It persists sessions locally so candidates can resume where they left off.

---

## Features

- Candidate experience
  - Resume upload (PDF or DOCX, up to 10 MB)
  - Automatic extraction of name, email, and phone
  - Guided information collection for missing fields with validation
  - Chat-style interview with 6 timed questions (2 easy, 2 medium, 2 hard)
  - Visual timer with progress bar, pause/resume, and auto-submit on time up
  - Per-answer AI feedback and scoring (0–10), plus final overall score (0–100)
  - Completion screen with next-step guidance

- Interviewer experience
  - Dashboard with candidate stats (total, completed, in-progress, average score)
  - Search by name/email, filter by status, and sort by score/date/name
  - Candidate details view with profile, overall summary, per-question answers, scores, timing, and efficiency

- Platform and persistence
  - Local session persistence with automatic resume modal for incomplete interviews
  - Clean UI built with Tailwind CSS and lucide-react icons
  - Vite-based development for fast HMR and builds

- AI integration (mocked by default)
  - Pluggable AI layer for question generation, scoring, and summarization
  - Replace the mock with real API calls when ready

---

## Tech stack

- React 18 + TypeScript
- Vite 5 (bundler/dev server)
- Tailwind CSS 3
- lucide-react (icons)
- pdfjs-dist (PDF text extraction)
- mammoth (DOCX text extraction)

Note: The repository includes some additional dependencies that can support future enhancements. The core features rely on the libraries listed above.

---

## Getting started

Prerequisites
- Node.js ≥ 18
- npm (or yarn/pnpm if you prefer)

Install dependencies

```bash
npm install
```

Run the development server

```bash
npm run dev
```

Then open the URL printed in the terminal (typically http://localhost:5173).

Build for production

```bash
npm run build
```

Preview the production build locally

```bash
npm run preview
```

Quality scripts

- Lint: `npm run lint`
- Type-check: `npm run typecheck`

---

## Project structure

```
AI_Intervie_Assistant/
├─ src/
│  ├─ components/
│  │  ├─ CandidateDashboard.tsx      # Interviewer dashboard (list, search, filter, sort)
│  │  ├─ CandidateDetails.tsx        # Interviewer detailed view for a candidate
│  │  ├─ InfoCollection.tsx          # Collect/confirm candidate info with validation
│  │  ├─ InterviewChat.tsx           # Chat-like UI for answering timed questions
│  │  ├─ ResumeUpload.tsx            # Upload and validate resume, start flow
│  │  ├─ TimerDisplay.tsx            # Visual timer with progress and pause/resume
│  │  └─ WelcomeBackModal.tsx        # Resume prior incomplete sessions
│  ├─ hooks/
│  │  └─ useTimer.ts                 # Timer logic (countdown, pause/resume, progress)
│  ├─ types/
│  │  ��─ index.ts                    # Shared types for Candidate, Answer, Question, etc.
│  ├─ utils/
│  │  ├─ aiService.ts                # Mock AI (questions, scoring, summary) — replaceable
│  │  ├─ resumeParser.ts             # Extract text from PDF/DOCX and parse basic info
│  │  └─ storage.ts                  # localStorage persistence (load/save/clear)
│  ├─ App.tsx                        # App shell with Interviewee/Interviewer tabs
│  ├─ index.css
│  ├─ main.tsx
│  └─ vite-env.d.ts
├─ index.html
├─ package.json
├─ tailwind.config.js
├─ postcss.config.js
├─ tsconfig*.json
└─ vite.config.ts
```

---

## How it works

- Resume parsing
  - PDF: Uses pdfjs-dist to extract text. The PDF worker is configured in `resumeParser.ts` via an ES module worker import compatible with Vite.
  - DOCX: Uses mammoth to extract raw text.
  - Basic parsing attempts to detect name, email, and phone. Candidates can correct/complete any missing details.

- Interview flow
  - 6 questions total: 2 easy (20s each), 2 medium (60s each), 2 hard (120s each)
  - Chat UI displays question and starts the timer
  - Candidates type answers; Enter submits; Shift+Enter adds a newline
  - Auto-submit is triggered when time runs out
  - Each answer receives a score (0–10) and short feedback from the mock AI
  - After the last question, an overall score (0–100) and summary are generated

- Persistence and resume
  - All progress is saved to `localStorage` under the key `interview_assistant_data`
  - If a candidate returns with an incomplete interview, a modal offers to continue or start over

- Interviewer views
  - Dashboard lists candidates with status and scores, supports searching, filtering, and sorting
  - Details page shows candidate profile, aggregate summary, and per-question performance

---

## Replacing the mock AI

`src/utils/aiService.ts` currently mocks:
- `generateQuestions()` — returns 6 questions (2 per difficulty)
- `scoreAnswer(question, answer, timeUsed)` — returns a 0–10 score + feedback
- `generateSummary(answers)` — computes a 0–100 score + text summary

To integrate a real AI provider:
1. Add environment variables (Vite requires VITE_ prefix), e.g.:
   
   Create `.env.local` (not committed) and add:
   ```bash
   VITE_AI_API_URL=...
   VITE_AI_API_KEY=...
   ```
2. In `aiService.ts`, replace the mock implementations with `fetch` calls to your API:
   - Keep function signatures and return shapes intact to avoid UI changes
   - Handle latency, rate limits, and retries as needed
3. Consider streaming responses for richer UX and implement graceful error handling

Tip: When changing return shapes, update the relevant types in `src/types/index.ts` and the consuming components.

---

## Configuration notes

- No environment variables are required for the mock setup
- The PDF worker is configured via `pdfjs-dist/build/pdf.worker.mjs?url` import; this should work out-of-the-box with Vite
- File constraints: PDF or DOCX only, up to 10 MB; scanned PDFs without embedded text will not extract well

---

## Troubleshooting

- PDF worker errors
  - Stop the dev server, clear browser cache, and restart `npm run dev`
  - Ensure dependencies are installed correctly

- Resume parsing issues
  - Verify the file is PDF or DOCX and not a scanned image-only PDF
  - Try a different file to rule out document-specific issues

- Progress doesn’t resume
  - Session data is saved in the same browser via `localStorage`; switching browsers/devices will not carry data over
  - Ensure your browser allows localStorage

- Reset all local data
  - Open DevTools Console on the app and run:
    ```js
    localStorage.removeItem('interview_assistant_data')
    ```

---

## Roadmap ideas

- Real AI integration (question generation, grading, rubric-based feedback)
- Server-side persistence (e.g., Supabase/Postgres) and authentication
- Exportable reports (PDF/CSV) and shareable links
- Accessibility, internationalization, and mobile optimizations
- Question banks and role-specific tracks

---

## License

MIT License. You are free to use, modify, and distribute this software with proper attribution.
