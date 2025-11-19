# ============================================================================
# AWS App Runner Module for Next.js
# ============================================================================

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "domain_name" {
  description = "Domain name"
  type        = string
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

variable "aws_region" {
  description = "AWS region"
  type        = string
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

variable "app_url" {
  description = "Application URL"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID for App Runner connector"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for App Runner connector"
  type        = list(string)
}

variable "rds_security_group_id" {
  description = "RDS security group ID to allow App Runner access"
  type        = string
}

# ECR Repository for Docker images
resource "aws_ecr_repository" "app" {
  name                 = "avamae-${var.environment}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = false
  }

  tags = {
    Name        = "avamae-${var.environment}"
    Environment = var.environment
  }
}

# IAM Role for App Runner
resource "aws_iam_role" "apprunner_instance" {
  name = "avamae-${var.environment}-apprunner-instance"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "tasks.apprunner.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for S3 access
resource "aws_iam_role_policy" "apprunner_s3" {
  name = "avamae-${var.environment}-apprunner-s3"
  role = aws_iam_role.apprunner_instance.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::${var.s3_bucket_name}",
          "arn:aws:s3:::${var.s3_bucket_name}/*"
        ]
      }
    ]
  })
}

# IAM Role for ECR access
resource "aws_iam_role" "apprunner_ecr" {
  name = "avamae-${var.environment}-apprunner-ecr"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "build.apprunner.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "apprunner_ecr" {
  role       = aws_iam_role.apprunner_ecr.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

# Security Group for App Runner VPC Connector
resource "aws_security_group" "apprunner_connector" {
  name        = "avamae-${var.environment}-apprunner-connector"
  description = "Security group for App Runner VPC connector"
  vpc_id      = var.vpc_id

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "avamae-${var.environment}-apprunner-connector"
    Environment = var.environment
  }
}

# Update RDS security group to allow App Runner access
resource "aws_security_group_rule" "rds_from_apprunner" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.apprunner_connector.id
  security_group_id        = var.rds_security_group_id
  description              = "Allow App Runner to access RDS"
}

# VPC Connector for App Runner
resource "aws_apprunner_vpc_connector" "main" {
  vpc_connector_name = "avamae-${var.environment}"
  subnets            = var.subnet_ids
  security_groups    = [aws_security_group.apprunner_connector.id]

  tags = {
    Name        = "avamae-${var.environment}"
    Environment = var.environment
  }
}

# App Runner Auto Scaling Configuration
resource "aws_apprunner_auto_scaling_configuration_version" "app" {
  auto_scaling_configuration_name = "avamae-${var.environment}"
  min_size                        = 1
  max_size                        = 5
  max_concurrency                 = 50

  tags = {
    Name        = "avamae-${var.environment}"
    Environment = var.environment
  }
}

# App Runner Service
resource "aws_apprunner_service" "app" {
  service_name = "avamae-${var.environment}"

  source_configuration {
    auto_deployments_enabled = true

    image_repository {
      image_identifier      = "${aws_ecr_repository.app.repository_url}:latest"
      image_repository_type = "ECR"
      image_configuration {
        port = "3000"
        runtime_environment_variables = {
          NODE_ENV                             = "production"
          STORAGE_TYPE                         = "s3"
          DATABASE_URL                         = var.database_url
          S3_BUCKET                           = var.s3_bucket_name
          STORAGE_REGION                      = var.aws_region
          CLOUDFRONT_DOMAIN                   = var.cloudfront_domain
          NEXT_PUBLIC_APP_URL                 = var.app_url
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY   = var.clerk_publishable_key
          CLERK_SECRET_KEY                    = var.clerk_secret_key
          CLERK_WEBHOOK_SECRET                = var.clerk_webhook_secret
          NEXT_PUBLIC_CLERK_SIGN_IN_URL       = "/sign-in"
          NEXT_PUBLIC_CLERK_SIGN_UP_URL       = "/sign-up"
          NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = "/"
          NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = "/"
        }
      }
    }

    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_ecr.arn
    }
  }

  instance_configuration {
    instance_role_arn = aws_iam_role.apprunner_instance.arn
    cpu               = "1024" # 1 vCPU
    memory            = "2048" # 2 GB
  }

  # Temporarily disable VPC connector to test if it's causing the health check issue
  # network_configuration {
  #   egress_configuration {
  #     egress_type       = "VPC"
  #     vpc_connector_arn = aws_apprunner_vpc_connector.main.arn
  #   }
  # }

  auto_scaling_configuration_arn = aws_apprunner_auto_scaling_configuration_version.app.arn

  health_check_configuration {
    protocol            = "HTTP"
    path                = "/api/health"
    interval            = 20
    timeout             = 10
    healthy_threshold   = 1
    unhealthy_threshold = 3
  }

  tags = {
    Name        = "avamae-${var.environment}"
    Environment = var.environment
  }
}

# Custom Domain Association
resource "aws_apprunner_custom_domain_association" "app" {
  service_arn = aws_apprunner_service.app.arn
  domain_name = var.domain_name

  # Enable www subdomain
  enable_www_subdomain = false
}

# Data source to get Route53 hosted zone
data "aws_route53_zone" "main" {
  name         = var.domain_name
  private_zone = false
}

# Note: After the custom domain association is created, you'll need to manually add
# the validation records to Route53 to complete the certificate validation.
# Run: terraform output apprunner_validation_records
# Then add those records to your Route53 hosted zone.

# Outputs
output "service_url" {
  description = "App Runner service URL"
  value       = "https://${aws_apprunner_service.app.service_url}"
}

output "service_arn" {
  description = "App Runner service ARN"
  value       = aws_apprunner_service.app.arn
}

output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = aws_ecr_repository.app.repository_url
}

output "custom_domain_validation_records" {
  description = "DNS validation records for custom domain (add these to Route53 manually)"
  value       = aws_apprunner_custom_domain_association.app.certificate_validation_records
}

