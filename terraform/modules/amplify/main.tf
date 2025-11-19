# ============================================================================
# AWS Amplify Module for Next.js Hosting
# ============================================================================

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "domain_name" {
  description = "Domain name"
  type        = string
}

variable "repository_url" {
  description = "GitHub repository URL"
  type        = string
}

variable "github_token" {
  description = "GitHub personal access token"
  type        = string
  sensitive   = true
}

variable "database_url" {
  description = "Database connection URL"
  type        = string
  sensitive   = true
}

variable "s3_bucket_name" {
  description = "S3 bucket name for media"
  type        = string
}

variable "cloudfront_domain" {
  description = "CloudFront domain for media CDN"
  type        = string
}

# Amplify App
resource "aws_amplify_app" "main" {
  name       = "avamae-${var.environment}"
  repository = var.repository_url

  access_token = var.github_token

  build_spec = <<-EOT
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
  EOT

  enable_auto_branch_creation = false
  enable_branch_auto_build    = true

  # Environment variables
  environment_variables = {
    NODE_ENV              = "production"
    AWS_REGION            = data.aws_region.current.name
    AWS_S3_BUCKET         = var.s3_bucket_name
    AWS_CLOUDFRONT_DOMAIN = var.cloudfront_domain
    STORAGE_TYPE          = "s3"
    # Clerk keys must be added manually in Amplify Console after deployment
    # NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_..."
    # CLERK_SECRET_KEY = "sk_..."
    # NEXT_PUBLIC_CLERK_SIGN_IN_URL = "/sign-in"
    # NEXT_PUBLIC_CLERK_SIGN_UP_URL = "/sign-up"
    # NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = "/"
    # NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = "/"
    # CLERK_WEBHOOK_SECRET = "whsec_..."
  }

  custom_rule {
    source = "/<*>"
    status = "404-200"
    target = "/index.html"
  }

  tags = {
    Name = "avamae-${var.environment}"
  }
}

# Main Branch
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.main.id
  branch_name = var.environment == "production" ? "main" : var.environment

  enable_auto_build = true
  enable_pull_request_preview = false

  framework = "Next.js - SSR"
  stage     = var.environment == "production" ? "PRODUCTION" : "DEVELOPMENT"

  environment_variables = {
    DATABASE_URL = var.database_url
  }
}

# Custom Domain (optional - uncomment when ready)
# resource "aws_amplify_domain_association" "main" {
#   app_id      = aws_amplify_app.main.id
#   domain_name = var.domain_name
#
#   sub_domain {
#     branch_name = aws_amplify_branch.main.branch_name
#     prefix      = var.environment == "production" ? "" : var.environment
#   }
# }

# Get current AWS region
data "aws_region" "current" {}

# ============================================================================
# Outputs
# ============================================================================

output "app_id" {
  description = "Amplify app ID"
  value       = aws_amplify_app.main.id
}

output "app_arn" {
  description = "Amplify app ARN"
  value       = aws_amplify_app.main.arn
}

output "default_domain" {
  description = "Amplify default domain"
  value       = aws_amplify_app.main.default_domain
}

output "branch_name" {
  description = "Branch name"
  value       = aws_amplify_branch.main.branch_name
}
