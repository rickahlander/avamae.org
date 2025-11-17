# Avamae Platform - Design Documentation

## Overview

Avamae is a memorial tree platform that honors lost loved ones by visualizing how their lives continue to bless others. The platform represents the deceased as the roots and trunk of a tree, with branches representing the ongoing impact of their life - through organ donation, healed relationships, foundations, and countless other ways their legacy continues.

## Core Concept

Each memorial tree is a living, breathing community that:
- Centers around a person who has passed away
- Grows branches representing lives touched and impact made
- Enables community members to collaborate and connect
- Supports multiple types of impact (organ donation, relationships, foundations, etc.)
- Allows branches to have their own sub-branches (generational impact)
- Provides both visual (tree) and chronological (timeline) views

## Design Principles

1. **Warm & Welcoming**: Design uses warm colors (gold, green, coral) and friendly, rounded shapes
2. **Organic & Living**: Tree visualization flows naturally, not rigid or mechanical
3. **Collaborative**: Community members can contribute stories, add branches, and connect
4. **Flexible**: Extensible branch types, customizable per tree
5. **Respectful**: Appropriate moderation and privacy controls

## User Types

1. **Tree Owner**: Creates and manages a memorial tree
2. **Admin**: Helps manage a tree (approvals, moderation)
3. **Contributor**: Can add branches and stories
4. **Viewer**: Can view and read, but not contribute
5. **Public Visitor**: Can browse public trees

## Key Features

### Memorial Trees
- Root person details (name, photo, dates, story, personality)
- Privacy settings (public, private, invite-only)
- Moderation modes (open or moderated)
- Community management
- Customizable settings

### Branches (Impact Events)
**Built-in Branch Types:**
- Organ Donation
- Healed Relationship
- Foundation/Organization
- Charity Connection
- Inspired Act of Kindness
- Life Touched/Changed
- Custom (extensible)

**Branch Features:**
- Hierarchical (branches can have sub-branches)
- Timeline placement
- Rich media (photos, videos)
- External links (donation pages, foundations)
- Privacy levels
- Approval workflow (optional)

### Stories & Memories
- About root person or specific branches
- Rich text and media
- Community contributions
- Optional approval workflow
- Chronological organization

### Community Features
- Member roles and permissions
- Direct connections between members (e.g., organ recipients)
- Join requests for public trees
- Invitation system
- Activity feeds (future)

### Visualizations
- **Tree View**: Interactive, organic tree visualization with expandable branches
- **Timeline View**: Chronological impact over time
- **Impact Summary**: Statistics and metrics showing collective good

### AI Features (Future)
- Story summarization
- Impact summaries
- Suggested connections
- Memory prompts
- Content moderation assistance

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 15 (App Router, SSR)
- **UI Library**: React 18
- **Component Library**: Material-UI v6 (Material Design 3)
- **Language**: TypeScript
- **Styling**: Emotion (CSS-in-JS via MUI)

### Backend Stack
- **API**: Next.js API Routes
- **Database**: PostgreSQL (AWS RDS)
- **ORM**: Prisma
- **Authentication**: NextAuth.js (database sessions)
- **File Storage**: Amazon S3
- **CDN**: Amazon CloudFront
- **Email**: Amazon SES

### Infrastructure (AWS)
- **Hosting**: AWS Amplify (Next.js with SSR support)
- **Database**: Amazon RDS (PostgreSQL, Multi-AZ in production)
- **Storage**: Amazon S3 (encrypted, versioned)
- **CDN**: Amazon CloudFront
- **Email**: Amazon SES
- **IaC**: Terraform

## Database Schema

### Core Tables
- `users` - User accounts and authentication
- `trees` - Memorial trees
- `tree_members` - Membership and roles
- `branch_types` - Extensible branch type definitions
- `branches` - Impact events (hierarchical)
- `branch_media` - Photos/videos for branches
- `stories` - Memories and tributes
- `story_media` - Photos/videos for stories
- `member_connections` - Connections between community members
- `join_requests` - Requests to join trees
- `invitations` - Invitation system

### Key Relationships
- Trees have many members (with roles)
- Branches are hierarchical (parent-child relationships)
- Stories can attach to root person or specific branches
- Users can be members of multiple trees
- Branch types can be system-wide or tree-specific

## Design System

### Color Palette
```
Primary (Warm Gold):    #D4AF37  - Tree of life, lasting legacy
Secondary (Soft Green): #8FBC8F  - Growth, renewal
Accent (Warm Coral):    #FF7F50  - Heart, connection
Background:             #FAF9F6  - Warm white
Text Primary:           #36454F  - Charcoal
Text Secondary:         #5A6C7D  - Gray
Borders:                #E8E8E8  - Light gray
```

### Typography
- **Headers**: Playfair Display (serif) - Elegant, timeless
- **Body**: Inter (sans-serif) - Clean, readable
- **Weights**: Regular (400), Medium (500), Semi-bold (600), Bold (700)

