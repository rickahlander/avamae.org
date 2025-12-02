# Avamae - Honoring Lives, Growing Legacies

A legacy tree platform that celebrates how lives continue to bless others through organ donation, healed relationships, and lasting impact.

## Vision

Avamae represents a lost loved one as the roots and trunk of a new tree. The branches that grow are the lives touched as a result of the lost life - through organ donation, healed relationships, foundations created in their honor, and countless other ways their legacy continues to bless others for generations.

## Tech Stack

### Frontend
- **Next.js 15** (App Router with React Server Components)
- **React 19** (with `useActionState` and `useOptimistic` hooks)
- **Material-UI v7** (Material Design 3)
- **TypeScript** (strict mode)

### Backend
- **Next.js API Routes**
- **Prisma ORM** v6.1.0
- **PostgreSQL** (Supabase for production)
- **Clerk** (Authentication with webhook-based user sync)

### Infrastructure (Vercel + Supabase)
- **Vercel** (Next.js hosting with edge functions)
- **Supabase** (PostgreSQL database)
- **Vercel Blob** (Media storage)
- **Clerk** (Authentication)
- **Resend** (Transactional email service)

## Features

### Current Implementation
- ✅ **Authentication & Authorization**
  - Clerk authentication with Google OAuth and webhook sync
  - ACL permission system with superadmin support
  - Tree-level roles: OWNER, ADMIN, MODERATOR, CONTRIBUTOR, VIEWER
  - Branch-level roles: BRANCH_ADMIN, BRANCH_EDITOR, BRANCH_VIEWER

- ✅ **Legacy Tree Management**
  - Create and manage legacy trees (renamed from "memorial trees")
  - SEO-friendly slug-based URLs (e.g., `/trees/john-smith`)
  - Add branches (impact events) with hierarchical sub-branches
  - Interactive tree visualization with top-down layout
  - Branch editing and deletion with permission checks
  - URL links for trees and branches (obituaries, charity websites, etc.)
  - Social media/web links with auto-detected icons
  - Native share functionality (mobile) and clipboard copy (desktop)

- ✅ **Media Management**
  - Photo support for root person and branches
  - Multiple photos per tree/branch
  - Vercel Blob storage for production
  - Local storage option for development

- ✅ **Story Submission & Moderation**
  - User-submitted stories with photos and links
  - Email notifications to tree moderators (via Resend)
  - Story approval/rejection workflow
  - Privacy-protected author names for non-moderators
  - Dedicated story viewing pages

- ✅ **User Interface**
  - Material-UI v7 (Material Design 3)
  - Responsive design (mobile, tablet, desktop)
  - Dark/light theme support
  - Custom color palette (Warm Gold, Soft Green, Warm Coral)
  - User profile page

### Planned Features
- Browse/discover public trees
- Join requests and approvals
- Member connections within trees
- Donation links
- AI-generated impact summaries
- Advanced timeline with filters
- Custom branch types
- Impact metrics and statistics

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** (local installation)
- **Clerk Account** (for authentication)
- **Git**

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd avamae.org
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   
   The database should already be created with:
   - Database: `avamae`
   - Username: `fos_admin`
   - Password: `fos_password`

4. **Set up environment variables**
   
   Create `.env.local` with the following:

   ```env
   # Database
   DATABASE_URL="postgresql://fos_admin:fos_password@localhost:5432/avamae?schema=public"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   CLERK_WEBHOOK_SECRET=your_webhook_secret
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

   # Storage Configuration
   STORAGE_TYPE=local
   STORAGE_LOCAL_PATH=./public/uploads

   # AWS S3 (only if STORAGE_TYPE=s3)
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=avamae-media
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_CLOUDFRONT_DOMAIN=xxx.cloudfront.net

   # Email (Resend)
   RESEND_API_KEY=re_xxxxx

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Set up Clerk**
   
   - Create a Clerk account at https://clerk.com
   - Create a new application
   - Copy your publishable and secret keys to `.env.local`
   - Set up a webhook endpoint pointing to `/api/webhooks/clerk`
   - Subscribe to: `user.created`, `user.updated`, `user.deleted` events
   - Copy the webhook secret to `.env.local`

6. **Generate Prisma client**
   ```bash
   npm run db:generate
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   ```
   http://localhost:3000
   ```

