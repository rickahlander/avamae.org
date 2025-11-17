# ============================================================================
# AWS SES (Simple Email Service) Module
# ============================================================================

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "domain_name" {
  description = "Domain name for email"
  type        = string
}

# SES Domain Identity
resource "aws_ses_domain_identity" "main" {
  domain = var.domain_name
}

# SES Domain DKIM
resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}

# SES Email Identity (for development/testing)
resource "aws_ses_email_identity" "noreply" {
  email = "noreply@${var.domain_name}"
}

# SES Configuration Set
resource "aws_ses_configuration_set" "main" {
  name = "avamae-${var.environment}"

  delivery_options {
    tls_policy = "Require"
  }

  reputation_metrics_enabled = true
}

# SES Event Destination (CloudWatch)
resource "aws_ses_event_destination" "cloudwatch" {
  name                   = "cloudwatch-${var.environment}"
  configuration_set_name = aws_ses_configuration_set.main.name
  enabled                = true
  matching_types         = ["send", "reject", "bounce", "complaint", "delivery"]

  cloudwatch_destination {
    default_value  = "default"
    dimension_name = "ses:configuration-set"
    value_source   = "messageTag"
  }
}

# IAM User for SMTP Access (optional - for external email clients)
resource "aws_iam_user" "ses_smtp" {
  name = "avamae-ses-smtp-${var.environment}"
  path = "/system/"

  tags = {
    Name = "avamae-ses-smtp-${var.environment}"
  }
}

resource "aws_iam_access_key" "ses_smtp" {
  user = aws_iam_user.ses_smtp.name
}

resource "aws_iam_user_policy" "ses_smtp" {
  name = "ses-smtp-policy"
  user = aws_iam_user.ses_smtp.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      }
    ]
  })
}

# ============================================================================
# Outputs
# ============================================================================

output "domain_identity_arn" {
  description = "SES domain identity ARN"
  value       = aws_ses_domain_identity.main.arn
}

output "domain_verification_token" {
  description = "Domain verification token (add as TXT record)"
  value       = aws_ses_domain_identity.main.verification_token
}

output "dkim_tokens" {
  description = "DKIM tokens (add as CNAME records)"
  value       = aws_ses_domain_dkim.main.dkim_tokens
}

output "smtp_endpoint" {
  description = "SMTP endpoint for email sending"
  value       = "email-smtp.${data.aws_region.current.name}.amazonaws.com"
}

output "smtp_username" {
  description = "SMTP username"
  value       = aws_iam_access_key.ses_smtp.id
  sensitive   = true
}

output "smtp_password" {
  description = "SMTP password"
  value       = aws_iam_access_key.ses_smtp.ses_smtp_password_v4
  sensitive   = true
}

output "configuration_set_name" {
  description = "SES configuration set name"
  value       = aws_ses_configuration_set.main.name
}

data "aws_region" "current" {}
