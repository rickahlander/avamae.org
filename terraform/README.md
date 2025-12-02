# Avamae Infrastructure (Terraform)

> ⚠️ **DEPRECATED**: This project has migrated to Vercel.
> 
> The Terraform/AWS infrastructure is no longer in use. See [VERCEL-SETUP.md](../VERCEL-SETUP.md) for current deployment instructions.
>
> This directory is kept for historical reference only.

---

**Legacy Documentation Below**

This directory contains the Terraform configuration for deploying the Avamae platform to AWS.

## Prerequisites

1. **Terraform** installed (>= 1.0)
2. **AWS CLI** configured with the `ahltrade` profile
3. **AWS Account** with necessary permissions
4. **Docker** installed (for building container images)

## ⚠️ IMPORTANT: AWS Profile

**ALWAYS use the `ahltrade` AWS profile for this project.**

```bash
# Set environment variable before running Terraform
export AWS_PROFILE=ahltrade

# Or use --profile flag for AWS CLI commands
aws --profile ahltrade <command>
```

## Infrastructure Components

- **ECS with Fargate**: Container orchestration for Next.js SSR
- **ECR**: Docker container registry
- **Application Load Balancer**: HTTPS/SSL termination and traffic distribution
- **RDS PostgreSQL**: Database for application data
- **S3 + CloudFront**: Media storage and CDN
- **Route53**: DNS management for custom domain
- **ACM**: SSL/TLS certificates
- **Resend**: Transactional email service (external, API key required)

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
aws --profile ahltrade s3 mb s3://avamae-terraform-state --region us-east-1

# Enable versioning
aws --profile ahltrade s3api put-bucket-versioning \
  --bucket avamae-terraform-state \
  --versioning-configuration Status=Enabled
```

### 3. Initialize Terraform

```bash
cd terraform
export AWS_PROFILE=ahltrade
terraform init
```

### 4. Review Plan

```bash
export AWS_PROFILE=ahltrade
terraform plan
```

### 5. Apply Configuration

```bash
export AWS_PROFILE=ahltrade
terraform apply
```

Review the changes and type `yes` to confirm.

### 6. Configure DNS (Optional - Custom Domain)

After deployment, Terraform creates Route53 records for `avamae.org` and `www.avamae.org` pointing to the ALB.

If you're using an external DNS provider, configure your domain to point to:
- Get ALB DNS name from: `terraform output alb_dns_name`
- Create a CNAME record pointing your domain to the ALB

## Post-Deployment

### 1. Build and Push Docker Image

```bash
# Login to ECR (always use ahltrade profile)
aws ecr get-login-password --region us-west-2 --profile ahltrade | \
  docker login --username AWS --password-stdin $(terraform output -raw ecr_repository_url | cut -d'/' -f1)

# Build image with production environment variables
docker build \
  --build-arg DATABASE_URL="$(terraform output -raw database_url)" \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="<your-clerk-key>" \
  --build-arg CLERK_SECRET_KEY="<your-clerk-secret>" \
  --build-arg NEXT_PUBLIC_APP_URL="https://avamae.org" \
  --build-arg AWS_S3_BUCKET="$(terraform output -raw s3_bucket_name)" \
  --build-arg AWS_CLOUDFRONT_DOMAIN="$(terraform output -raw cloudfront_domain)" \
  --build-arg STORAGE_TYPE="s3" \
  --build-arg RESEND_API_KEY="<your-resend-key>" \
  -t avamae-app:latest .

# Tag and push
docker tag avamae-app:latest $(terraform output -raw ecr_repository_url):latest
docker push $(terraform output -raw ecr_repository_url):latest
```

### 2. Deploy to ECS

```bash
# Force new deployment to pick up the Docker image (always use ahltrade profile)
aws --profile ahltrade ecs update-service \
  --cluster avamae-production \
  --service avamae-production \
  --force-new-deployment \
  --region us-west-2
```

### 3. Database Setup

Connect to the RDS instance and run Prisma migrations:

```bash
# Get database URL from Terraform output
terraform output database_url

# Set environment variable
export DATABASE_URL="<database_url_from_output>"

# Run migrations and seed
cd ..
npx prisma db push
npm run db:seed
```

### 4. Resend Email Configuration

1. Sign up at [Resend.com](https://resend.com)
2. Add and verify your sending domain (`notify.avamae.org`)
3. Create API key and add to your build command
4. No additional AWS configuration needed - Resend handles all email

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
