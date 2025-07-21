#!/bin/bash

# DigitalOcean Deployment Script for Gary Vee Network
# This script deploys the application to DigitalOcean App Platform

set -e

# Configuration
PROJECT_NAME="gary-vee-network"
DIGITALOCEAN_REGION="nyc"
DIGITALOCEAN_APP_NAME="$PROJECT_NAME-app"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting DigitalOcean deployment for Gary Vee Network...${NC}"

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo -e "${RED}❌ DigitalOcean CLI (doctl) is not installed. Please install it first.${NC}"
    echo -e "${YELLOW}📥 Install from: https://docs.digitalocean.com/reference/doctl/how-to/install/${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Authenticate with DigitalOcean
echo -e "${YELLOW}🔐 Authenticating with DigitalOcean...${NC}"
if ! doctl account get &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with DigitalOcean. Please run 'doctl auth init' first.${NC}"
    exit 1
fi

# Build the Docker image
echo -e "${YELLOW}📦 Building Docker image...${NC}"
docker build -t $PROJECT_NAME .

# Create app specification
echo -e "${YELLOW}📋 Creating app specification...${NC}"
cat > app.yaml << EOF
name: $DIGITALOCEAN_APP_NAME
region: $DIGITALOCEAN_REGION
services:
- name: web
  source_dir: /
  dockerfile_path: Dockerfile
  http_port: 3000
  instance_count: 2
  instance_size_slug: basic-xxs
  routes:
  - path: /
  environment_slug: node-js
  envs:
  - key: NODE_ENV
    value: production
  - key: NEXT_TELEMETRY_DISABLED
    value: "1"
  health_check:
    http_path: /
    initial_delay_seconds: 10
    period_seconds: 10
    timeout_seconds: 5
    success_threshold: 1
    failure_threshold: 3
  alerts:
  - rule: DEPLOYMENT_FAILED
  - rule: DOMAIN_FAILED
databases:
- name: redis
  engine: REDIS
  version: "6"
  size: db-s-1vcpu-1gb
  region: $DIGITALOCEAN_REGION
EOF

# Deploy to DigitalOcean App Platform
echo -e "${YELLOW}🚀 Deploying to DigitalOcean App Platform...${NC}"
doctl apps create --spec app.yaml

# Get the app ID
APP_ID=$(doctl apps list --format ID,Name --no-header | grep $DIGITALOCEAN_APP_NAME | awk '{print $1}')

if [ -z "$APP_ID" ]; then
    echo -e "${RED}❌ Failed to get app ID. Please check the deployment.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ App created with ID: $APP_ID${NC}"

# Wait for deployment to complete
echo -e "${YELLOW}⏳ Waiting for deployment to complete...${NC}"
doctl apps wait-for-deployment $APP_ID

# Get the app URL
APP_URL=$(doctl apps get $APP_ID --format URL --no-header)

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${YELLOW}🌐 Your app is available at: $APP_URL${NC}"
echo -e "${YELLOW}📊 Monitor your deployment at: https://cloud.digitalocean.com/apps/$APP_ID${NC}"

# Clean up
rm -f app.yaml

echo -e "${GREEN}🎉 Gary Vee Network is now deployed on DigitalOcean!${NC}"

# Optional: Set up custom domain
echo -e "${YELLOW}💡 To add a custom domain, run:${NC}"
echo -e "${YELLOW}   doctl apps domain create $APP_ID your-domain.com${NC}" 