### Visual Style
- **Shape**: Rounded corners (12-16px radius)
- **Shadows**: Soft, subtle elevation
- **Animation**: Smooth, natural transitions
- **Spacing**: Generous whitespace
- **Accessibility**: WCAG AA compliant contrast ratios

## User Flows

### Creating a Tree
1. Sign up / Login
2. Click "Create Tree"
3. Enter root person details
4. Set privacy and moderation settings
5. Invite initial community members
6. Start adding branches and stories

### Adding a Branch
1. Navigate to tree
2. Click parent branch (or root)
3. Select branch type
4. Fill in details, story, media
5. Add external links if applicable
6. Submit (pending approval if moderated)

### Joining a Tree
**By Invitation:**
1. Receive email with invitation link
2. Click link (sign up if needed)
3. Accept invitation
4. Join tree with assigned role

**By Discovery:**
1. Browse public trees
2. Click "Request to Join"
3. Write message to tree owner
4. Wait for approval

### Contributing Stories
1. Navigate to tree or branch
2. Click "Add Story"
3. Write memory/tribute
4. Add photos/videos
5. Submit (pending approval if moderated)

## Implementation Phases

### Phase 1: MVP (Foundation)
**Status**: Design complete, infrastructure ready
- ✅ Project setup and configuration
- ✅ Database schema
- ✅ Authentication system
- ✅ AWS infrastructure (Terraform)
- ⏳ Tree creation and management
- ⏳ Basic branch creation
- ⏳ Story/memory creation
- ⏳ Simple tree visualization
- ⏳ Member invitations
- ⏳ Basic timeline view

### Phase 2: Community & Collaboration
- Tree discovery and browsing
- Join request workflow
- Enhanced tree visualization (animations)
- Member connections
- Approval workflows
- User profiles
- Donation link integration
- Email notifications

### Phase 3: Advanced Features
- AI-powered summaries
- Advanced timeline filters
- Custom branch types
- Impact metrics dashboard
- Social sharing
- Advanced search
- Memory calendar
- Mobile optimizations

### Phase 4: Scale & Polish
- Mobile apps (React Native)
- Multi-language support
- Foundation partnerships
- Donation processing
- Video stories
- Virtual memorial events
- Analytics dashboard

## Security & Privacy

### Authentication
- Secure password hashing (bcrypt)
- Session-based authentication
- OAuth support (Google, etc.)
- Email verification

### Data Protection
- Encrypted database (RDS encryption)
- HTTPS everywhere
- Private S3 buckets with CloudFront OAI
- Secure environment variable management

### Privacy Controls
- Three visibility levels (public, private, invite-only)
- Granular role-based permissions
- Optional content moderation
- User data export (GDPR compliance ready)

### Content Moderation
- Approval workflows for branches and stories
- Tree-level moderation settings
- Future: AI-assisted moderation

## Performance Considerations

### Frontend Optimization
- Server-side rendering (Next.js SSR)
- Image optimization (Next.js Image)
- Code splitting and lazy loading
- CloudFront CDN for static assets

### Database Optimization
- Indexed queries (tree_id, user_id, etc.)
- Efficient hierarchical queries for branches
- Connection pooling with Prisma
- Multi-AZ RDS in production

### Scalability
- Horizontal scaling via Amplify
- CloudFront for global distribution
- S3 for unlimited media storage
- PostgreSQL read replicas (future)

## Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast ratios (WCAG AA)
- Alternative text for images
- Captions for videos

## Testing Strategy (Future)

- Unit tests (Jest, React Testing Library)
- Integration tests (API routes)
- E2E tests (Playwright)
- Visual regression tests
- Accessibility audits
- Performance monitoring

## Monitoring & Analytics (Future)

- CloudWatch for infrastructure
- Error tracking (Sentry)
- Analytics (privacy-focused)
- Uptime monitoring
- Performance metrics
- User behavior insights

## Next Steps

1. **Complete MVP Features**:
   - Build tree creation UI
   - Implement branch management
   - Create story/memory components
   - Build tree visualization (SVG)
   - Add member invitation system

2. **Set Up AWS Infrastructure**:
   - Apply Terraform configuration
   - Configure DNS records
   - Set up SES for email
   - Deploy initial version to Amplify

3. **User Testing**:
   - Create Ava's memorial tree
   - Invite family members to test
   - Gather feedback
   - Iterate on design

4. **Launch Preparation**:
   - Content creation (about, help pages)
   - Legal (terms, privacy policy)
   - Marketing materials
   - Launch announcement

## Resources

- **Design Mockups**: [To be created]
- **API Documentation**: [To be created]
- **Component Library**: [To be created]
- **User Guide**: [To be created]

## Vision Statement

*"Avamae honors the truth that when a life ends, its impact continues to grow. Through this platform, we celebrate the countless ways one person's legacy blesses others - from the recipients of life-giving organs, to relationships healed, to foundations built, to simple acts of kindness inspired. Each branch represents hope, healing, and the enduring power of love."*

---

*This platform is dedicated to Ava's memory and to all those whose lives continue to make a difference in the world.*
