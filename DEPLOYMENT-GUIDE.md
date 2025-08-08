# Gary Vee Network - Vercel Deployment Guide

## 🎯 Overview

This guide will help you deploy your Gary Vee Network application to Vercel while keeping your working local code safe.

## 📋 Prerequisites

- Your application is working locally (✅ Confirmed)
- You have a Vercel account
- Your GitHub repository is connected to Vercel

## 🚀 Deployment Steps

### Step 1: Generate Environment Variables

Run the deployment script to generate your environment variables:

```bash
node scripts/deploy-to-vercel.js
```

This will:
- Convert your Snowflake private key to base64
- Display all required environment variables
- Provide step-by-step instructions

### Step 2: Set Up Vercel Environment Variables

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project (gary-vee-network)
3. Go to **Settings** → **Environment Variables**
4. Add each environment variable from the script output:

#### Required Environment Variables:

```
SNOWFLAKE_ACCOUNT=jva07313.us-east-1
SNOWFLAKE_USERNAME=BIZ_APPS_TABLEAU_USER
SNOWFLAKE_ROLE=BIZ_APPS
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
SNOWFLAKE_DATABASE=VXSFINANCE_CORE_DATA
SNOWFLAKE_SCHEMA=REPORTING_MODEL
SNOWFLAKE_PRIVATE_KEY=[base64-encoded-private-key]
OPENAI_API_KEY=[your-openai-api-key]
```

**Important:** Set these for **Production**, **Preview**, and **Development** environments.

### Step 3: Deploy the Application

#### Option A: Via Vercel Dashboard
1. Go to your project in Vercel
2. Click **Deploy** or **Redeploy**
3. Vercel will automatically detect the deployment-setup branch

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy from the deployment-setup branch
git checkout deployment-setup
vercel --prod
```

### Step 4: Verify Deployment

1. Check your Vercel deployment URL
2. Verify that:
   - The application loads without errors
   - Contact data is displayed
   - Voice notes functionality works
   - All features are operational

## 🔧 Troubleshooting

### Common Issues:

1. **Environment Variables Not Set**
   - Ensure all variables are set for all environments
   - Check that the private key is properly base64 encoded

2. **Build Failures**
   - Check Vercel build logs for specific errors
   - Ensure all dependencies are in package.json

3. **Database Connection Issues**
   - Verify Snowflake credentials are correct
   - Check that the private key is properly formatted

### Debug Commands:

```bash
# Test environment variables locally
node scripts/deploy-to-vercel.js

# Check Vercel deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]
```

## 🔒 Security Notes

- ✅ Your working code is safe on the `main` branch
- ✅ Deployment setup is on the `deployment-setup` branch
- ✅ Private key is only stored as environment variables on Vercel
- ✅ Local development continues to use file-based authentication

## 📁 File Structure

```
gary-vee-network/
├── src/
│   ├── lib/
│   │   ├── snowflake.ts                    # Local development
│   │   ├── snowflake-vercel-deploy.ts      # Vercel deployment
│   │   ├── storage.ts                      # Local development
│   │   └── storage-vercel.ts               # Vercel deployment
│   └── app/api/
│       └── contacts/
│           ├── route.ts                    # Local development
│           └── route-vercel.ts             # Vercel deployment
├── scripts/
│   └── deploy-to-vercel.js                 # Deployment helper
├── vercel.json                             # Vercel configuration
└── DEPLOYMENT-GUIDE.md                     # This guide
```

## 🔄 Switching Between Local and Production

### For Local Development:
```bash
git checkout main
npm run dev
```

### For Production Deployment:
```bash
git checkout deployment-setup
# Deploy to Vercel
```

## 📞 Support

If you encounter issues:

1. Check the Vercel deployment logs
2. Verify environment variables are set correctly
3. Ensure your Snowflake database is accessible
4. Test the application locally first

## ✅ Success Checklist

- [ ] Environment variables generated
- [ ] Vercel environment variables configured
- [ ] Application deployed successfully
- [ ] All features working on production
- [ ] Voice notes functionality operational
- [ ] Database connections established
- [ ] Local development still works

---

**🎉 Congratulations!** Your Gary Vee Network application is now deployed to Vercel while maintaining your working local development environment. 