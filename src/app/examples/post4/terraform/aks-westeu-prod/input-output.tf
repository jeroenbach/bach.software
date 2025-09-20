# =============================================================================
# INPUT VARIABLES
# =============================================================================
variable "azure_subscription_id" {
  description = "The subscription ID for the Azure account."
  type        = string
}
variable "azure_cluster_name" {
  description = "The name of the Azure Kubernetes cluster."
  type        = string
  default     = "aks-westeu-prod"
}
variable "cloudflare_api_token" {
  description = "The api token for Cloudflare. If not provided we don't update the dns."
  type        = string
}
variable "cloudflare_zone_id" {
  description = "The zone ID for Cloudflare DNS. If not provided we don't update the dns."
  type        = string
}
variable "plausible_dns" {
  description = "The DNS name for the Plausible server. Even when not using cloudflare, this is used in the plausible configuration."
  type        = string
}
variable "letsencrypt_email" {
  description = "The email address used for Let's Encrypt registration."
  type        = string
}
variable "postgresql_restore_snapshot_id" {
  description = "The Azure snapshot ID to restore PostgreSQL data from. Format: /subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/Microsoft.Compute/snapshots/<snapshot-name>. Leave empty to start with a fresh database."
  type        = string
}
variable "clickhouse_restore_snapshot_id" {
  description = "The Azure snapshot ID to restore ClickHouse data from. Format: /subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/Microsoft.Compute/snapshots/<snapshot-name>. Leave empty to start with a fresh database."
  type        = string
}

# =============================================================================
# OUTPUTS
# =============================================================================

output "azure_load_balancer_external_ip" {
  description = "The external IP address of the Load Balancer"
  value       = module.aks_cluster.azure_load_balancer_external_ip
}
