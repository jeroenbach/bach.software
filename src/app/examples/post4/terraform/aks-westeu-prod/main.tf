
module "aks_cluster" {
  source = "../modules/aks-cluster"

  # Azure Configuration
  azure_region          = "westeurope"

  # SSL Certificate Configuration
  letsencrypt_email = var.letsencrypt_email

  # Cluster Configuration
  cluster_name              = var.azure_cluster_name
  cluster_vm_size           = "Standard_B2s" # Low memory (4GB) Burst VM (2CPU)
    cluster_vm_disk_size      = 30             # Max size of it's Ephemeral disk
    cluster_vm_min_node_count = 1
    cluster_vm_max_node_count = 1
    cluster_vm_max_pods_count = 40             # Give a bit more space
  }

  module "plausible" {
    source = "../modules/plausible"

    # Azure Configuration
    azure_disk_resource_group_name = module.aks_cluster.azure_nodes_resource_group_name
    azure_disk_location            = "westeurope"

    # AKS Configuration
    namespace = "plausible-analytics-v2"
    name      = "plausible-analytics-v2"
    chart_version   = "0.3.3"

    # Plausible Configuration
    plausible_dns = var.plausible_dns

    # Database Restore Configuration (optional)
    postgresql_restore_snapshot_id = var.postgresql_restore_snapshot_id
    clickhouse_restore_snapshot_id = var.clickhouse_restore_snapshot_id

    depends_on = [ module.aks_cluster ]
  }

  resource "cloudflare_dns_record" "record" {
    count   = var.cloudflare_api_token != null && var.cloudflare_api_token != "" && var.cloudflare_zone_id != null  && var.cloudflare_zone_id != "" ? 1 : 0
    zone_id = var.cloudflare_zone_id
    name    = var.plausible_dns
    content = module.aks_cluster.azure_load_balancer_external_ip
    type    = "A"
    ttl     = 1
    proxied = false

    depends_on = [ module.aks_cluster ]
  }
