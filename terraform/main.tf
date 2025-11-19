terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Configure backend for state storage (update with your S3 bucket)
  # backend "s3" {
  #   bucket = "avamae-terraform-state"
  #   key    = "production/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = {
      Project     = "Avamae"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# ============================================================================
# Variables
# ============================================================================

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "aws_profile" {
  description = "AWS CLI profile to use"
  type        = string
  default     = "default"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "production"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "avamae.org"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "avamae"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "avamae_admin"
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

# ============================================================================
# Modules
# ============================================================================

# RDS PostgreSQL Database (Cost-Optimized)
module "rds" {
  source = "./modules/rds"

  environment  = var.environment
  db_name      = var.db_name
  db_username  = var.db_username
  db_password  = var.db_password
}

# S3 Buckets for Media Storage (with lifecycle policies)
module "s3" {
  source = "./modules/s3"

  environment = var.environment
  domain_name = var.domain_name
  aws_region  = var.aws_region
}

# AWS App Runner for Next.js Hosting (Docker-based)
module "apprunner" {
  source = "./modules/apprunner"

  environment            = var.environment
  domain_name            = var.domain_name
  repository_url         = var.repository_url
  github_token           = var.github_token
  database_url           = module.rds.database_url
  s3_bucket_name         = module.s3.media_bucket_name
  cloudfront_domain      = module.s3.cloudfront_domain
  aws_region             = var.aws_region
  app_url                = "https://${var.domain_name}"
  clerk_publishable_key  = var.clerk_publishable_key
  clerk_secret_key       = var.clerk_secret_key
  clerk_webhook_secret   = var.clerk_webhook_secret
}

# AWS Amplify - DISABLED (switched to App Runner)
# module "amplify" {
#   source = "./modules/amplify"
#   ...
# }

# SES for Email - REMOVED (Clerk handles all authentication emails)
# module "ses" {
#   source = "./modules/ses"
#
#   environment = var.environment
#   domain_name = var.domain_name
# }

# ============================================================================
# Additional Variables for Amplify
# ============================================================================

variable "repository_url" {
  description = "GitHub repository URL (e.g., https://github.com/username/repo)"
  type        = string
}

variable "github_token" {
  description = "GitHub personal access token for Amplify access"
  type        = string
  sensitive   = true
}

variable "clerk_publishable_key" {
  description = "Clerk publishable key"
  type        = string
}

variable "clerk_secret_key" {
  description = "Clerk secret key"
  type        = string
  sensitive   = true
}

variable "clerk_webhook_secret" {
  description = "Clerk webhook secret"
  type        = string
  sensitive   = true
}

# ============================================================================
# Outputs
# ============================================================================

output "database_endpoint" {
  description = "RDS database endpoint"
  value       = module.rds.database_endpoint
  sensitive   = true
}

output "database_url" {
  description = "Full database connection URL"
  value       = module.rds.database_url
  sensitive   = true
}

output "s3_media_bucket" {
  description = "S3 bucket for media uploads"
  value       = module.s3.media_bucket_name
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain"
  value       = module.s3.cloudfront_domain
}

output "apprunner_service_url" {
  description = "App Runner service URL"
  value       = module.apprunner.service_url
}

output "ecr_repository_url" {
  description = "ECR repository URL for Docker images"
  value       = module.apprunner.ecr_repository_url
}

# SES outputs removed - Clerk handles authentication emails
# output "ses_smtp_endpoint" {
#   description = "SES SMTP endpoint"
#   value       = module.ses.smtp_endpoint
# }
