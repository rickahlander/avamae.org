# ============================================================================
# RDS PostgreSQL Database Module
# ============================================================================

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_username" {
  description = "Database username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# Security Group for RDS
resource "aws_security_group" "rds" {
  name_prefix = "avamae-rds-${var.environment}-"
  description = "Security group for RDS PostgreSQL"

  ingress {
    description = "PostgreSQL from whitelisted IPs"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [
      "97.120.162.129/32",  # Your office/home IP
      "44.224.0.0/11",      # AWS us-west-2 services (includes Amplify)
    ]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "avamae-rds-${var.environment}"
  }
}

# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name_prefix = "avamae-${var.environment}-"
  subnet_ids  = data.aws_subnets.default.ids

  tags = {
    Name = "avamae-db-subnet-group-${var.environment}"
  }
}

# Get default VPC subnets
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "postgres" {
  identifier     = "avamae-${var.environment}"
  engine         = "postgres"
  engine_version = "16.11"

  # Cost-optimized: t4g.micro (ARM-based, cheapest option) for low-traffic production
  instance_class    = "db.t4g.micro"
  allocated_storage = 20
  storage_type      = "gp3"
  storage_encrypted = true
  
  # Enable storage autoscaling for cost efficiency
  max_allocated_storage = 30

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 1  # Minimum for cost savings
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"

  multi_az               = false  # Single-AZ for cost savings
  publicly_accessible    = true   # Easier for initial setup
  skip_final_snapshot    = true   # Skip snapshot for dev/test
  deletion_protection    = false  # Allow deletion
  
  # Performance Insights disabled for cost savings
  enabled_cloudwatch_logs_exports = []

  tags = {
    Name = "avamae-postgres-${var.environment}"
  }
}

# ============================================================================
# Outputs
# ============================================================================

output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "database_url" {
  description = "Database connection URL"
  value       = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.endpoint}/${var.db_name}"
  sensitive   = true
}

output "database_id" {
  description = "RDS instance ID"
  value       = aws_db_instance.postgres.id
}

output "vpc_id" {
  description = "VPC ID where RDS is deployed"
  value       = data.aws_vpc.default.id
}

output "subnet_ids" {
  description = "Subnet IDs where RDS is deployed"
  value       = data.aws_subnets.default.ids
}

output "security_group_id" {
  description = "RDS security group ID"
  value       = aws_security_group.rds.id
}
