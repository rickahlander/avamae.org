# ============================================================================
# AWS ECR Module for Docker Images
# ============================================================================

variable "environment" {
  description = "Environment name"
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

# Output
output "repository_url" {
  description = "ECR repository URL"
  value       = aws_ecr_repository.app.repository_url
}

