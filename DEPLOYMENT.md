# Gary Vee Network - Deployment Guide

This guide covers deploying the Gary Vee Network application using Docker, testing with Playwright, and deploying to AWS/DigitalOcean.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop
- Git

### Local Development with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/jugalsheth/gary-vee-network.git
   cd gary-vee-network
   ```

2. **Start development environment with auto-refresh**
   ```bash
   # Development with hot reload
   docker-compose --profile dev up
   
   # Or production build
   docker-compose --profile prod up
   ```

3. **Access the application**
   - Development: http://localhost:3000
   - Production: http://localhost (with Nginx)

## 🧪 Testing

### Playwright Testing

1. **Install Playwright**
   ```bash
   npm install --save-dev @playwright/test
   npx playwright install
   ```

2. **Run tests**
   ```bash
   # Run all tests
   npx playwright test
   
   # Run tests in headed mode
   npx playwright test --headed
   
   # Run specific test file
   npx playwright test home.spec.ts
   
   # Generate test report
   npx playwright show-report
   ```

3. **Test scenarios covered**
   - Home page functionality
   - Contact management (add, edit, delete)
   - OCR feature testing
   - AI chat functionality
   - Dark mode toggle
   - Responsive design
   - Export/import features

### Test Data
- Sample contacts are automatically loaded on first run
- Test images for OCR are in `tests/fixtures/`
- Mock data for AI responses

## 🐳 Docker Deployment

### Development Environment
```bash
# Build and run development container
docker-compose --profile dev up --build

# View logs
docker-compose logs -f app-dev

# Stop development environment
docker-compose --profile dev down
```

### Production Environment
```bash
# Build and run production stack
docker-compose --profile prod up --build

# Scale the application
docker-compose --profile prod up --scale app-prod=3

# View production logs
docker-compose logs -f app-prod nginx
```

### Docker Commands
```bash
# Build production image
docker build -t gary-vee-network .

# Run production container
docker run -p 3000:3000 gary-vee-network

# Build with specific tag
docker build -t gary-vee-network:v1.0.0 .

# Push to registry
docker tag gary-vee-network:latest your-registry/gary-vee-network:latest
docker push your-registry/gary-vee-network:latest
```

## ☁️ Cloud Deployment

### AWS Deployment

1. **Prerequisites**
   - AWS CLI installed and configured
   - Docker running
   - AWS ECS permissions

2. **Deploy to AWS**
   ```bash
   # Make script executable
   chmod +x deploy/aws-deploy.sh
   
   # Run deployment
   ./deploy/aws-deploy.sh
   ```

3. **AWS Resources Created**
   - ECR repository for Docker images
   - ECS cluster and service
   - Application Load Balancer
   - CloudWatch log groups
   - Auto-scaling policies

4. **Monitor Deployment**
   - ECS Console: https://console.aws.amazon.com/ecs
   - CloudWatch Logs: https://console.aws.amazon.com/cloudwatch
   - Application URL: Provided in deployment output

### DigitalOcean Deployment

1. **Prerequisites**
   - DigitalOcean CLI (doctl) installed
   - DigitalOcean account and API token
   - Docker running

2. **Authenticate with DigitalOcean**
   ```bash
   doctl auth init
   ```

3. **Deploy to DigitalOcean**
   ```bash
   # Make script executable
   chmod +x deploy/digitalocean-deploy.sh
   
   # Run deployment
   ./deploy/digitalocean-deploy.sh
   ```

4. **DigitalOcean Resources Created**
   - App Platform application
   - Redis database
   - Load balancer
   - Auto-scaling configuration

5. **Monitor Deployment**
   - App Platform Console: https://cloud.digitalocean.com/apps
   - Application URL: Provided in deployment output

## 🔄 CI/CD Pipeline

### GitHub Actions

The project includes a comprehensive CI/CD pipeline that:

1. **Runs on every push/PR**
   - Linting and type checking
   - Playwright tests
   - Security scanning
   - Docker image building

2. **Deploys automatically**
   - `dev` branch → Staging environment
   - `main` branch → Production environment

3. **Security features**
   - Trivy vulnerability scanning
   - CodeQL analysis
   - Dependency scanning

### Manual Deployment

```bash
# Build and test locally
npm ci
npm run lint
npm run build
npx playwright test

# Deploy to cloud
./deploy/aws-deploy.sh
# or
./deploy/digitalocean-deploy.sh
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
# Application
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_api_key

# Database (for future Snowflake migration)
DATABASE_URL=your_database_url

# Redis (for session management)
REDIS_URL=redis://localhost:6379
```

### Production Configuration

For production deployments, set these environment variables:

```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
OPENAI_API_KEY=your_production_openai_key
DATABASE_URL=your_production_database_url
REDIS_URL=your_production_redis_url
```

## 📊 Monitoring

### Health Checks

The application includes health check endpoints:

- `/api/health` - Application health
- `/api/ready` - Readiness check
- `/api/live` - Liveness check

### Logging

- Application logs: Docker logs or CloudWatch
- Error tracking: Console errors and network requests
- Performance: Browser DevTools and Lighthouse

### Metrics

- Contact count and growth
- OCR usage statistics
- AI chat interactions
- User engagement metrics

## 🔒 Security

### Security Headers

The application includes security headers via Nginx:

- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Content-Security-Policy: Configured for the application

### Rate Limiting

- API endpoints: 10 requests/second
- Login attempts: 5 requests/second
- File uploads: 10MB limit

### SSL/TLS

- Automatic HTTPS redirect
- Modern TLS configuration
- HSTS headers

## 🚨 Troubleshooting

### Common Issues

1. **Docker build fails**
   ```bash
   # Clear Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker build --no-cache -t gary-vee-network .
   ```

2. **Playwright tests fail**
   ```bash
   # Install browsers
   npx playwright install
   
   # Run with debug
   npx playwright test --debug
   ```

3. **Deployment fails**
   ```bash
   # Check logs
   docker-compose logs app-prod
   
   # Verify configuration
   docker-compose config
   ```

4. **Performance issues**
   ```bash
   # Check resource usage
   docker stats
   
   # Scale up
   docker-compose --profile prod up --scale app-prod=3
   ```

### Support

For deployment issues:
1. Check the logs: `docker-compose logs`
2. Verify configuration files
3. Test locally first
4. Check cloud provider status

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale to multiple instances
docker-compose --profile prod up --scale app-prod=5

# Or in production
aws ecs update-service --cluster gary-vee-network-cluster --service gary-vee-network-service --desired-count 5
```

### Vertical Scaling

Update the Docker Compose file or cloud configuration to increase CPU/memory allocation.

### Auto-scaling

The cloud deployments include auto-scaling policies based on CPU/memory usage.

---

**Ready for production deployment! 🚀**

For questions or issues, check the main README.md or create an issue in the repository. 