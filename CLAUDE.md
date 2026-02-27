# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. It allows users to describe components in natural language, and Claude AI generates working React components in real-time with a live preview. The application supports both anonymous and authenticated users with project persistence via SQLite.

## Quick Start Commands

### Setup
```bash
npm run setup
```
Installs dependencies, generates Prisma client, and runs database migrations.

### Development
```bash
npm run dev
```
Starts the development server with Turbopack on `http://localhost:3000`. Uses NODE_OPTIONS for Node API compatibility.

### Testing
```bash
npm test
```
Runs Vitest with jsdom environment. Tests are colocated in `__tests__` directories.

### Single Test
```bash
npm test -- src/components/chat/__tests__/ChatInterface.test.tsx
```

### Linting
```bash
npm lint
```
Runs ESLint (extends Next.js config).

### Production Build
```bash
npm run build
npm start
```

### Database
```bash
npm run db:reset
```
Resets SQLite database (destructive). Useful during development.

## Architecture Overview

### Core Components (Frontend)

**Chat Interface** (`/src/components/chat/`)
- `ChatInterface.tsx` - Main chat container
- `MessageInput.tsx` - User input form
- `MessageList.tsx` - Message history display
- `MarkdownRenderer.tsx` - Renders Claude's markdown responses

**Code Editor** (`/src/components/editor/`)
- `CodeEditor.tsx` - Monaco editor for code display/editing
- `FileTree.tsx` - Virtual file system navigator

**Preview** (`/src/components/preview/`)
- `PreviewFrame.tsx` - Renders generated components using Babel + jsdom

**Authentication** (`/src/components/auth/`)
- `AuthDialog.tsx`, `SignInForm.tsx`, `SignUpForm.tsx` - User auth flows
- Uses JWT tokens stored in cookies

### API & Server Logic

**Chat API** (`/src/app/api/chat/route.ts`)
- POST endpoint that:
  1. Accepts user messages and current file system state
  2. Streams responses from Claude (or mock) using `ai` SDK
  3. Uses tools (str_replace_editor, file_manager) to modify virtual file system
  4. Saves project to database if authenticated
  5. Returns streaming response via `toDataStreamResponse()`

**Server Actions** (`/src/actions/`)
- `getUser()` - Gets current authenticated user
- `getProjects()` - Fetches user's projects
- `createProject()` - Creates new project
- Uses middleware for authentication

**Middleware** (`/src/middleware.ts`)
- Validates JWT tokens
- Sets user session on request

### Core Libraries

**Virtual File System** (`/src/lib/file-system.ts`)
- `VirtualFileSystem` class manages in-memory file tree
- Methods: `createFile()`, `createDirectory()`, `deleteFile()`, `readFile()`, `writeFile()`, `listDirectory()`
- `serialize()` - Converts to JSON for database storage
- `deserializeFromNodes()` - Reconstructs from stored data

**Language Model Provider** (`/src/lib/provider.ts`)
- `getLanguageModel()` - Returns Claude Haiku or MockLanguageModel
- Falls back to mock provider if `ANTHROPIC_API_KEY` is not set
- Mock provider streams realistic component generation for demo purposes

**Claude Tools** (`/src/lib/tools/`)
- `str_replace.ts` - str_replace_editor tool for code modifications
- `file-manager.ts` - file_manager tool for file operations (create, delete, list)
- Tools are registered with Claude and executed during streaming

**System Prompts** (`/src/lib/prompts/`)
- `generation.ts` - System prompt that guides Claude on component generation
- Instructions for creating React components, handling JSX, etc.

**JSX Transformation** (`/src/lib/transform/jsx-transformer.ts`)
- Compiles JSX to JavaScript using Babel standalone
- Executes generated code in controlled environment
- Returns React components for preview rendering

**React Contexts** (`/src/lib/contexts/`)
- `chat-context.tsx` - Manages chat messages, input state
- `file-system-context.tsx` - Manages virtual file system state across components

### Database (Prisma)

**User Model**
- `id` (cuid) - Primary key
- `email` - Unique identifier
- `password` - Hashed with bcrypt
- `projects` - Relation to projects

**Project Model**
- `id` (cuid) - Primary key
- `name` - Project display name
- `userId` - Optional (null for anonymous projects)
- `messages` - JSON-stringified array of chat messages
- `data` - JSON-stringified serialized virtual file system
- `createdAt`, `updatedAt` - Timestamps

Database location: `prisma/dev.db` (SQLite)

## Key Implementation Details

### Anonymous vs Authenticated Workflow
1. **Anonymous users**: See main content without persisted state (uses `anon-work-tracker.ts` for session tracking)
2. **Authenticated users**: Auto-redirected to most recent project on `/`, new projects created automatically

### Streaming Chat Response Flow
1. Client sends messages + current file state to `/api/chat`
2. Chat API reconstructs virtual file system from serialized data
3. System prompt is injected with prompt caching
4. Claude streams response with tool calls
5. Tools modify virtual file system in-memory
6. Final file system state is serialized and saved to database
7. Response is streamed to client via `toDataStreamResponse()`

### Component Preview
1. Generated JSX code is passed to PreviewFrame
2. PreviewFrame uses jsx-transformer to compile code
3. Babel standalone compiles JSX → JavaScript
4. Code executed in sandboxed context
5. React component rendered in iframe

### Path Resolution
- Uses TypeScript path alias `@/*` → `./src/*`
- Virtual file paths start with `/` (e.g., `/components/Button.jsx`)

## Environment Variables

Create `.env` file:
```
ANTHROPIC_API_KEY=sk-ant-...  # Optional: uses mock if not provided
```

## Testing

Tests use Vitest with jsdom environment (`vitest.config.mts`). Test files are colocated in `__tests__` directories:
- `/src/components/chat/__tests__/` - Chat component tests
- `/src/components/editor/__tests__/` - Editor component tests
- `/src/lib/__tests__/` - Utility function tests
- `/src/lib/contexts/__tests__/` - Context tests
- `/src/lib/transform/__tests__/` - Transform tests

## Common Development Tasks

### Adding a New Component Feature
1. Create component in `/src/components/`
2. Add tests in colocated `__tests__/` directory
3. Import and use in relevant parent component
4. If UI component, consider adding to `/src/components/ui/`

### Modifying Claude's Behavior
1. Edit system prompt in `/src/lib/prompts/generation.ts`
2. Adjust `maxTokens` and `maxSteps` in `/src/app/api/chat/route.ts`
3. Test with mock provider first (no API key needed)

### Adding Database Migrations
1. Edit `/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <migration_name>`
3. Prisma client auto-generates in `/src/generated/prisma`

### Debugging
- Dev mode logs API errors to console
- Mock provider shows realistic test data flow
- Virtual file system operations logged during tool execution
- Database queries logged in debug mode

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS v4, Radix UI
- **Language**: TypeScript (strict mode)
- **Database**: Prisma + SQLite
- **AI**: Anthropic Claude API, Vercel AI SDK
- **Code Editor**: Monaco Editor
- **JSX Compilation**: Babel Standalone
- **Testing**: Vitest, Testing Library, jsdom
- **Code Generation**: Node.js 18+
