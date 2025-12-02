# Vercel Deployment Guide

> **Platform**: Vercel (Hobby/Pro)  
> **Last Updated**: December 2, 2025  
> **Project ID**: `prj_xtiKlAuT5km3KcdnDPBef28roS5n`

This guide walks you through deploying Avamae to Vercel with Supabase (PostgreSQL) and Vercel Blob storage.

## Prerequisites

- Vercel account (Hobby or Pro)
- GitHub repository connected to Vercel
- Supabase account (database) ✅ Already configured
- Clerk account for authentication
- Resend account for email

## Step 1: Database (Supabase) ✅ DONE

Supabase PostgreSQL is already configured:
- **Project**: `sfbmnaalmfzoxqxejfgo`
- **Region**: AWS us-east-1

## Step 2: Vercel Blob Store ✅ DONE

Vercel Blob is already configured and connected to your project.

## Step 3: Configure Environment Variables

Go to your project **Settings → Environment Variables** and add:

### Database (Supabase)
```
DATABASE_URL=postgres://postgres.sfbmnaalmfzoxqxejfgo:YOUR_PASSWORD@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```
(Use the `POSTGRES_PRISMA_URL` value - it includes pgbouncer for connection pooling)

### Blob Storage (auto-added if you connected Vercel Blob)
```
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

### Storage Type (add manually)
```
STORAGE_TYPE=vercel-blob
```

### Clerk Authentication (add manually)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Email (add manually)
```
RESEND_API_KEY=re_...
```

### App URL (add manually)
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```
(Update this when you add a custom domain)

## Step 4: Update Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → Webhooks
2. Update or create webhook endpoint:
   - **URL**: `https://your-project.vercel.app/api/webhooks/clerk`
   - **Events**: `user.created`, `user.updated`, `user.deleted`
3. Copy the signing secret to `CLERK_WEBHOOK_SECRET`

## Step 5: Deploy

### Option A: Auto-deploy from GitHub
Just push to your main branch:
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

### Option B: Manual Deploy via CLI
```bash
npx vercel --prod
```

## Step 6: Run Database Migration

After the first deployment, run Prisma migration:

### Using Vercel CLI
```bash
# Pull environment variables locally
npx vercel env pull .env.local

# Run migration
npx prisma db push

# Seed branch types (first time only)
npm run db:seed
```

### Or via Vercel Dashboard
1. Go to your project
2. Click **Deployments** → latest deployment
3. Click **Functions** tab
4. You can trigger a one-time migration script

## Step 7: Add Custom Domain (Optional)

1. Go to project **Settings → Domains**
2. Add your domain: `avamae.org`
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain
5. Update Clerk webhook URL to use custom domain

## Troubleshooting

### Build Fails with Prisma Error
Ensure `DATABASE_URL` is set in environment variables. Vercel Postgres uses `POSTGRES_PRISMA_URL` by default, so you may need to add:
```
DATABASE_URL=${POSTGRES_PRISMA_URL}
```

### Images Not Loading
Check that `STORAGE_TYPE=vercel-blob` is set and `BLOB_READ_WRITE_TOKEN` exists.

### Webhook Not Working
1. Check webhook URL matches your Vercel deployment URL
2. Verify `CLERK_WEBHOOK_SECRET` is correct
3. Check Vercel function logs for errors

### Database Connection Issues
- Vercel Postgres requires `?pgbouncer=true` for pooled connections
- Use `POSTGRES_PRISMA_URL` for Prisma (includes pgbouncer)
- Use `POSTGRES_URL_NON_POOLING` for migrations

## Cost Estimate (Hobby Tier)

| Service | Hobby Limit | Overage |
|---------|-------------|---------|
| Vercel Hosting | 100GB bandwidth | $0.15/GB |
| Vercel Postgres | 256MB storage | Upgrade to Pro |
| Vercel Blob | 1GB storage | $0.15/GB |
| **Total** | **$0/month** | Pay as you go |

## Migrating Data from AWS

### Database Migration
If you have existing data in AWS RDS:

1. Export from RDS:
```bash
pg_dump -h your-rds-endpoint -U username -d avamae > backup.sql
```

2. Import to Vercel Postgres:
```bash
# Get connection string from Vercel dashboard (non-pooling URL)
psql "postgres://..." < backup.sql
```

### Media Migration
If you have existing files in S3:

1. Download from S3:
```bash
aws --profile ahltrade s3 sync s3://your-bucket ./media-backup
```

2. Upload to Vercel Blob (you'll need a script or manual upload)
   - Consider keeping S3 for existing files and using Vercel Blob for new uploads
   - Or update database URLs to point to new Vercel Blob URLs after migration

## Environment Variables Summary

| Variable | Required | Source |
|----------|----------|--------|
| `DATABASE_URL` | Yes | Vercel Postgres (use POSTGRES_PRISMA_URL) |
| `BLOB_READ_WRITE_TOKEN` | Yes | Vercel Blob |
| `STORAGE_TYPE` | Yes | Set to `vercel-blob` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk Dashboard |
| `CLERK_SECRET_KEY` | Yes | Clerk Dashboard |
| `CLERK_WEBHOOK_SECRET` | Yes | Clerk Webhooks |
| `RESEND_API_KEY` | Yes | Resend Dashboard |
| `NEXT_PUBLIC_APP_URL` | Yes | Your Vercel/custom domain |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Yes | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Yes | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Yes | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Yes | `/dashboard` |

