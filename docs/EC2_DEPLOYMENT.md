# RepoLens: AWS EC2 Deployment Guide

This guide outlines the protocol for deploying the RepoLens backend (API + Worker) to an AWS EC2 instance. This configuration enables the **Native Execution Sandbox**.

---

## 1. Instance Provisioning

### Step 1: Launch Instance
1.  Login to **AWS Console** -> **EC2** -> **Launch Instance**.
2.  **Name**: `repolens-backend-production`
3.  **OS (AMI)**: `Ubuntu Server 24.04 LTS` (64-bit x86).
4.  **Instance Type**: `t3.small` (2 vCPU, 2GB RAM).
5.  **Key Pair**: Create a new key pair `.pem` and save it securely.

### Step 2: Network & Security
1.  **Security Group**: Create a new group `repolens-sg`.
2.  **Inbound Rules**:
    - SSH (Port 22): My IP
    - Custom TCP (Port 3001): `0.0.0.0/0` (API Gateway)
3.  **Storage**: 20GB (gp3).

### Step 3: Advanced Details (User Data)
Paste this script into the **User Data** field to automate system initialization:

```bash
#!/bin/bash
# SYSTEM_INITIALIZATION_PROTOCOL
apt-get update -y
apt-get upgrade -y

# INSTALL_DOCKER_ENGINE
apt-get install -y docker.io docker-compose-plugin git
systemctl start docker
systemctl enable docker

# CONFIGURE_PERMISSIONS
usermod -aG docker ubuntu

# CLONE_PRODUCTION_ARTIFACT
mkdir -p /opt/repolens
cd /opt/repolens
git clone https://github.com/haxllo/repolens.git .
chown -R ubuntu:ubuntu /opt/repolens

echo "SYSTEM_READY"
```

---

## 2. Static IP Assignment

1.  Go to **EC2 Dashboard** -> **Elastic IPs**.
2.  Click **Allocate Elastic IP address**.
3.  Select the new IP -> **Actions** -> **Associate Elastic IP address**.
4.  Choose your `repolens-backend-production` instance.
5.  **Result**: Your server now has a permanent IP address.

---

## 3. Server Configuration (SSH)

Connect to your server:
```bash
ssh -i your-key.pem ubuntu@your-elastic-ip
```

### Configure Environment Variables
Inside the server, navigate to the directory and set up your secrets:

```bash
cd /opt/repolens

# Setup API Secrets
nano apps/api/.env
# Paste values for: DATABASE_URL, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, FRONTEND_URL

# Setup Worker Secrets
nano apps/worker/.env
# Paste values for: REDIS_URL, GEMINI_API_KEY, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN
```

---

## 4. Execution Protocol

Start the backend services in detached mode:

```bash
docker compose up -d --build
```

### Verify Status
```bash
# Check if containers are healthy
docker ps

# Stream logs
docker compose logs -f worker
```

---

## Maintenance Protocols

- **Update Code**: `git pull origin main && docker compose up -d --build`
- **Check Sandbox**: The worker will automatically use the host Docker engine to spawn execution containers.
- **Resource Monitoring**: `docker stats`