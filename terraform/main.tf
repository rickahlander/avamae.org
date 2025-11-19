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

# ECR Repository for Docker images
module "ecr" {
  source = "./modules/ecr"
  
  environment = var.environment
}

# AWS ECS for Next.js Hosting (Fargate)
module "ecs" {
  source = "./modules/ecs"

  environment            = var.environment
  domain_name            = var.domain_name
  database_url           = module.rds.database_url
  s3_bucket_name         = module.s3.media_bucket_name
  cloudfront_domain      = module.s3.cloudfront_domain
  aws_region             = var.aws_region
  app_url                = "https://${var.domain_name}"
  clerk_publishable_key  = var.clerk_publishable_key
  clerk_secret_key       = var.clerk_secret_key
  clerk_webhook_secret   = var.clerk_webhook_secret
  vpc_id                 = module.rds.vpc_id
  subnet_ids             = module.rds.subnet_ids
  rds_security_group_id  = module.rds.security_group_id
  ecr_repository_url     = module.ecr.repository_url
}

# AWS Amplify - DISABLED (switched to ECS)
# module "amplify" {
#   source = "./modules/amplify"
#   ...
# }

# AWS App Runner - DISABLED (switched to ECS)  
# module "apprunner" {
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
  description = "GitHub repository URL (e.g., https://github.com/username/repo) - Not used by App Runner"
  type        = string
  default     = ""
}

variable "github_token" {
  description = "GitHub personal access token - Not used by App Runner"
  type        = string
  sensitive   = true
  default     = ""
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

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = module.ecs.alb_dns_name
}

output "service_url" {
  description = "ECS service URL"
  value       = module.ecs.service_url
}

output "ecr_repository_url" {
  description = "ECR repository URL for Docker images"
  value       = module.ecr.repository_url
}

# SES outputs removed - Clerk handles authentication emails
# output "ses_smtp_endpoint" {
#   description = "SES SMTP endpoint"
#   value       = module.ses.smtp_endpoint
# }
