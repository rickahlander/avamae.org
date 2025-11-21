# Manual AWS Deployment Guide (Without Terraform)

> **⚠️ DEPRECATED**: This guide is for AWS Amplify deployment, which has been replaced with AWS ECS + Fargate.
> 
> **For current deployment instructions, see [README.md](./README.md#deployment)**
> 
> **Note**: ECS deployment requires Docker and is best managed with Terraform rather than manual setup.

---

**Legacy Documentation Below** (kept for historical reference)

This guide walks you through setting up Avamae on AWS manually using the AWS Console.

**Estimated Time**: 45-60 minutes  
**Estimated Cost**: $45-70/month

## 📋 What You'll Create

1. RDS PostgreSQL Database
2. S3 Bucket for media storage
3. CloudFront CDN distribution
4. AWS Amplify app
5. (Optional) SES for email

---

## Step 1: Create RDS PostgreSQL Database

### 1.1 Go to RDS Console

1. Open AWS Console: https://console.aws.amazon.com
2. Search for "RDS" in the top search bar
3. Click **Databases** in the left sidebar
4. Click **Create database**

### 1.2 Configure Database

**Engine options:**
- Engine type: **PostgreSQL**
- Version: **PostgreSQL 16.1** (or latest)

**Templates:**
- Select: **Free tier** (if available) or **Production**

**Settings:**
- DB instance identifier: `avamae-production`
- Master username: `avamae_admin`
- Master password: `[CREATE STRONG PASSWORD]` (save this!)
- Confirm password: `[same password]`

**Instance configuration:**
- DB instance class: **Burstable classes (includes t classes)**
- Select: **db.t4g.micro** (cheapest ARM-based option)

**Storage:**
- Storage type: **General Purpose SSD (gp3)**
- Allocated storage: **20 GiB**
- ✅ Enable storage autoscaling
- Maximum storage threshold: **30 GiB**

**Connectivity:**
- Compute resource: **Don't connect to an EC2 compute resource**
- VPC: **(default VPC)**
- Public access: **Yes** (easier for now, restrict later)
- VPC security group: **Create new**
  - Name: `avamae-rds-sg`
- Availability Zone: **No preference**

**Database authentication:**
- Select: **Password authentication**

**Additional configuration:**
- Initial database name: `avamae`
- ✅ Enable automated backups
- Backup retention period: **1 day**
- ❌ Disable Enhanced monitoring (costs extra)
- ❌ Disable Performance Insights (costs extra)

### 1.3 Create Database

1. Click **Create database**
2. Wait **10-15 minutes** for provisioning
3. Once "Available", click on the database name
4. **Save these values:**
   - **Endpoint**: `avamae-production.xxxxx.us-east-1.rds.amazonaws.com`
   - **Port**: `5432`

### 1.4 Configure Security Group

1. In the database details, click on the VPC security group
2. Click **Edit inbound rules**
3. Click **Add rule**
4. Configure:
   - Type: **PostgreSQL**
   - Source: **Anywhere-IPv4** (0.0.0.0/0)
   - Description: `Temporary - restrict after testing`
5. Click **Save rules**

⚠️ **Security Note**: For production, restrict this to specific IPs or use AWS PrivateLink

### 1.5 Build Connection String

Format: `postgresql://[username]:[password]@[endpoint]:[port]/[database]`

Example:
```
postgresql://avamae_admin:YourPassword123@avamae-production.xxxxx.us-east-1.rds.amazonaws.com:5432/avamae
```

**Save this connection string!** You'll need it for Amplify.

---

## Step 2: Create S3 Bucket

### 2.1 Go to S3 Console

1. Search for "S3" in AWS Console
2. Click **Create bucket**

### 2.2 Configure Bucket

**General configuration:**
- Bucket name: `avamae-media-production` (must be globally unique)
- AWS Region: **US East (N. Virginia) us-east-1**

**Object Ownership:**
- Select: **ACLs disabled (recommended)**

**Block Public Access settings:**
- ✅ **Block all public access** (we'll use CloudFront)

**Bucket Versioning:**
- Select: **Enable**

**Default encryption:**
- Encryption type: **Server-side encryption with Amazon S3 managed keys (SSE-S3)**
- Bucket Key: **Enable**

### 2.3 Create Bucket

1. Click **Create bucket**
2. Click on the bucket name to open it

### 2.4 Configure CORS

1. Go to **Permissions** tab
2. Scroll to **Cross-origin resource sharing (CORS)**
3. Click **Edit**
4. Paste this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "https://avamae.org",
      "https://*.amplifyapp.com",
      "http://localhost:3000"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

5. Click **Save changes**

### 2.5 Configure Lifecycle Policy (Cost Savings)

1. Go to **Management** tab
2. Click **Create lifecycle rule**

**Rule 1: Transition old versions**
- Rule name: `transition-old-versions`
- ✅ Apply to all objects in the bucket
- ✅ I acknowledge that this rule will apply to all objects
- Lifecycle rule actions:
  - ✅ Transition noncurrent versions of objects between storage classes
  - ✅ Permanently delete noncurrent versions of objects
- Transition noncurrent versions:
  - Days after objects become noncurrent: `30`
  - Storage class: **Standard-IA**
- Delete noncurrent versions:
  - Days after becoming noncurrent: `90`
- Click **Create rule**

**Rule 2: Clean up incomplete uploads**
- Rule name: `abort-incomplete-uploads`
- ✅ Apply to all objects in the bucket
- Lifecycle rule actions:
  - ✅ Delete expired object delete markers or incomplete multipart uploads
- Delete incomplete multipart uploads:
  - Days: `7`
- Click **Create rule**

---

## Step 3: Create CloudFront Distribution

### 3.1 Go to CloudFront Console

1. Search for "CloudFront" in AWS Console
2. Click **Create distribution**

### 3.2 Configure Distribution

**Origin:**
- Origin domain: Select your S3 bucket `avamae-media-production.s3.amazonaws.com`
- Name: `S3-avamae-media` (auto-filled)
- Origin access: **Legacy access identities**
- Origin access identity: **Create new OAI**
  - Name: `avamae-media-oai`
- Bucket policy: **Yes, update the bucket policy**

**Default cache behavior:**
- Path pattern: **Default (*)**
- Compress objects automatically: **Yes**
- Viewer protocol policy: **Redirect HTTP to HTTPS**
- Allowed HTTP methods: **GET, HEAD, OPTIONS**
- Cache policy: **CachingOptimized**
- Origin request policy: **None**

**Settings:**
- Price class: **Use only North America and Europe**
- Alternate domain name (CNAME): *(leave empty for now)*
- Custom SSL certificate: **Default CloudFront Certificate**
- Default root object: *(leave empty)*
- Standard logging: **Off**
- IPv6: **On**

### 3.3 Create Distribution

1. Click **Create distribution**
2. Wait **5-10 minutes** for deployment (Status: "Deploying" → "Enabled")
3. **Save the Distribution domain name**: `d1234567890abc.cloudfront.net`

This is your `AWS_CLOUDFRONT_DOMAIN`!

---

## Step 4: Set Up AWS Amplify

### 4.1 Go to Amplify Console

1. Search for "Amplify" in AWS Console
2. Click **Get Started** (if first time) or **New app**
3. Select **Host web app**

### 4.2 Connect GitHub Repository

1. Select: **GitHub**
2. Click **Continue**
3. Authorize AWS Amplify (if needed)
4. Select:
   - Repository: `avamae.org` (or your repo name)
   - Branch: `main`
5. Click **Next**

### 4.3 Configure Build Settings

**App name:**
- `avamae-production`

**Environment name:**
- `production`

**Build and test settings:**
- Amplify auto-detects Next.js
- Keep the default build spec (or paste this):

```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
            - npx prisma generate
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
    appRoot: /
```

**Advanced settings:**
- Create new service role: **Create and use a new service role**

### 4.4 Review and Deploy

1. Click **Next**
2. Review settings
3. Click **Save and deploy**

**Initial deployment takes ~15-20 minutes**

---

## Step 5: Configure Amplify Environment Variables

### 5.1 Wait for First Build

1. Wait for the first build to complete (or fail - that's okay!)
2. In Amplify Console, go to your app

### 5.2 Add Environment Variables

1. Click **App settings** in the left sidebar
2. Click **Environment variables**
3. Click **Manage variables**
4. Add these variables (click **Add variable** for each):

**Database** (from Step 1):
```
DATABASE_URL
postgresql://avamae_admin:PASSWORD@avamae-production.xxxxx.rds.amazonaws.com:5432/avamae
```

**Storage** (from Steps 2 & 3):
```
STORAGE_TYPE
s3

AWS_REGION
us-east-1

AWS_S3_BUCKET
avamae-media-production

AWS_CLOUDFRONT_DOMAIN
d1234567890abc.cloudfront.net
```

**Clerk** (from Clerk Dashboard):
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
pk_live_xxxxx

CLERK_SECRET_KEY
sk_live_xxxxx

CLERK_WEBHOOK_SECRET
whsec_xxxxx

NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
/dashboard

NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
/dashboard
```

**Application**:
```
NODE_ENV
production

NEXT_TELEMETRY_DISABLED
1
```

5. Click **Save**

### 5.3 Redeploy

1. Go to **App settings** > **Rewrites and redirects**
2. Or just push a new commit to trigger a rebuild
3. Wait for successful deployment

---

## Step 6: Configure IAM for S3 Access

Your Amplify app needs permission to access S3.

### 6.1 Find Amplify Service Role

1. In Amplify Console, go to **App settings** > **General**
2. Find **Service role**: `amplifyconsole-backend-role`
3. Click on the role name (opens IAM console)

### 6.2 Add S3 Policy

1. Click **Add permissions** > **Attach policies**
2. Search for and attach: **AmazonS3FullAccess** (quick option)
   
   **OR** Create a custom policy (more secure):

3. Click **Add permissions** > **Create inline policy**
4. Select **JSON** tab
5. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::avamae-media-production",
        "arn:aws:s3:::avamae-media-production/*"
      ]
    }
  ]
}
```

6. Click **Review policy**
7. Name: `avamae-s3-access`
8. Click **Create policy**

---

## Step 7: Set Up Database

### 7.1 Run Migrations

From your local machine:

```bash
# Set the production database URL
export DATABASE_URL="postgresql://avamae_admin:PASSWORD@avamae-production.xxxxx.rds.amazonaws.com:5432/avamae"

# Push schema to production database
npx prisma db push

# Or run migrations
npx prisma migrate deploy
```

### 7.2 Verify Connection

```bash
# Open Prisma Studio connected to production
npx prisma studio
```

You should see your production database with empty tables.

---

## Step 8: Configure Clerk Production Webhook

### 8.1 Get Your Amplify URL

From Amplify Console:
- Your app is live at: `https://main.xxxxx.amplifyapp.com`

### 8.2 Create Webhook in Clerk

1. Go to Clerk Dashboard: https://dashboard.clerk.com
2. Select your application
3. Go to **Webhooks** in the sidebar
4. Click **Add Endpoint**
5. Configure:
   - Endpoint URL: `https://main.xxxxx.amplifyapp.com/api/webhooks/clerk`
   - Subscribe to events:
     - ✅ `user.created`
     - ✅ `user.updated`
     - ✅ `user.deleted`
6. Click **Create**
7. Copy the **Signing Secret** (starts with `whsec_`)
8. Go back to Amplify environment variables
9. Update `CLERK_WEBHOOK_SECRET` with this value
10. Redeploy Amplify app

---

## Step 9: Test Your Deployment

### 9.1 Visit Your Site

Open: `https://main.xxxxx.amplifyapp.com`

### 9.2 Test Authentication

1. Click **Sign Up**
2. Create an account
3. You should be redirected to dashboard

### 9.3 Verify Webhook Works

```bash
# Check production database
export DATABASE_URL="your_production_url"
npx prisma studio
```

You should see your user in the `users` table!

### 9.4 Test Photo Upload

1. Create a memorial tree
2. Upload a photo
3. Verify it appears (loaded from CloudFront)
4. Check S3 bucket - photo should be there

### 9.5 Check URLs

Right-click on an uploaded photo and copy image URL:
- Should start with: `https://d1234567890abc.cloudfront.net/uploads/...`
- ✅ Using CloudFront CDN

---

## Step 10: Configure Custom Domain (Optional)

### 10.1 In Amplify Console

1. Go to **App settings** > **Domain management**
2. Click **Add domain**
3. Enter your domain: `avamae.org`
4. Amplify will provide DNS records

### 10.2 Update DNS

In your domain registrar (Namecheap, GoDaddy, etc.):

1. Add the CNAME records provided by Amplify
2. Wait for DNS propagation (5-60 minutes)
3. Amplify will auto-provision SSL certificate
4. Your site will be live at `https://avamae.org`

### 10.3 Update CORS

Go back to S3 CORS configuration and update:
```json
"AllowedOrigins": [
  "https://avamae.org",
  "https://www.avamae.org",
  "https://*.amplifyapp.com",
  "http://localhost:3000"
]
```

---

## 📊 Summary of What You Created

| Service | Resource | Cost/Month |
|---------|----------|------------|
| RDS | db.t4g.micro PostgreSQL | ~$13 |
| S3 | Bucket with versioning | ~$1-2 |
| CloudFront | Distribution | ~$1-3 |
| Amplify | Next.js hosting | ~$30-50 |
| **Total** | | **$45-70** |

## 🎯 Key Information to Save

Create a file called `AWS-CREDENTIALS.txt` (don't commit!) with:

```
=== RDS Database ===
Endpoint: avamae-production.xxxxx.us-east-1.rds.amazonaws.com
Port: 5432
Username: avamae_admin
Password: [YOUR_PASSWORD]
Database: avamae
Full URL: postgresql://avamae_admin:[PASSWORD]@[ENDPOINT]:5432/avamae

=== S3 Bucket ===
Bucket Name: avamae-media-production
Region: us-east-1

=== CloudFront ===
Distribution ID: E1234567890ABC
Domain: d1234567890abc.cloudfront.net

=== Amplify ===
App ID: d1234567890abc
Region: us-east-1
URL: https://main.xxxxx.amplifyapp.com

=== Clerk ===
App ID: app_xxxxx
Webhook URL: https://main.xxxxx.amplifyapp.com/api/webhooks/clerk
```

## 🔄 Updating Your App

Just push to GitHub:
```bash
git push origin main
```

Amplify automatically builds and deploys!

## 🆘 Troubleshooting

### Build Fails

Check Amplify build logs:
1. Go to your app in Amplify Console
2. Click on the failing build
3. Expand each build step to see errors
4. Common issues:
   - Missing environment variables
   - Prisma generation fails (add to preBuild)
   - Node version mismatch

### Database Connection Issues

Test connection locally:
```bash
psql "postgresql://avamae_admin:PASSWORD@endpoint:5432/avamae"
```

Check:
- Security group allows connections from 0.0.0.0/0
- Database is "Available" status
- Credentials are correct

### S3 Upload Fails

Check:
- Amplify service role has S3 permissions
- Bucket name matches environment variable
- CORS is configured correctly

### Photos Don't Load

Check:
- CloudFront distribution is "Enabled" (not "Deploying")
- CloudFront domain in environment variables is correct
- S3 bucket policy allows CloudFront OAI access

---

## 🎉 You're Live!

Your Avamae platform is now running on AWS with:
- ✅ Auto-deployment from GitHub
- ✅ Cost-optimized infrastructure
- ✅ CDN for fast global access
- ✅ Secure authentication with Clerk
- ✅ Scalable database

**Next Steps:**
- Set up monitoring (CloudWatch)
- Configure billing alerts
- Plan for scaling as you grow

Need help? Check [DEPLOYMENT.md](./DEPLOYMENT.md) for more details!

