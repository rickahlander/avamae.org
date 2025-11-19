# AWS Cost Optimization Guide

This guide helps you minimize AWS costs while maintaining a production-ready Avamae deployment.

## 💰 Current Cost-Optimized Configuration

Your Terraform is already configured with these optimizations:

### RDS PostgreSQL (~$13/month)
✅ **db.t4g.micro** - ARM-based Graviton2 processor (cheapest option)
✅ **20GB storage** - Minimum for production
✅ **gp3 storage** - 20% cheaper than gp2
✅ **Single-AZ** - No redundancy (upgrade when needed)
✅ **1-day backup retention** - Minimum viable
✅ **Storage autoscaling** - Only pay for what you use (max 30GB)

### S3 + CloudFront (~$1-5/month)
✅ **Lifecycle policies** - Auto-transition old versions to cheaper storage
✅ **Incomplete upload cleanup** - Delete abandoned uploads after 7 days
✅ **Versioning** - Keep only what you need (90-day retention)
✅ **PriceClass_100** - US/Canada/Europe only (cheaper than global)

### Amplify (~$30-50/month)
✅ **Manual build triggers** - Avoid unnecessary builds
✅ **Cache optimization** - Faster builds = lower costs
✅ **Diff deploy** - Only deploy changed files

## 📉 Additional Cost-Saving Strategies

### 1. Disable SES (if not using email)

Comment out in `terraform/main.tf`:
```hcl
# module "ses" {
#   source = "./modules/ses"
#   ...
# }
```

**Savings**: $0-10/month (depending on usage)

### 2. Reduce Build Frequency

In Amplify Console > Build settings:
- Disable auto-builds for non-main branches
- Only build on specific file changes
- Use build webhooks instead of polling

**Savings**: $5-15/month on build minutes

### 3. Enable Amplify Build Throttling

```bash
# Limit builds to prevent accidental cost spikes
aws amplify update-app \
  --app-id YOUR_APP_ID \
  --enable-branch-auto-build false
```

Then manually trigger builds:
```bash
aws amplify start-job \
  --app-id YOUR_APP_ID \
  --branch-name main \
  --job-type RELEASE
```

### 4. Schedule Database Downtime (Development Only)

For non-production environments, stop RDS overnight:

```bash
# Stop database (manual)
aws rds stop-db-instance --db-instance-identifier avamae-production

# Start when needed
aws rds start-db-instance --db-instance-identifier avamae-production
```

⚠️ **Not recommended for production** - database will auto-start after 7 days

### 5. Use S3 Intelligent-Tiering

Update `terraform/modules/s3/main.tf`:

```hcl
resource "aws_s3_bucket_intelligent_tiering_configuration" "media" {
  bucket = aws_s3_bucket.media.id
  name   = "EntireBucket"

  tiering {
    access_tier = "ARCHIVE_ACCESS"
    days        = 90
  }

  tiering {
    access_tier = "DEEP_ARCHIVE_ACCESS"
    days        = 180
  }
}
```

**Savings**: 40-70% on storage costs for infrequently accessed files

### 6. Enable CloudFront Compression

Already enabled in your config! This reduces bandwidth costs.

### 7. Monitor and Set Budget Alerts

```bash
# Create $75/month budget alert
aws budgets create-budget \
  --account-id YOUR_ACCOUNT_ID \
  --budget file://budget.json
```

Create `budget.json`:
```json
{
  "BudgetName": "avamae-monthly-budget",
  "BudgetLimit": {
    "Amount": "75",
    "Unit": "USD"
  },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST"
}
```

## 📊 Cost Monitoring

### Daily Cost Check

```bash
# Check today's estimated costs
aws ce get-cost-and-usage \
  --time-period Start=$(date -v-1d +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity DAILY \
  --metrics BlendedCost
```

### Service-Specific Costs

```bash
# RDS costs
aws ce get-cost-and-usage \
  --time-period Start=2025-01-01,End=2025-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE \
  --filter file://rds-filter.json
```

### Use AWS Cost Explorer

1. Go to AWS Console > Cost Management > Cost Explorer
2. Create custom reports for:
   - Daily costs by service
   - Monthly trends
   - Forecast for next month

## 🎯 Scaling Strategy

As your traffic grows, upgrade incrementally:

### Stage 1: 0-100 users/day
✅ Current setup (db.t4g.micro, single Amplify instance)
**Cost**: $45-70/month

### Stage 2: 100-1000 users/day
Upgrade RDS to **db.t4g.small**:
```hcl
instance_class = "db.t4g.small"  # +$13/month
```
**Cost**: $60-90/month

### Stage 3: 1000-10,000 users/day
Enable Multi-AZ for RDS:
```hcl
multi_az = true  # +$30/month
instance_class = "db.t4g.medium"  # +$40/month
```
**Cost**: $135-180/month

### Stage 4: 10,000+ users/day
Consider:
- RDS Read Replicas
- ElastiCache for caching
- CloudFront optimization
- Database connection pooling

## 🚨 Cost Spike Alerts

Set up CloudWatch alarms:

```bash
# Alert on daily spending over $5
aws cloudwatch put-metric-alarm \
  --alarm-name daily-cost-alert \
  --alarm-description "Alert on daily cost > $5" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 86400 \
  --evaluation-periods 1 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions YOUR_SNS_TOPIC_ARN
```

## 💡 Best Practices

### Do's ✅
- Monitor costs weekly via AWS Cost Explorer
- Use AWS Free Tier where possible (first year)
- Tag all resources for cost tracking
- Enable detailed billing reports
- Review unused resources monthly
- Use AWS Trusted Advisor for recommendations

### Don'ts ❌
- Don't leave unused Amplify apps running
- Don't enable Performance Insights on RDS (dev)
- Don't use NAT Gateways unnecessarily ($45/month each)
- Don't create unnecessary CloudWatch logs
- Don't leave old RDS snapshots indefinitely
- Don't use t2 instances (t4g is cheaper)

## 🔍 Cost Optimization Checklist

Run this monthly:

- [ ] Check AWS Cost Explorer for anomalies
- [ ] Review S3 bucket sizes and lifecycle policies
- [ ] Clean up old RDS snapshots
- [ ] Review CloudWatch logs retention
- [ ] Check for unused Elastic IPs
- [ ] Review security group rules (remove unused)
- [ ] Verify no stopped RDS instances (still charged for storage)
- [ ] Check Amplify build minutes usage
- [ ] Review CloudFront cache hit ratio
- [ ] Audit IAM users and roles

## 📈 When to Upgrade

### Upgrade RDS when:
- CPU consistently >70%
- Memory consistently >80%
- Connection count reaching max
- Query times increasing

### Upgrade Amplify when:
- Build times >5 minutes consistently
- Deploy times >10 minutes
- Traffic requires more than 2 instances

## 🎓 Learning Resources

- [AWS Cost Optimization Hub](https://aws.amazon.com/aws-cost-management/cost-optimization/)
- [AWS Free Tier](https://aws.amazon.com/free/)
- [RDS Pricing Calculator](https://calculator.aws/)
- [Amplify Pricing](https://aws.amazon.com/amplify/pricing/)

## Summary

Your current configuration is **already optimized** for cost-effective production deployment. As you grow:

1. **0-6 months**: Stay on current config ($45-70/month)
2. **6-12 months**: Upgrade RDS if needed ($60-90/month)
3. **12+ months**: Scale based on metrics ($100-200/month)

The beauty of cloud: You only pay for what you use! 🎉