### Database Management

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Create a migration
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio
```

## Project Structure

```
avamae.org/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (auth)/            # Auth route group
│   │   │   ├── sign-in/       # Sign-in page
│   │   │   └── sign-up/       # Sign-up page
│   │   ├── api/               # API routes
│   │   │   ├── trees/         # Tree CRUD operations
│   │   │   ├── branches/      # Branch CRUD operations
│   │   │   ├── stories/       # Story CRUD & approval
│   │   │   ├── webhooks/      # Clerk webhooks
│   │   │   ├── upload/        # S3 upload handler
│   │   │   └── health/        # Health check endpoint
│   │   ├── create-tree/       # Create tree page
│   │   ├── trees/             # Tree listing & detail pages
│   │   │   ├── [id]/          # Tree detail pages
│   │   │   │   ├── page.tsx   # Tree visualization
│   │   │   │   ├── view/      # Tree root node detail view
│   │   │   │   ├── edit-tree/ # Edit tree page
│   │   │   │   ├── add-branch/# Add branch page
│   │   │   │   ├── edit-branch/# Edit branch page
│   │   │   │   └── branches/  # Branch detail views
│   │   │   └── page.tsx       # Tree listing
│   │   ├── profile/           # User profile page
│   │   ├── icon.png           # Favicon
│   │   ├── layout.tsx         # Root layout with ClerkProvider
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── layout/            # Layout components (Header, Footer)
│   │   ├── tree/              # Tree visualization
│   │   ├── stories/           # Story submission & listing
│   │   └── ShareButton.tsx    # Share functionality component
│   ├── lib/                   # Utility libraries
│   │   ├── auth/              # Authentication utilities
│   │   ├── db/                # Prisma client singleton
│   │   ├── email/             # Resend email client & templates
│   │   │   └── templates/     # HTML email templates
│   │   ├── permissions/       # ACL permission checks
│   │   └── storage/           # Storage utilities (local/S3)
│   ├── utils/                 # Utility functions
│   │   ├── privacy.ts         # Name formatting for privacy
│   │   ├── slugify.ts         # URL slug generation
│   │   └── socialIcons.tsx    # Social media icon detection
│   ├── constants/             # Branch types and constants
│   ├── styles/                # Theme and global styles
│   └── types/                 # TypeScript type definitions
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed script for branch types
├── scripts/
│   └── fix-tree-slugs.ts      # Utility to fix bad slugs
├── terraform/                 # Legacy AWS infrastructure (deprecated)
├── Dockerfile                 # Legacy Docker config (deprecated)
├── middleware.ts              # Clerk authentication middleware
└── public/                    # Static assets
```

## Design System

### Color Palette
- **Primary (Warm Gold)**: #D4AF37 - Tree of life, lasting legacy
- **Secondary (Soft Green)**: #8FBC8F - Growth, renewal
- **Accent (Warm Coral)**: #FF7F50 - Heart, connection
- **Background**: #FAF9F6 - Warm white
- **Text**: #36454F - Charcoal

### Typography
- **Headers**: Playfair Display (serif) - Elegant, timeless
- **Body**: Inter (sans-serif) - Clean, readable

## Authentication

The application uses **Clerk** for authentication with webhook-based user synchronization:

- Sign-up/Sign-in handled by Clerk
- Users synced to PostgreSQL via webhooks
- Supports email/password and Google OAuth
- Role-based access control for tree management

## Storage Configuration

The application supports both local and S3 storage for media files:

- **Local Storage** (Development): Files stored in `./public/uploads`
- **S3 Storage** (Production): Files stored in AWS S3 with CloudFront CDN
- Configure via `STORAGE_TYPE` environment variable

## Deployment

Deploy to Vercel for simple, cost-effective hosting (~$0/month on Hobby tier).

### Deployment Method: Vercel

**Prerequisites:**
- Vercel account (Hobby or Pro)
- GitHub repository

**Deployment Steps:**

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel auto-detects Next.js

2. **Database (Supabase)**
   - Already configured with Supabase PostgreSQL
   - Use `POSTGRES_PRISMA_URL` as your `DATABASE_URL`

3. **Set up Vercel Blob**
   - In Vercel Dashboard → Storage → Create Database → Blob
   - Connect it to your project

4. **Configure Environment Variables**
   ```
   DATABASE_URL=${POSTGRES_PRISMA_URL}
   STORAGE_TYPE=vercel-blob
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   CLERK_WEBHOOK_SECRET=whsec_...
   RESEND_API_KEY=re_...
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```

5. **Deploy**
   ```bash
   git push origin main
   ```

6. **Run Database Migration**
   ```bash
   npx vercel env pull .env.local
   npx prisma db push
   npm run db:seed
   ```

**See [VERCEL-SETUP.md](./VERCEL-SETUP.md) for complete setup instructions.**

**🏗️ Infrastructure:**
- Vercel (Next.js hosting with edge functions)
- Vercel Postgres (managed PostgreSQL)
- Vercel Blob (media storage)
- Clerk (authentication)
- Resend (transactional email)

## Database Schema

The application uses a comprehensive PostgreSQL schema including:

- **Users**: Authentication and profiles (synced from Clerk)
- **Trees**: Legacy trees with SEO-friendly slugs, privacy settings, and URLs
- **TreeMedia**: Photos and media for trees (root person)
- **TreeLink**: Social media and web links for trees (with auto-detected icons)
- **TreeMembers**: Membership and roles (Owner, Admin, Moderator, Contributor, Viewer)
- **BranchTypes**: Extensible branch type definitions (seeded via `prisma/seed.ts`)
- **Branches**: Impact events with hierarchical parent-child relationships and URLs
- **BranchMedia**: Photos and videos for branches
- **Stories**: User-submitted memories and tributes with approval workflow
- **StoryMedia**: Photos and videos for stories
- **MemberConnections**: Connections between community members
- **JoinRequests**: Requests to join trees
- **Invitations**: Tree invitation system with tokens

See [prisma/schema.prisma](./prisma/schema.prisma) for full details.

## API Routes

### Trees
- `GET /api/trees` - List trees (query param: `view=my-trees` or `view=public`)
- `POST /api/trees` - Create a new tree (auto-generates unique slug)
- `GET /api/trees/[id]` - Get tree details (accepts UUID or slug)
- `PUT /api/trees/[id]` - Update tree (slug remains permanent)
- `DELETE /api/trees/[id]` - Delete tree (owner only)

### Branches
- `POST /api/branches` - Create a new branch (accepts branch type by name or ID)
- `GET /api/branches/[id]` - Get branch details
- `PUT /api/branches/[id]` - Update branch
- `DELETE /api/branches/[id]` - Delete branch (recursive)

### Stories
- `POST /api/stories` - Submit a new story (sends email to moderators)
- `GET /api/stories/[id]` - Get story details
- `PUT /api/stories/[id]` - Update story (author or admin)
- `DELETE /api/stories/[id]` - Delete story (author or admin)
- `GET /api/stories/[id]/approve` - Approve story via email link (moderator)
- `POST /api/stories/[id]/approve` - Approve story via API (moderator)
- `GET /api/stories/[id]/reject` - Reject story via email link (moderator)
- `POST /api/stories/[id]/reject` - Reject story via API (moderator)

### Webhooks
- `POST /api/webhooks/clerk` - Clerk user sync webhook

### Health
- `GET /api/health` - Health check endpoint (for ALB/ECS)

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with branch types
```

