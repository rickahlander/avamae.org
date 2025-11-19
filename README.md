# Avamae - Honoring Lives, Growing Legacies

A memorial tree platform that celebrates how lives continue to bless others through organ donation, healed relationships, and lasting impact.

## Vision

Avamae represents a lost loved one as the roots and trunk of a new tree. The branches that grow are the lives touched as a result of the lost life - through organ donation, healed relationships, foundations created in their honor, and countless other ways their legacy continues to bless others for generations.

## Tech Stack

### Frontend
- **Next.js 15** (App Router with React Server Components)
- **React 18**
- **Material-UI v6** (Material Design 3)
- **TypeScript** (strict mode)

### Backend
- **Next.js API Routes**
- **Prisma ORM** v6.1.0
- **PostgreSQL** (local development & AWS RDS for production)
- **Clerk** (Authentication with webhook-based user sync)

### Infrastructure (AWS)
- **AWS Amplify** (Hosting with SSR)
- **Amazon RDS** (PostgreSQL database)
- **Amazon S3** (Media storage with local fallback)
- **Amazon CloudFront** (CDN)
- **Amazon SES** (Email service)
- **Terraform** (Infrastructure as Code)

## Features

### Current Implementation (MVP)
- ✅ User authentication (Clerk with Google OAuth and webhook sync)
- ✅ PostgreSQL database with Prisma ORM
- ✅ ACL permission system with superadmin support
  - **Superadmin**: Users with `is_super_admin` flag can do anything
  - **Tree-level roles**: OWNER, ADMIN, MODERATOR, CONTRIBUTOR, VIEWER
  - **Branch-level roles**: BRANCH_ADMIN, BRANCH_EDITOR, BRANCH_VIEWER
- ✅ Create and manage memorial trees
- ✅ Add branches (impact events) with hierarchical sub-branches
- ✅ Interactive tree visualization with top-down layout
- ✅ Branch editing and deletion with permission checks
- ✅ Photo support for root person and branches
- ✅ Flexible storage (local or S3 via environment config)
- ✅ User profile page

### Phase 2: Community (Planned)
- Browse/discover public trees
- Join requests and approvals
- Member connections within trees
- Share stories and memories
- Donation links
- Enhanced tree visualization with animations

### Phase 3: Advanced Features (Planned)
- AI-generated impact summaries
- Advanced timeline with filters
- Custom branch types
- Email notifications
- Social sharing
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
│   │   ├── (app)/             # App route group (protected)
│   │   ├── api/               # API routes
│   │   │   ├── trees/         # Tree CRUD operations
│   │   │   ├── branches/      # Branch CRUD operations
│   │   │   └── webhooks/      # Clerk webhooks
│   │   ├── create-tree/       # Create tree page
│   │   ├── trees/             # Tree listing & detail pages
│   │   ├── layout.tsx         # Root layout with ClerkProvider
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── auth/              # Authentication components
│   │   ├── tree/              # Tree visualization
│   │   ├── branch/            # Branch components
│   │   ├── story/             # Story/memory components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # Reusable UI components
│   ├── lib/                   # Utility libraries
│   │   ├── db/                # Prisma client singleton
│   │   └── storage/           # Storage utilities (local/S3)
│   ├── constants/             # Branch types and constants
│   ├── styles/                # Theme and global styles
│   └── types/                 # TypeScript type definitions
├── prisma/
│   └── schema.prisma          # Database schema
├── terraform/                 # AWS infrastructure
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

See [terraform/README.md](./terraform/README.md) for detailed AWS deployment instructions.

### Quick Deployment Steps

1. Configure Terraform variables
2. Run `terraform apply` in the `terraform/` directory
3. Set up DNS records (SES, domain)
4. Configure Amplify environment variables
5. Set up Clerk production webhook
6. Push code to trigger deployment

## Database Schema

The application uses a comprehensive PostgreSQL schema including:

- **Users**: Authentication and profiles (synced from Clerk)
- **Trees**: Memorial trees with privacy settings
- **TreeMembers**: Membership and roles (Owner, Admin, Contributor, Viewer)
- **BranchTypes**: Extensible branch type definitions
- **Branches**: Impact events with hierarchical parent-child relationships
- **BranchMedia**: Photos and videos for branches
- **Stories**: Memories and tributes
- **StoryMedia**: Photos and videos for stories
- **MemberConnections**: Connections between community members
- **JoinRequests**: Requests to join trees
- **Invitations**: Tree invitation system with tokens

See [prisma/schema.prisma](./prisma/schema.prisma) for full details.

## API Routes

### Trees
- `GET /api/trees` - List trees (query param: `view=my-trees` or `view=public`)
- `POST /api/trees` - Create a new tree
- `GET /api/trees/[id]` - Get tree details
- `PUT /api/trees/[id]` - Update tree
- `DELETE /api/trees/[id]` - Delete tree (owner only)

### Branches
- `POST /api/branches` - Create a new branch
- `GET /api/branches/[id]` - Get branch details
- `PUT /api/branches/[id]` - Update branch
- `DELETE /api/branches/[id]` - Delete branch (recursive)

### Webhooks
- `POST /api/webhooks/clerk` - Clerk user sync webhook

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

# Storage
STORAGE_TYPE="local"  # or "s3"
```

### Optional (S3 Storage)

```env
AWS_REGION="us-east-1"
AWS_S3_BUCKET="avamae-media"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_CLOUDFRONT_DOMAIN="xxx.cloudfront.net"
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
