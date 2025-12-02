# Quick Start Deployment

> ⚠️ **DEPRECATED**: This project has migrated to Vercel. See [VERCEL-SETUP.md](../VERCEL-SETUP.md) for current deployment instructions.

---

## ⚡ 5-Minute Setup

### 1. Prerequisites
- AWS CLI configured with `ahltrade` profile
- Terraform installed
- GitHub token ready

**⚠️ IMPORTANT: Always use the `ahltrade` AWS profile:**
```bash
export AWS_PROFILE=ahltrade
```

### 2. Configure Variables

Edit `terraform.tfvars`:
```hcl
db_password    = "YourStrongPassword123!"
repository_url = "https://github.com/YOUR_USERNAME/avamae.org"
github_token   = "ghp_YOUR_TOKEN"
```

### 3. Deploy

```bash
cd terraform
export AWS_PROFILE=ahltrade
terraform init
terraform apply  # Type 'yes'
```

Wait 15-20 minutes ☕

### 4. Get Outputs

```bash
terraform output
```

Copy these values:
- `amplify_default_domain` → Your app URL
- `database_url` → For migrations
- `cloudfront_domain` → For media

### 5. Configure Amplify

Go to AWS Console > Amplify > Environment Variables

Add from Clerk dashboard:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`

Add from Terraform outputs:
- `DATABASE_URL`
- `AWS_S3_BUCKET`
- `AWS_CLOUDFRONT_DOMAIN`

### 6. Push Code

```bash
git push origin main
```

Amplify auto-builds and deploys!

### 7. Setup Database

```bash
export DATABASE_URL="your_production_url"
npx prisma db push
```

### 8. Configure Clerk Webhook

Clerk Dashboard > Webhooks:
- URL: `https://YOUR_AMPLIFY_URL/api/webhooks/clerk`
- Events: `user.created`, `user.updated`, `user.deleted`

## 🎉 Done!

Visit your Amplify URL and test!

## 💰 Expected Costs

- **Total**: $45-70/month
- **Breakdown**: RDS ($13) + Amplify ($30-50) + S3 ($1-5) + SES ($0-1)

## 📖 Full Guide

See [DEPLOYMENT.md](../DEPLOYMENT.md) for complete instructions.

