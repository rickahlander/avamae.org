# Avamae Production Deployment Guide

> **⚠️ DEPRECATED**: This guide references AWS Amplify, which has been replaced with AWS ECS + Fargate.
> 
> **For current deployment instructions, see [README.md](./README.md#deployment)**

---

**Legacy Documentation Below** (kept for historical reference)

This guide walks you through deploying Avamae to AWS using Terraform with cost-optimized settings for low-traffic production.

## 🎯 Architecture Overview

**Cost-Optimized Production Stack:**
- **AWS Amplify**: Next.js 15 hosting with auto-build from GitHub (~$30-50/month)
- **RDS PostgreSQL (db.t4g.micro)**: ARM-based database (~$13/month)
- **S3 + CloudFront**: Media storage with CDN (~$1-5/month)
- **SES**: Email service (optional, ~$0-1/month)

**Estimated Monthly Cost: $45-70** (scales with usage)

## 📋 Prerequisites

Before deploying, ensure you have:

1. **AWS Account** with admin access
2. **AWS CLI** installed and configured
3. **Terraform** v1.0+ installed
4. **GitHub Account** with your repository
5. **Clerk Account** for authentication
6. **GitHub Personal Access Token** (for Amplify)
7. **Domain** (optional, but recommended)

## 🚀 Deployment Steps

### Step 1: Configure AWS Credentials

```bash
aws configure
# Enter your AWS Access Key ID, Secret Key, and region (us-east-1)
```

Verify connection:
```bash
aws sts get-caller-identity
```

### Step 2: Create GitHub Personal Access Token

1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (full control of private repositories)
4. Copy the token (starts with `ghp_`)

### Step 3: Configure Terraform Variables

Edit `terraform/terraform.tfvars`:

```hcl
# AWS Configuration
aws_region  = "us-east-1"
environment = "production"
domain_name = "avamae.org"  # Your actual domain

# Database Configuration
db_name     = "avamae"
db_username = "avamae_admin"
db_password = "STRONG_PASSWORD_HERE"  # Use a strong password!

# GitHub Configuration
repository_url = "https://github.com/YOUR_USERNAME/avamae.org"
github_token   = "ghp_YOUR_ACTUAL_GITHUB_TOKEN"
```

⚠️ **Security Note**: Never commit `terraform.tfvars` with real credentials!

### Step 4: Initialize Terraform

```bash
cd terraform
terraform init
```

This downloads the AWS provider and prepares your workspace.

### Step 5: Review Infrastructure Plan

```bash
terraform plan
```

Review the resources that will be created:
- RDS PostgreSQL instance (db.t4g.micro)
- S3 bucket with versioning and lifecycle policies
- CloudFront distribution
- Amplify app and branch
- Security groups and IAM roles
- SES email configuration

### Step 6: Deploy Infrastructure

```bash
terraform apply
```

Type `yes` when prompted. This takes **15-20 minutes** for:
- RDS instance provisioning
- CloudFront distribution setup
- Amplify app creation

### Step 7: Save Terraform Outputs

After deployment completes, save these outputs:

```bash
# Get all outputs
terraform output

# Save specific outputs
terraform output -raw database_url > ../database_url.txt
terraform output -raw amplify_app_id > ../amplify_app_id.txt
terraform output -raw cloudfront_domain > ../cloudfront_domain.txt
```

**Key outputs:**
- `amplify_app_id`: Your Amplify application ID
- `amplify_default_domain`: Your app URL (e.g., `main.xxxxx.amplifyapp.com`)
- `database_url`: PostgreSQL connection string
- `s3_media_bucket`: Media bucket name
- `cloudfront_domain`: CDN domain for media

### Step 8: Configure Amplify Environment Variables

1. Go to AWS Console > Amplify > Your App
2. Navigate to **App settings > Environment variables**
3. Add the following variables:

```
# Database (from Terraform output)
DATABASE_URL = postgresql://avamae_admin:PASSWORD@xxx.rds.amazonaws.com:5432/avamae

# AWS Configuration (from Terraform outputs)
AWS_REGION = us-east-1
AWS_S3_BUCKET = avamae-media-production
AWS_CLOUDFRONT_DOMAIN = xxx.cloudfront.net
STORAGE_TYPE = s3

# Clerk Authentication (from Clerk Dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_xxxxx
CLERK_SECRET_KEY = sk_live_xxxxx
CLERK_WEBHOOK_SECRET = whsec_xxxxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL = /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL = /sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = /dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = /dashboard

# Application
NODE_ENV = production
NEXT_TELEMETRY_DISABLED = 1
```

### Step 9: Configure Clerk Webhooks

1. Go to Clerk Dashboard > Webhooks
2. Create a new endpoint:
   - URL: `https://YOUR_AMPLIFY_DOMAIN/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
3. Copy the webhook signing secret
4. Add it to Amplify environment variables as `CLERK_WEBHOOK_SECRET`

### Step 10: Deploy Application

Push to your GitHub repository:

```bash
git add .
git commit -m "Production deployment configuration"
git push origin main
```

Amplify will automatically:
1. Detect the push
2. Build your Next.js app
3. Generate Prisma client
4. Deploy to production

Monitor the build in AWS Console > Amplify > Your App > Builds

### Step 11: Run Database Migrations

After the first successful build:

```bash
# Connect to your production database
export DATABASE_URL="postgresql://avamae_admin:PASSWORD@xxx.rds.amazonaws.com:5432/avamae"

# Run migrations
npx prisma migrate deploy

# Or push schema (for initial setup)
npx prisma db push
```

### Step 12: Test Your Deployment

1. Visit your Amplify URL: `https://main.xxxxx.amplifyapp.com`
2. Test authentication: Sign up with Clerk
3. Check database: User should be created via webhook
4. Upload a photo: Verify S3 storage works
5. Health check: Visit `/api/health`

## 🔧 Post-Deployment Configuration

### Custom Domain (Optional)

1. **In Amplify Console:**
   - Go to App settings > Domain management
   - Click "Add domain"
   - Follow the prompts to verify your domain

2. **Update DNS:**
   - Add CNAME records as instructed by Amplify
   - SSL certificate is automatically provisioned

### Enable Superadmin Access

Connect to your database and set a user as superadmin:

```sql
UPDATE users 
SET is_super_admin = true 
WHERE email = 'your-email@example.com';
```

### Cost Optimization Tips

1. **Disable SES Module** (if not using email):
   ```hcl
   # Comment out in terraform/main.tf
   # module "ses" { ... }
   ```

2. **Enable Amplify Build Notifications** (avoid unnecessary builds):
   - Go to Amplify > App settings > Notifications
   - Enable email/SNS for build failures only

3. **Monitor Usage**:
   ```bash
   # Check RDS costs
   aws ce get-cost-and-usage --time-period Start=2025-01-01,End=2025-01-31 --granularity MONTHLY --metrics BlendedCost --filter file://filter.json
   ```

4. **S3 Lifecycle** (already configured):
   - Old versions move to cheaper storage after 30 days
   - Deleted after 90 days

### Scaling for Growth

When you get more users, update these in `terraform/modules/rds/main.tf`:

```hcl
# Upgrade database
instance_class = "db.t4g.small"  # or db.t4g.medium

# Enable Multi-AZ for high availability
multi_az = true
```

Then apply changes:
```bash
cd terraform
terraform apply
```

## 🔒 Security Checklist

- [ ] Strong database password (20+ characters)
- [ ] `terraform.tfvars` added to `.gitignore`
- [ ] Clerk production keys (not test keys)
- [ ] Database publicly_accessible should be `false` in production (requires VPN/bastion)
- [ ] Enable RDS encryption at rest (already enabled)
- [ ] CloudWatch logging for RDS (optional, costs extra)
- [ ] Regular database backups (automatic with 7-day retention)
- [ ] Enable CloudTrail for audit logging

## 🐛 Troubleshooting

### Build Failures

**Problem**: Amplify build fails with Prisma error

**Solution**:
```bash
# Ensure prisma is in dependencies (not devDependencies)
npm install @prisma/client prisma --save
```

**Problem**: "Module not found" errors

**Solution**: Check your `package.json` has all dependencies (not using pnpm/yarn features)

### Database Connection Issues

**Problem**: "Connection timeout" or "Cannot connect to database"

**Solution**:
1. Check security group allows connections from Amplify
2. Verify DATABASE_URL in Amplify environment variables
3. Ensure database is publicly accessible (temporarily for debugging)

### S3 Upload Failures

**Problem**: Photos not uploading to S3

**Solution**:
1. Verify `AWS_S3_BUCKET` and `AWS_CLOUDFRONT_DOMAIN` in Amplify
2. Check IAM role has S3 permissions (Amplify auto-creates this)
3. Verify CORS configuration in S3 bucket

### Webhook Issues

**Problem**: Users not syncing from Clerk

**Solution**:
1. Check webhook URL is correct
2. Verify `CLERK_WEBHOOK_SECRET` matches Clerk dashboard
3. Check Amplify logs for webhook errors

## 📊 Monitoring

### CloudWatch Dashboards

1. Go to CloudWatch > Dashboards
2. Create dashboard with:
   - RDS CPU/Memory usage
   - S3 request metrics
   - Amplify build/deployment metrics

### Cost Alerts

```bash
# Create billing alarm for $100/month
aws cloudwatch put-metric-alarm \
  --alarm-name billing-alarm \
  --alarm-description "Alert when spending exceeds $100" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 100 \
  --comparison-operator GreaterThanThreshold
```

## 🔄 Updates and Maintenance

### Updating the Application

Just push to GitHub:
```bash
git push origin main
```

Amplify auto-builds and deploys.

### Database Migrations

```bash
# Create migration
npx prisma migrate dev --name your_migration_name

# Deploy to production
export DATABASE_URL="your_production_url"
npx prisma migrate deploy
```

### Infrastructure Updates

```bash
cd terraform
terraform plan    # Review changes
terraform apply   # Apply updates
```

## 🆘 Support & Resources

- **AWS Support**: https://console.aws.amazon.com/support
- **Amplify Docs**: https://docs.amplify.aws
- **Clerk Docs**: https://clerk.com/docs
- **Terraform AWS Provider**: https://registry.terraform.io/providers/hashicorp/aws

## 📝 Estimated Costs Breakdown

| Service | Configuration | Est. Monthly Cost |
|---------|--------------|-------------------|
| RDS PostgreSQL | db.t4g.micro, 20GB | $13 |
| Amplify | Low traffic, auto-build | $30-50 |
| S3 + CloudFront | <1GB transfer | $1-5 |
| SES | <1000 emails | $0-1 |
| **Total** | | **$45-70** |

*Note: Costs vary by actual usage. First month might be higher due to setup costs.*

## 🎉 You're Live!

Your Avamae platform is now running on AWS with:
✅ Auto-deployment from GitHub (push to deploy)
✅ Cost-optimized for low traffic
✅ Production-ready security
✅ Scalable architecture
✅ Automatic backups

Visit your site and start honoring legacies! 🌳

