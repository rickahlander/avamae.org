# Avamae - Honoring Lives, Growing Legacies

A memorial tree platform that celebrates how lives continue to bless others through organ donation, healed relationships, and lasting impact.

## Vision

Avamae represents a lost loved one as the roots and trunk of a new tree. The branches that grow are the lives touched as a result of the lost life - through organ donation, healed relationships, foundations created in their honor, and countless other ways their legacy continues to bless others for generations.

## Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **React 18**
- **Material-UI v6** (Material Design 3)
- **TypeScript**

### Backend
- **Next.js API Routes**
- **Prisma ORM**
- **PostgreSQL** (AWS RDS)
- **NextAuth.js** (Authentication)

### Infrastructure (AWS)
- **AWS Amplify** (Hosting with SSR)
- **Amazon RDS** (PostgreSQL database)
- **Amazon S3** (Media storage)
- **Amazon CloudFront** (CDN)
- **Amazon SES** (Email service)
- **Terraform** (Infrastructure as Code)

## Features (Planned)

### Phase 1: MVP
- ✅ User authentication (email/password, Google)
- ✅ Create memorial trees
- ✅ Add branches (impact events)
- ✅ Share stories and memories
- ✅ Tree visualization
- ✅ Timeline view
- ✅ Invite community members

### Phase 2: Community
- Browse/discover public trees
- Join requests and approvals
- Member connections within trees
- Donation links
- Enhanced tree visualization with animations

### Phase 3: Advanced Features
- AI-generated impact summaries
- Advanced timeline with filters
- Custom branch types
- Email notifications
- Social sharing
- Impact metrics and statistics

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** (local or remote)
- **AWS Account** (for deployment)
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

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your database credentials and other configuration.

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database (for development)
   npm run db:push

   # Or run migrations (for production)
   npm run db:migrate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
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
│   ├── app/                 # Next.js app router pages
│   │   ├── (auth)/         # Auth pages (login, signup)
│   │   ├── (app)/          # Main app pages (dashboard, trees)
│   │   └── api/            # API routes
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── tree/           # Tree visualization
│   │   ├── branch/         # Branch components
│   │   ├── story/          # Story/memory components
│   │   ├── layout/         # Layout components
│   │   └── ui/             # Reusable UI components
│   ├── lib/                # Utility libraries
│   │   ├── auth/           # Authentication utilities
│   │   ├── db/             # Database client
│   │   ├── s3/             # S3 utilities
│   │   ├── email/          # Email utilities
│   │   └── ai/             # AI integration
│   ├── styles/             # Global styles and theme
│   └── types/              # TypeScript type definitions
├── prisma/
│   └── schema.prisma       # Database schema
├── terraform/              # AWS infrastructure
│   ├── modules/            # Terraform modules
│   └── main.tf             # Main configuration
└── public/                 # Static assets
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

## Database Schema

The application uses a comprehensive schema including:
- **Users**: Authentication and profiles
- **Trees**: Memorial trees with privacy settings
- **Branches**: Impact events (organ donation, relationships, etc.)
- **Stories**: Memories and tributes
- **Connections**: Community member relationships
- **Media**: Photos and videos
- **Invitations**: Tree access management

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

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand"

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

## License

This project is dedicated to the memory of Ava and all those whose lives continue to bless others.

## Acknowledgments

Built with love to honor Ava's legacy and to help families celebrate how their loved ones continue to make a difference in the world.
