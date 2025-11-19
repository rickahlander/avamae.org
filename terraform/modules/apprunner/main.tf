# ============================================================================
# AWS App Runner Module for Next.js Hosting (Cost-Effective)
# ============================================================================
# App Runner is significantly cheaper than Amplify for containerized Next.js apps
# Pricing: ~$5-15/month for small workloads vs $50+ for Amplify

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
  description = "GitHub connection ARN"
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

variable "aws_region" {
  description = "AWS region"
  type        = string
}

# ============================================================================
# IAM Roles
# ============================================================================

# IAM Role for App Runner instance (runtime)
resource "aws_iam_role" "instance_role" {
  name = "avamae-apprunner-instance-${var.environment}"

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

  tags = {
    Name = "avamae-apprunner-instance-${var.environment}"
  }
}

# Policy for S3 access
resource "aws_iam_role_policy" "s3_access" {
  name = "s3-media-access"
  role = aws_iam_role.instance_role.id

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

# IAM Role for App Runner service (build and deployment)
resource "aws_iam_role" "access_role" {
  name = "avamae-apprunner-access-${var.environment}"

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

  tags = {
    Name = "avamae-apprunner-access-${var.environment}"
  }
}

# Attach ECR access policy
resource "aws_iam_role_policy_attachment" "ecr_access" {
  role       = aws_iam_role.access_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

# ============================================================================
# ECR Repository for Docker Images
# ============================================================================

resource "aws_ecr_repository" "app" {
  name                 = "avamae-${var.environment}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = false  # Disabled for cost savings in dev
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Name = "avamae-${var.environment}"
  }
}

# ECR Lifecycle Policy to clean up old images
resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 5 images"
        selection = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = 5
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# ============================================================================
# App Runner Auto Scaling Configuration
# ============================================================================

resource "aws_apprunner_auto_scaling_configuration_version" "main" {
  auto_scaling_configuration_name = "avamae-${var.environment}"
  
  # Cost-optimized settings for development
  max_concurrency = 25  # Requests per instance
  max_size        = var.environment == "production" ? 10 : 2  # Max instances
  min_size        = var.environment == "production" ? 2 : 1   # Min instances (1 for dev)

  tags = {
    Name = "avamae-${var.environment}"
  }
}

# ============================================================================
# App Runner Service
# ============================================================================

resource "aws_apprunner_service" "main" {
  service_name = "avamae-${var.environment}"
  
  auto_scaling_configuration_arn = aws_apprunner_auto_scaling_configuration_version.main.arn

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.access_role.arn
    }

    image_repository {
      image_configuration {
        port = "3000"
        
        runtime_environment_variables = {
          NODE_ENV              = "production"
          AWS_REGION            = var.aws_region
          AWS_S3_BUCKET         = var.s3_bucket_name
          AWS_CLOUDFRONT_DOMAIN = var.cloudfront_domain
          STORAGE_TYPE          = "s3"
          # Database URL is set as secret below
        }

        runtime_environment_secrets = {
          DATABASE_URL = aws_ssm_parameter.database_url.arn
        }
      }

      image_identifier      = "${aws_ecr_repository.app.repository_url}:latest"
      image_repository_type = "ECR"
    }

    auto_deployments_enabled = false  # Manual deploys to save costs in dev
  }

  instance_configuration {
    # Cost-optimized: smallest instance for development
    cpu               = var.environment == "production" ? "1024" : "512"   # 0.5 vCPU for dev
    memory            = var.environment == "production" ? "2048" : "1024"  # 1 GB for dev
    instance_role_arn = aws_iam_role.instance_role.arn
  }

  health_check_configuration {
    protocol            = "HTTP"
    path                = "/api/health"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 1
    unhealthy_threshold = 5
  }

  tags = {
    Name = "avamae-${var.environment}"
  }
}

# ============================================================================
# SSM Parameter for sensitive environment variables
# ============================================================================

resource "aws_ssm_parameter" "database_url" {
  name  = "/avamae/${var.environment}/database-url"
  type  = "SecureString"
  value = var.database_url

  tags = {
    Name = "avamae-database-url-${var.environment}"
  }
}

# ============================================================================
# Outputs
# ============================================================================

output "service_url" {
  description = "App Runner service URL"
  value       = "https://${aws_apprunner_service.main.service_url}"
}

output "service_id" {
  description = "App Runner service ID"
  value       = aws_apprunner_service.main.service_id
}

output "service_arn" {
  description = "App Runner service ARN"
  value       = aws_apprunner_service.main.arn
}

output "ecr_repository_url" {
  description = "ECR repository URL for Docker images"
  value       = aws_ecr_repository.app.repository_url
}

output "ecr_repository_name" {
  description = "ECR repository name"
  value       = aws_ecr_repository.app.name
}

