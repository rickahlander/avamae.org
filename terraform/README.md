# Avamae Infrastructure (Terraform)

This directory contains the Terraform configuration for deploying the Avamae platform to AWS.

## Prerequisites

1. **Terraform** installed (>= 1.0)
2. **AWS CLI** configured with appropriate credentials
3. **AWS Account** with necessary permissions
4. **GitHub Personal Access Token** (for Amplify deployment)

## Infrastructure Components

- **RDS PostgreSQL**: Database for application data
- **S3 + CloudFront**: Media storage and CDN
- **AWS Amplify**: Next.js application hosting with SSR
- **SES**: Email service for notifications and invitations

## Setup Instructions

### 1. Configure Variables

```bash
# Copy example variables file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your actual values
# IMPORTANT: Never commit terraform.tfvars to git!
```

### 2. Configure S3 Backend (Optional but Recommended)

Uncomment the backend configuration in `main.tf` and create an S3 bucket for state storage:

```bash
# Create S3 bucket for Terraform state
aws s3 mb s3://avamae-terraform-state --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket avamae-terraform-state \
  --versioning-configuration Status=Enabled
```

### 3. Initialize Terraform

```bash
cd terraform
terraform init
```

### 4. Review Plan

```bash
terraform plan
```

### 5. Apply Configuration

```bash
terraform apply
```

Review the changes and type `yes` to confirm.

### 6. Configure DNS

After deployment, you'll need to configure DNS records:

#### For SES (Email):
Add the following DNS records (get values from Terraform outputs):
- TXT record for domain verification
- CNAME records for DKIM

#### For Custom Domain (Optional):
Configure your domain registrar to point to:
- Amplify app domain (from Terraform output)
- Or configure custom domain in Amplify console

## Post-Deployment

### 1. Database Setup

Connect to the RDS instance and run Prisma migrations:

```bash
# Get database URL from Terraform output
terraform output database_url

# Set environment variable
export DATABASE_URL="<database_url_from_output>"

# Run migrations
cd ..
npx prisma migrate deploy
```

### 2. SES Configuration

- **Sandbox Mode**: By default, SES is in sandbox mode. You can only send to verified email addresses.
- **Production Access**: Request production access through AWS Console to send to any email.
- Add verification for the `noreply@avamae.org` email address

### 3. Environment Variables for Amplify

The following environment variables are automatically configured by Terraform:
- `DATABASE_URL`
- `AWS_S3_BUCKET`
- `AWS_CLOUDFRONT_DOMAIN`
- `NEXTAUTH_URL`

You'll need to manually add these in Amplify console:
- `NEXTAUTH_SECRET` (generate with: `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` (if using Google auth)
- `GOOGLE_CLIENT_SECRET` (if using Google auth)

## Terraform Commands

```bash
# View current state
terraform show

# View outputs
terraform output

# View specific output
terraform output database_url

# Destroy infrastructure (careful!)
terraform destroy
```

## Cost Optimization

For development/staging:
- RDS uses `db.t3.micro`
- Single AZ deployment
- Minimal backup retention

For production:
- RDS uses `db.t3.small`
- Multi-AZ for high availability
- 7-day backup retention

## Security Considerations

1. **Database Access**: Currently set to publicly accessible for development. In production:
   - Set `publicly_accessible = false`
   - Use VPN or bastion host for access
   - Restrict security group to specific IP ranges

2. **Secrets Management**: Consider using AWS Secrets Manager for:
   - Database credentials
   - API keys
   - SMTP credentials

3. **IAM Roles**: Use IAM roles for Amplify instead of IAM users where possible

## Troubleshooting

### Amplify Build Fails
- Check build logs in Amplify console
- Verify environment variables are set correctly
- Ensure DATABASE_URL is accessible from Amplify

### Database Connection Issues
- Check security group rules
- Verify database endpoint
- Test connection with `psql` or database client

### Email Not Sending
- Verify SES is out of sandbox mode
- Check email addresses are verified
- Review CloudWatch logs for SES events

## Modules

- `modules/rds/`: PostgreSQL database configuration
- `modules/s3/`: S3 buckets and CloudFront CDN
- `modules/amplify/`: Next.js hosting with Amplify
- `modules/ses/`: Email service configuration

## Support

For issues or questions, refer to:
- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