## Environment Variables

### Required

```env
# Database
DATABASE_URL="postgresql://fos_admin:fos_password@localhost:5432/avamae?schema=public"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
CLERK_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Storage
STORAGE_TYPE="local"  # or "s3"
STORAGE_LOCAL_PATH="./public/uploads"  # for local storage

# Email (Resend)
RESEND_API_KEY="re_..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # or "https://avamae.org" for production
```

### Vercel Production (auto-configured when connecting Vercel storage)

```env
# Vercel Postgres (auto-added)
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://...?pgbouncer=true"

# Vercel Blob (auto-added)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# Storage type (add manually)
STORAGE_TYPE="vercel-blob"
```

## Branch Types

The platform supports multiple types of impact branches:

- **Organ Donation** - Lives saved through organ/tissue donation
- **Healed Relationship** - Reconciled or restored relationships
- **Foundation/Organization** - Nonprofits or foundations created in honor
- **Charity Connection** - Ongoing charitable work inspired
- **Inspired Act of Kindness** - Kind acts inspired by the person's example
- **Life Touched/Changed** - Individual lives significantly impacted
- **Custom** - User-defined impact types

## Contributing

This project is currently in development. Contribution guidelines will be added soon.

## License

This project is dedicated to the memory of Ava and all those whose lives continue to bless others.

## Acknowledgments

Built with love to honor Ava's legacy and to help families celebrate how their loved ones continue to make a difference in the world.

---

**For detailed technical documentation, see:**
- [DESIGN.md](./DESIGN.md) - Design philosophy and feature details
- [CLAUDE.md](./CLAUDE.md) - AI assistant development guide
- [terraform/README.md](./terraform/README.md) - Infrastructure documentation
