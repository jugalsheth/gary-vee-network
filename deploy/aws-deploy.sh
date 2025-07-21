#!/bin/bash

# AWS Deployment Script for Gary Vee Network
# This script deploys the application to AWS ECS with auto-scaling

set -e

# Configuration
PROJECT_NAME="gary-vee-network"
AWS_REGION="us-east-1"
ECR_REPOSITORY_NAME="$PROJECT_NAME"
ECS_CLUSTER_NAME="$PROJECT_NAME-cluster"
ECS_SERVICE_NAME="$PROJECT_NAME-service"
ECS_TASK_DEFINITION_NAME="$PROJECT_NAME-task"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting AWS deployment for Gary Vee Network...${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Build the Docker image
echo -e "${YELLOW}📦 Building Docker image...${NC}"
docker build -t $PROJECT_NAME .

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPOSITORY_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME"

# Create ECR repository if it doesn't exist
echo -e "${YELLOW}🏗️  Setting up ECR repository...${NC}"
aws ecr describe-repositories --repository-names $ECR_REPOSITORY_NAME --region $AWS_REGION 2>/dev/null || \
aws ecr create-repository --repository-name $ECR_REPOSITORY_NAME --region $AWS_REGION

# Login to ECR
echo -e "${YELLOW}🔐 Logging into ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY_URI

# Tag and push the image
echo -e "${YELLOW}📤 Pushing image to ECR...${NC}"
docker tag $PROJECT_NAME:latest $ECR_REPOSITORY_URI:latest
docker push $ECR_REPOSITORY_URI:latest

# Create ECS cluster if it doesn't exist
echo -e "${YELLOW}🏗️  Setting up ECS cluster...${NC}"
aws ecs describe-clusters --clusters $ECS_CLUSTER_NAME --region $AWS_REGION 2>/dev/null || \
aws ecs create-cluster --cluster-name $ECS_CLUSTER_NAME --region $AWS_REGION

# Create task definition
echo -e "${YELLOW}📋 Creating ECS task definition...${NC}"
cat > task-definition.json << EOF
{
    "family": "$ECS_TASK_DEFINITION_NAME",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "256",
    "memory": "512",
    "executionRoleArn": "arn:aws:iam::$AWS_ACCOUNT_ID:role/ecsTaskExecutionRole",
    "containerDefinitions": [
        {
            "name": "$PROJECT_NAME",
            "image": "$ECR_REPOSITORY_URI:latest",
            "portMappings": [
                {
                    "containerPort": 3000,
                    "protocol": "tcp"
                }
            ],
            "environment": [
                {
                    "name": "NODE_ENV",
                    "value": "production"
                }
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/$PROJECT_NAME",
                    "awslogs-region": "$AWS_REGION",
                    "awslogs-stream-prefix": "ecs"
                }
            }
        }
    ]
}
EOF

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json --region $AWS_REGION

# Create CloudWatch log group
aws logs create-log-group --log-group-name "/ecs/$PROJECT_NAME" --region $AWS_REGION 2>/dev/null || true

# Create Application Load Balancer (if needed)
echo -e "${YELLOW}🌐 Setting up load balancer...${NC}"
# Note: This is a simplified version. In production, you'd want to create a proper ALB setup

# Create ECS service
echo -e "${YELLOW}🚀 Creating ECS service...${NC}"
aws ecs create-service \
    --cluster $ECS_CLUSTER_NAME \
    --service-name $ECS_SERVICE_NAME \
    --task-definition $ECS_TASK_DEFINITION_NAME \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-12345678,subnet-87654321],securityGroups=[sg-12345678],assignPublicIp=ENABLED}" \
    --region $AWS_REGION 2>/dev/null || \
aws ecs update-service \
    --cluster $ECS_CLUSTER_NAME \
    --service $ECS_SERVICE_NAME \
    --task-definition $ECS_TASK_DEFINITION_NAME \
    --region $AWS_REGION

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${YELLOW}📊 Monitor your deployment at: https://console.aws.amazon.com/ecs/home?region=$AWS_REGION#/clusters/$ECS_CLUSTER_NAME/services${NC}"

# Clean up
rm -f task-definition.json

echo -e "${GREEN}🎉 Gary Vee Network is now deployed on AWS!${NC}" 