# Avamae - Honoring Lives, Growing Legacies

A memorial tree platform that celebrates how lives continue to bless others through organ donation, healed relationships, and lasting impact.

## Vision

Avamae represents a lost loved one as the roots and trunk of a new tree. The branches that grow are the lives touched as a result of the lost life - through organ donation, healed relationships, foundations created in their honor, and countless other ways their legacy continues to bless others for generations.

## Current Development Status

**Phase**: MVP Development (Local Storage)

The application is currently in active MVP development using browser localStorage for data persistence. This allows rapid prototyping and testing of core features before migrating to a full production database.

**Current Features**:
- ✅ Create memorial trees with detailed profiles
- ✅ Profile photo and photo gallery for root person
- ✅ Top-down tree visualization with curved connection lines
- ✅ Add branches (impact events) with multiple types
- ✅ Sub-branches (multi-level hierarchy)
- ✅ Edit branches and root person details
- ✅ Delete branches (with recursive child deletion)
- ✅ Photo upload with automatic compression
- ✅ Responsive layout (mobile/desktop)

**Upcoming Features**:
- Database migration (localStorage → PostgreSQL)
- User authentication (NextAuth.js)
- Photo storage migration (localStorage → S3)
- Community features (sharing, invitations)
- Stories and memories

## Tech Stack

### Frontend
- **Next.js 15** (App Router with Server Components)
- **React 18.3**
- **Material-UI v6** (Material Design 3)
- **TypeScript** (strict mode)
- **Emotion** (CSS-in-JS via MUI)

### Backend (Production Ready)
- **Next.js API Routes**
- **Prisma ORM v6.1**
- **PostgreSQL** (AWS RDS)
- **NextAuth.js v4** (JWT strategy)

### Current MVP Storage
- **Browser localStorage** (with image compression)
- **Base64 image encoding** (transitioning to S3)

### Infrastructure (AWS - Production)
- **AWS Amplify** (Hosting with SSR)
- **Amazon RDS** (PostgreSQL database)
- **Amazon S3** (Media storage)
- **Amazon CloudFront** (CDN)
- **Amazon SES** (Email service)
- **Terraform** (Infrastructure as Code)

## Development Roadmap

### ✅ Phase 1: Core Tree Features (Current - MVP)
- ✅ Create memorial trees with profile photos
- ✅ Add branches with 6 predefined types
- ✅ Multi-level branch hierarchy (sub-branches)
- ✅ Edit and delete functionality
- ✅ Photo upload with compression (max 800px, 70% quality)
- ✅ Top-down tree visualization with SVG connections
- ✅ localStorage persistence

### 🚧 Phase 2: Database & Authentication
- Migrate to PostgreSQL with Prisma ORM
- User authentication (NextAuth.js)
- Photo storage on S3 with CloudFront delivery
- Tree privacy settings (public/private)
- Member roles and permissions

### 📋 Phase 3: Community Features
- Share stories and memories
- Invite community members
- Browse/discover public trees
- Join requests and approvals
- Member connections within trees
- Donation links

### 🔮 Phase 4: Advanced Features
- Timeline view with filters
- AI-generated impact summaries
- Custom branch types
- Email notifications (SES)
- Social sharing
- Impact metrics and statistics
- Enhanced animations

## Getting Started

### Prerequisites

**For MVP Development (Current)**:
- **Node.js** 18+ and npm
- **Git**

**For Production Deployment (Future)**:
- **PostgreSQL** (local or remote)
- **AWS Account**

### Quick Start (MVP Mode)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd avamae.org
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

That's it! The app will use localStorage for data persistence. No database setup required for MVP testing.

### Setting Up Database (Optional - For Future Migration)

When you're ready to migrate to PostgreSQL:

1. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your database credentials.

2. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database (for development)
   npm run db:push

   # Or run migrations (for production)
   npm run db:migrate
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
│   ├── app/                    # Next.js 15 App Router
│   │   ├── create-tree/       # Create new memorial tree
│   │   ├── trees/             # Tree pages
│   │   │   ├── [id]/          # Dynamic tree detail page
│   │   │   │   ├── add-branch/      # Add branch to tree
│   │   │   │   ├── edit-branch/     # Edit existing branch
│   │   │   │   └── edit-tree/       # Edit tree root person
│   │   │   └── page.tsx       # Tree listing (future)
│   │   ├── api/               # API routes (future auth endpoints)
│   │   ├── layout.tsx         # Root layout with theme provider
│   │   ├── page.tsx           # Homepage
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── layout/           # Layout components (Footer, Header)
│   │   └── tree/             # Tree visualization components
│   │       └── TreeVisualization.tsx  # Main tree component
│   ├── lib/                  # Utility libraries
│   │   ├── auth/             # Authentication (NextAuth config)
│   │   └── db/               # Database (Prisma client)
│   ├── styles/               # Theme and styling
│   │   └── theme.ts          # MUI theme configuration
│   └── types/                # TypeScript type definitions
│       └── next-auth.d.ts    # NextAuth type extensions
├── prisma/
│   └── schema.prisma         # Database schema (for production)
├── terraform/                # AWS infrastructure as code
│   ├── modules/              # Reusable Terraform modules
│   ├── main.tf               # Main Terraform configuration
│   └── README.md             # Infrastructure documentation
├── public/                   # Static assets
├── CLAUDE.md                 # AI assistant guide for codebase
├── DESIGN.md                 # Detailed design documentation
└── .env.example              # Environment variables template
```

## Design System

### Color Palette
- **Primary (Warm Gold)**: #D4AF37 - Tree of life, lasting legacy
- **Secondary (Soft Green)**: #8FBC8F - Growth, renewal
- **Accent (Warm Coral)**: #FF7F50 - Heart, connection
- **Background**: #FAF9F6 - Warm white
- **Text Primary**: #36454F - Charcoal
- **Text Secondary**: #5A6C7D - Gray

### Typography
- **Headers**: Playfair Display (serif) - Elegant, timeless
- **Body**: Inter (sans-serif) - Clean, readable

### Branch Types

Six predefined branch types represent different ways a life continues to bless others:

1. **Organ Donation** ❤️ - Recipients of life-giving organs
2. **Healed Relationship** 🤝 - Reconciliations and restored connections
3. **Foundation/Organization** 🏛️ - Foundations created in their honor
4. **Charity Connection** 🎗️ - Charitable impact and causes
5. **Inspired Act of Kindness** ✨ - Acts inspired by their example
6. **Life Touched/Changed** 🌟 - Lives directly impacted

### Tree Visualization

**Layout**: Top-down hierarchical structure
- **Root Person Card**: Large (800px max width) gold gradient card at top
  - Profile photo (120x120) with fallback icon
  - Name, dates (birth-death years)
  - Biography/story (scrollable)
  - Photo gallery (4 thumbnails + counter)
  - Branch count statistics

- **Branches**: Flow vertically downward
  - Connected via curved SVG paths (soft green #8FBC8F)
  - Support unlimited nesting (sub-branches)
  - Compact cards (180px wide)
  - Edit and delete controls

## Deployment

See [terraform/README.md](./terraform/README.md) for detailed AWS deployment instructions.

### Quick Deployment Steps

1. Configure Terraform variables
2. Run `terraform apply` in the `terraform/` directory
3. Set up DNS records (SES, domain)
4. Configure Amplify environment variables
5. Push code to trigger deployment

## Contributing

This project is currently in development. Contribution guidelines will be added soon.

## Data Architecture

### Current MVP (localStorage)

Data is stored in browser localStorage with the following structure:

**Trees** (stored as `tree-{id}`):
```typescript
{
  id: string,
  rootPersonName: string,
  rootPersonBirthDate?: string,
  rootPersonDeathDate?: string,
  rootPersonStory?: string,
  rootPersonProfilePhoto?: string,  // Base64 encoded, compressed
  rootPersonPhotos?: string[],      // Array of base64 images
  branches: [
    {
      id: string,
      title: string,
      type: string,  // organ_donation, healed_relationship, etc.
      description?: string,
      dateOccurred?: string,
      parentBranchId?: string | null,  // For sub-branches
      photos?: string[],  // Base64 encoded, compressed
      createdAt: string,
      updatedAt?: string
    }
  ],
  createdAt: string,
  updatedAt?: string
}
```

**Image Compression**:
- Max dimensions: 800px (maintains aspect ratio)
- Format: JPEG at 70% quality
- Reduces file size by ~80-90%
- Prevents localStorage quota errors

**Trees List** (stored as `trees`):
- Array of all tree objects for quick access

### Future Database Schema (PostgreSQL)

The production schema (defined in `prisma/schema.prisma`) includes:
- **Users**: Authentication and profiles
- **Trees**: Memorial trees with privacy settings
- **Branches**: Impact events with hierarchical relationships
- **BranchTypes**: Extensible branch type definitions
- **Stories**: Memories and tributes
- **TreeMembers**: Role-based access control
- **Connections**: Community member relationships
- **Media**: S3-backed photos and videos
- **Invitations**: Tree access management with tokens

See [prisma/schema.prisma](./prisma/schema.prisma) for full details.

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

### MVP Development (Current)

No environment variables required! The app works out of the box with localStorage.

### Production Deployment (Future)

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/avamae?schema=public"

# Authentication
NEXTAUTH_URL="http://localhost:3000"  # or your production domain
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# AWS (Production)
AWS_REGION="us-east-1"
AWS_S3_BUCKET="avamae-media"
AWS_CLOUDFRONT_DOMAIN="xxx.cloudfront.net"

# Email
EMAIL_FROM="noreply@avamae.org"

# OAuth (Optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

See `.env.example` for a complete template.

## License

This project is dedicated to the memory of Ava and all those whose lives continue to bless others.

## Acknowledgments

Built with love to honor Ava's legacy and to help families celebrate how their loved ones continue to make a difference in the world.
