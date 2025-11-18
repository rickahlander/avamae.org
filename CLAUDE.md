# CLAUDE.md - AI Assistant Guide for Avamae Platform

> **Last Updated**: November 17, 2025
> **Project**: Avamae Memorial Tree Platform
> **Purpose**: Comprehensive guide for AI assistants to understand and contribute to this codebase effectively

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack & Architecture](#tech-stack--architecture)
3. [Directory Structure](#directory-structure)
4. [Development Environment](#development-environment)
5. [Coding Conventions](#coding-conventions)
6. [Database Schema & Patterns](#database-schema--patterns)
7. [Authentication & Security](#authentication--security)
8. [Common Development Tasks](#common-development-tasks)
9. [Testing & Quality](#testing--quality)
10. [Deployment & Infrastructure](#deployment--infrastructure)
11. [AI Assistant Best Practices](#ai-assistant-best-practices)

---

## Project Overview

### What is Avamae?

Avamae is a **memorial tree platform** that honors lost loved ones by visualizing how their lives continue to bless others. The platform represents the deceased as the roots and trunk of a tree, with branches representing ongoing impact through organ donation, healed relationships, foundations, and other forms of lasting legacy.

### Core Concept

- **Root Person**: The loved one who has passed away (represented as roots/trunk)
- **Branches**: Impact events showing how their life continues to bless others
- **Sub-branches**: Generational impact (branches can have their own branches)
- **Stories**: Memories, tributes, and narratives from community members
- **Community**: Collaborative space for family and friends to share and connect

### Project Status

- **Phase**: MVP Development
- **Focus**: Core tree creation, branch management, and visualization features
- **Recent Work**: Tree visualization with dual views (graph and illustrative), sub-branch functionality

### Design Philosophy

1. **Warm & Welcoming**: Soft, rounded shapes with warm colors (gold, green, coral)
2. **Organic & Living**: Natural, flowing designs that feel alive
3. **Collaborative**: Community-driven with role-based permissions
4. **Respectful**: Privacy controls and optional moderation
5. **Meaningful**: Every feature serves the purpose of honoring and celebrating lives

---

## Tech Stack & Architecture

### Frontend

- **Framework**: Next.js 15 (App Router with React Server Components)
- **React**: 18.3.1
- **UI Library**: Material-UI (MUI) v6 (Material Design 3)
- **Styling**: Emotion (CSS-in-JS via MUI)
- **Language**: TypeScript (strict mode enabled)
- **Fonts**: Playfair Display (headers), Inter (body)

### Backend

- **API**: Next.js API Routes (server-side)
- **Database**: PostgreSQL (AWS RDS for production)
- **ORM**: Prisma (v6.1.0)
- **Authentication**: NextAuth.js v4 (JWT strategy)
- **Password Hashing**: bcrypt

### Infrastructure (AWS)

- **Hosting**: AWS Amplify (SSR support)
- **Database**: Amazon RDS PostgreSQL (Multi-AZ in production)
- **Storage**: Amazon S3 (media files)
- **CDN**: Amazon CloudFront
- **Email**: Amazon SES
- **IaC**: Terraform (declarative infrastructure)

### Key Dependencies

```json
{
  "@mui/material": "^6.1.7",
  "@prisma/client": "^6.1.0",
  "next": "15.0.3",
  "next-auth": "^4.24.11",
  "react": "^18.3.1",
  "bcrypt": "^5.1.1",
  "zod": "^3.24.1"
}
```

---

## Directory Structure

```
avamae.org/
├── .claude/                    # Claude Code configuration
│   └── settings.local.json     # Local settings
├── prisma/
│   └── schema.prisma           # Database schema (single source of truth)
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── api/               # API routes
│   │   │   └── auth/          # NextAuth endpoints
│   │   ├── create-tree/       # Tree creation page
│   │   ├── trees/             # Tree pages
│   │   │   ├── [id]/          # Dynamic tree detail page
│   │   │   │   └── add-branch/ # Add branch to tree
│   │   │   └── page.tsx       # Tree listing/explore
│   │   ├── layout.tsx         # Root layout (theme provider)
│   │   ├── page.tsx           # Homepage
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── layout/            # Layout components (Footer, Header, etc.)
│   │   └── tree/              # Tree visualization components
│   ├── lib/                   # Utility libraries and services
│   │   ├── auth/              # Authentication utilities
│   │   │   └── auth-options.ts # NextAuth configuration
│   │   └── db/                # Database utilities
│   │       └── prisma.ts      # Prisma client singleton
│   ├── styles/                # Theme and styling
│   │   └── theme.ts           # MUI theme configuration
│   └── types/                 # TypeScript type definitions
│       └── next-auth.d.ts     # NextAuth type extensions
├── terraform/                  # AWS infrastructure as code
│   ├── modules/               # Reusable Terraform modules
│   ├── main.tf                # Main Terraform configuration
│   └── README.md              # Infrastructure documentation
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── DESIGN.md                  # Detailed design documentation
├── README.md                  # Project overview and setup
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies and scripts
└── tsconfig.json              # TypeScript configuration
```

### Key File Locations

- **Database Schema**: `prisma/schema.prisma`
- **Theme/Colors**: `src/styles/theme.ts`
- **Auth Config**: `src/lib/auth/auth-options.ts`
- **Prisma Client**: `src/lib/db/prisma.ts`
- **Environment Variables**: `.env.local` (create from `.env.example`)

---

## Development Environment

### Prerequisites

- Node.js 18+
- PostgreSQL (local or remote)
- npm (comes with Node.js)
- Git

### Setup Steps

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd avamae.org
   npm install
   ```

2. **Environment Variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database credentials
   ```

3. **Database Setup**
   ```bash
   npm run db:generate  # Generate Prisma client
   npm run db:push      # Push schema to database (dev)
   # OR
   npm run db:migrate   # Run migrations (production-like)
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   # Opens at http://localhost:3000
   ```

### Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev` | Start development server |
| `build` | `next build` | Build for production |
| `start` | `next start` | Start production server |
| `lint` | `next lint` | Run ESLint |
| `db:generate` | `prisma generate` | Generate Prisma client |
| `db:push` | `prisma db push` | Push schema to DB (dev) |
| `db:migrate` | `prisma migrate dev` | Create/run migrations |
| `db:studio` | `prisma studio` | Open Prisma Studio GUI |

### Environment Variables (Required)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/avamae?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# AWS (Production Only)
AWS_REGION="us-east-1"
AWS_S3_BUCKET="avamae-media"
AWS_CLOUDFRONT_DOMAIN="xxx.cloudfront.net"

# Email
EMAIL_FROM="noreply@avamae.org"

# OAuth (Optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

---

## Coding Conventions

### TypeScript

- **Strict Mode**: Enabled (`strict: true` in `tsconfig.json`)
- **Path Aliases**: Use `@/` for imports from `src/` directory
  ```typescript
  import { prisma } from "@/lib/db/prisma";
  import { authOptions } from "@/lib/auth/auth-options";
  ```
- **Type Safety**: Always define types, avoid `any` unless absolutely necessary
- **Naming**:
  - Files: `kebab-case.ts` or `PascalCase.tsx` (components)
  - Components: `PascalCase`
  - Functions: `camelCase`
  - Constants: `SCREAMING_SNAKE_CASE` or `camelCase`

### React Components

- **File Extension**: `.tsx` for components, `.ts` for utilities
- **Component Style**: Functional components with hooks
- **Server vs Client**:
  - Default to Server Components (no `'use client'`)
  - Add `'use client'` only when needed (hooks, event handlers, browser APIs)
- **Example**:
  ```typescript
  import { Container, Typography } from '@mui/material';

  export default function MyComponent() {
    return (
      <Container maxWidth="lg">
        <Typography variant="h1">Title</Typography>
      </Container>
    );
  }
  ```

### Material-UI Patterns

- **Theme**: Import from `@/styles/theme.ts`
- **Styling**: Use `sx` prop for component-level styles
- **Colors**: Use theme palette, not hardcoded hex values
  ```typescript
  <Box sx={{ color: 'primary.main', bgcolor: 'background.paper' }}>
  ```
- **Typography**: Use semantic variants (h1-h6, body1, body2)
- **Spacing**: Use theme spacing units (`sx={{ mt: 2, px: 3 }}`)

### File Organization

- **One component per file** (unless tightly coupled helper components)
- **Co-locate related files**: Keep components, types, and utilities together
- **Barrel exports**: Use `index.ts` for cleaner imports when appropriate
- **API Routes**: Mirror REST conventions
  - `app/api/trees/route.ts` → GET /api/trees, POST /api/trees
  - `app/api/trees/[id]/route.ts` → GET /api/trees/:id, PUT, DELETE

### Code Style

- **Indentation**: 2 spaces (enforced by ESLint)
- **Semicolons**: Optional but consistent within files
- **Quotes**: Double quotes for JSX attributes, single for JS/TS (preference)
- **Line Length**: ~80-100 characters (soft limit)
- **Comments**: Use JSDoc for functions, inline comments for complex logic

---

## Database Schema & Patterns

### Schema Overview

The database is defined in `prisma/schema.prisma` using Prisma ORM.

**Core Models**:
- `User` - Authentication and user profiles
- `Tree` - Memorial trees with privacy settings
- `TreeMember` - Membership and roles (many-to-many)
- `BranchType` - Extensible branch type definitions
- `Branch` - Impact events (hierarchical with parent-child)
- `BranchMedia` - Photos/videos for branches
- `Story` - Memories and tributes
- `StoryMedia` - Photos/videos for stories
- `MemberConnection` - Connections between community members
- `JoinRequest` - Requests to join trees
- `Invitation` - Invitation system with tokens

### Key Relationships

```
User (1) ─────> (n) Tree (owner)
User (n) ─────> (n) Tree (via TreeMember)
Tree (1) ─────> (n) Branch
Branch (1) ────> (n) Branch (parent-child hierarchy)
Branch (1) ────> (n) BranchMedia
Branch (1) ────> (n) Story
Tree (1) ──────> (n) Story
```

### Important Patterns

1. **Hierarchical Branches**: Branches can have sub-branches via `parentBranchId`
   ```prisma
   parentBranch    Branch?      @relation("BranchHierarchy", fields: [parentBranchId], references: [id])
   childBranches   Branch[]     @relation("BranchHierarchy")
   ```

2. **Soft Delete**: Currently not implemented; use `approved` field for moderation
3. **Timestamps**: All models have `createdAt` and `updatedAt` where applicable
4. **UUIDs**: All IDs use `@default(uuid())`
5. **Enums**: Visibility, ModerationMode, MemberRole, etc.

### Prisma Client Usage

```typescript
import { prisma } from "@/lib/db/prisma";

// Always use the singleton instance
const tree = await prisma.tree.findUnique({
  where: { id: treeId },
  include: {
    branches: true,
    members: true,
  },
});
```

### Database Indexing

Indexes are defined in schema for:
- Foreign keys (treeId, userId, branchId, etc.)
- Lookup fields (slug, email, token)
- Filter fields (visibility, approved, status)

---

## Authentication & Security

### NextAuth.js Configuration

- **Location**: `src/lib/auth/auth-options.ts`
- **Strategy**: JWT (not database sessions)
- **Providers**:
  - Credentials (email/password with bcrypt)
  - Google OAuth (optional)
- **Pages**: Custom sign-in at `/login`

### Session Access

```typescript
// Server Component
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export default async function ServerPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }
  // session.user.id, session.user.email, etc.
}
```

```typescript
// Client Component
'use client';
import { useSession } from "next-auth/react";

export default function ClientComponent() {
  const { data: session, status } = useSession();
  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") return <div>Not logged in</div>;
  // session.user available
}
```

### Authorization Patterns

**Role-Based Access Control (RBAC)**:
- Check `TreeMember.role` for permissions
- Roles: OWNER > ADMIN > CONTRIBUTOR > VIEWER
- Implement in API routes and server actions

```typescript
// Example: Check if user can edit tree
const membership = await prisma.treeMember.findUnique({
  where: {
    treeId_userId: {
      treeId: treeId,
      userId: session.user.id,
    },
  },
});

if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
  return new Response("Unauthorized", { status: 403 });
}
```

### Security Best Practices

1. **Password Hashing**: Always use bcrypt (never store plaintext)
2. **SQL Injection**: Prisma prevents this automatically
3. **XSS**: React escapes by default; be careful with `dangerouslySetInnerHTML`
4. **CSRF**: Next.js has built-in CSRF protection for API routes
5. **Environment Variables**: Never commit `.env.local` to git
6. **Input Validation**: Use Zod for schema validation on API routes

---

## Common Development Tasks

### Adding a New Page

1. Create file in `src/app/your-page/page.tsx`
2. Export default component
3. Add navigation link if needed

```typescript
// src/app/about/page.tsx
export default function AboutPage() {
  return <div>About</div>;
}
```

### Creating an API Route

1. Create `route.ts` in `src/app/api/your-endpoint/`
2. Export HTTP method handlers (GET, POST, PUT, DELETE)

```typescript
// src/app/api/trees/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const trees = await prisma.tree.findMany({
    where: { ownerId: session.user.id },
  });

  return NextResponse.json(trees);
}
```

### Modifying Database Schema

1. Edit `prisma/schema.prisma`
2. Run `npm run db:push` (dev) or `npm run db:migrate` (prod)
3. Regenerate client: `npm run db:generate`
4. Update TypeScript types as needed

### Adding a New Component

1. Create in `src/components/category/ComponentName.tsx`
2. Follow MUI patterns and theme
3. Export and import where needed

```typescript
// src/components/tree/BranchCard.tsx
import { Card, CardContent, Typography } from '@mui/material';
import { Branch } from '@prisma/client';

interface BranchCardProps {
  branch: Branch;
}

export default function BranchCard({ branch }: BranchCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{branch.title}</Typography>
        <Typography variant="body2">{branch.description}</Typography>
      </CardContent>
    </Card>
  );
}
```

### Working with Forms

Use controlled components with React state or form libraries:

```typescript
'use client';
import { useState } from 'react';
import { TextField, Button } from '@mui/material';

export default function MyForm() {
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    // Handle response
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        value={name}
        onChange={(e) => setName(e.target.value)}
        label="Name"
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

---

## Testing & Quality

### Current State

- **Testing**: Not yet implemented
- **Linting**: ESLint configured (run `npm run lint`)
- **Type Checking**: TypeScript strict mode enabled

### Planned Testing Strategy

- Unit tests: Jest + React Testing Library
- Integration tests: API route testing
- E2E tests: Playwright
- Visual regression: Chromatic or similar

### Code Quality Tools

- **ESLint**: `npm run lint` (extends `next/core-web-vitals`)
- **TypeScript**: Strict mode catches type errors
- **Prettier**: Not configured (follow ESLint + editor settings)

---

## Deployment & Infrastructure

### AWS Infrastructure

Managed via Terraform in `terraform/` directory.

**Resources**:
- AWS Amplify (hosting)
- RDS PostgreSQL (database)
- S3 (media storage)
- CloudFront (CDN)
- SES (email)

**Deployment Steps** (see `terraform/README.md`):
1. Configure `terraform.tfvars`
2. Run `terraform init`
3. Run `terraform plan`
4. Run `terraform apply`
5. Configure Amplify environment variables
6. Push to GitHub to trigger deployment

### Environment Variables in Production

Set in AWS Amplify console:
- `DATABASE_URL` (RDS connection string)
- `NEXTAUTH_URL` (production domain)
- `NEXTAUTH_SECRET` (generated secret)
- AWS credentials (via IAM if using roles)

### Build Process

```bash
npm run build  # Creates optimized production build
npm run start  # Runs production server
```

Next.js generates:
- Static pages (SSG)
- Server-rendered pages (SSR)
- API routes (serverless functions)

---

## AI Assistant Best Practices

### When Working on This Codebase

1. **Always Check Existing Patterns**: Review similar components/pages before creating new ones
2. **Respect the Design System**: Use theme colors, typography, and spacing
3. **Database Changes**: Always update `schema.prisma` first, then generate/migrate
4. **Authentication**: Check session in both API routes and pages
5. **Type Safety**: Leverage Prisma types (`import { Tree } from '@prisma/client'`)

### Before Making Changes

1. **Read `DESIGN.md`**: Understand the vision and design philosophy
2. **Check Recent Commits**: See what's been worked on recently
3. **Review Schema**: Understand relationships before querying
4. **Test Locally**: Run `npm run dev` and verify changes

### Common Pitfalls to Avoid

- ❌ Don't hardcode colors; use theme palette
- ❌ Don't create new Prisma clients; use singleton from `@/lib/db/prisma`
- ❌ Don't bypass authentication checks in API routes
- ❌ Don't modify migrations once created; create new ones
- ❌ Don't use `any` type; define proper interfaces
- ❌ Don't forget `'use client'` for components with interactivity

### Recommended Workflow

1. **Understand the Request**: Ask clarifying questions if needed
2. **Check Existing Code**: Find similar patterns in the codebase
3. **Plan the Changes**: Outline what files need to be modified
4. **Implement Incrementally**: Make small, testable changes
5. **Verify**: Check that changes align with design and functionality
6. **Document**: Add comments for complex logic

### File Reading Strategy

**Essential files to read first**:
- `README.md` - Project overview
- `DESIGN.md` - Design philosophy and feature details
- `prisma/schema.prisma` - Data model
- `src/styles/theme.ts` - Design tokens
- `src/lib/auth/auth-options.ts` - Auth configuration

**Before implementing a feature**:
- Read existing similar components
- Check API route patterns
- Review database schema relationships

### Communication with Users

- Be clear about what you're changing and why
- Explain trade-offs when there are multiple approaches
- Ask for confirmation on destructive actions (schema changes, deletions)
- Reference file paths and line numbers when discussing code

---

## Quick Reference

### Color Palette

```typescript
Primary (Warm Gold):    #D4AF37  // Tree of life, lasting legacy
Secondary (Soft Green): #8FBC8F  // Growth, renewal
Accent (Warm Coral):    #FF7F50  // Heart, connection
Background:             #FAF9F6  // Warm white
Text Primary:           #36454F  // Charcoal
Text Secondary:         #5A6C7D  // Gray
```

### Common Prisma Queries

```typescript
// Find unique with relations
const tree = await prisma.tree.findUnique({
  where: { id: treeId },
  include: { branches: true, members: true },
});

// Create with nested relations
const branch = await prisma.branch.create({
  data: {
    title: "New Branch",
    treeId: treeId,
    branchTypeId: typeId,
    createdByUserId: userId,
  },
});

// Update
await prisma.tree.update({
  where: { id: treeId },
  data: { rootPersonName: "New Name" },
});

// Delete (cascades defined in schema)
await prisma.tree.delete({
  where: { id: treeId },
});
```

### MUI Common Patterns

```typescript
// Container + spacing
<Container maxWidth="lg" sx={{ py: 4 }}>

// Responsive grid
<Grid container spacing={3}>
  <Grid item xs={12} md={6}>

// Card
<Card sx={{ borderRadius: 2 }}>
  <CardContent>

// Button with Link
<Button component={Link} href="/path" variant="contained">
```

---

## Additional Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **MUI Docs**: https://mui.com/material-ui/
- **NextAuth Docs**: https://next-auth.js.org/

---

## Project Vision

> "Avamae honors the truth that when a life ends, its impact continues to grow. Through this platform, we celebrate the countless ways one person's legacy blesses others - from the recipients of life-giving organs, to relationships healed, to foundations built, to simple acts of kindness inspired."

**This platform is dedicated to Ava's memory and to all those whose lives continue to make a difference in the world.**

---

**For questions or updates to this guide, please create an issue or submit a PR.**
