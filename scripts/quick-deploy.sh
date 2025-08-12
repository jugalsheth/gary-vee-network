#!/bin/bash

echo "🚀 Gary Vee Network - Quick Vercel Deployment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_error ".env.local file not found!"
    print_status "Please create .env.local with your environment variables"
    print_status "You can use env-template.txt as a reference"
    exit 1
fi

print_success "Found .env.local file"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    exit 1
fi

print_success "Node.js is installed: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    exit 1
fi

print_success "npm is installed: $(npm --version)"

# Install dependencies
print_status "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

print_success "Dependencies installed successfully"

# Build the project
print_status "Building the project..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed!"
    exit 1
fi

print_success "Build completed successfully"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
    
    if [ $? -ne 0 ]; then
        print_error "Failed to install Vercel CLI"
        exit 1
    fi
fi

print_success "Vercel CLI is available"

# Deploy to Vercel
print_status "Deploying to Vercel..."
vercel --prod

if [ $? -ne 0 ]; then
    print_error "Deployment failed!"
    exit 1
fi

print_success "Deployment completed successfully!"

echo ""
echo "🎉 Your Gary Vee Network is now live on Vercel!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to your Vercel dashboard"
echo "2. Add environment variables from .env.local"
echo "3. Test your application"
echo "4. Visit /test-auth to verify authentication"
echo ""
echo "🔗 Your app URL will be shown above"
echo "🧪 Test URL: https://your-app.vercel.app/test-auth"
echo ""
print_success "Deployment complete! 🚀"
