# 🚀 Vercel Deployment Guide - Gary Vee Network

## 📋 **Prerequisites**

Before we start, make sure you have:
- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager
- ✅ Your `.env.local` file with all environment variables
- ✅ A Vercel account (free tier is fine)

## 🔧 **Step 1: Install Vercel CLI**

```bash
npm install -g vercel
```

## 🔧 **Step 2: Prepare Environment Variables**

Your `.env.local` file should contain all necessary variables. Here's what you need:

```bash
# JWT Secret (REQUIRED)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Snowflake Configuration (if using)
SNOWFLAKE_ACCOUNT=your-snowflake-account
SNOWFLAKE_USERNAME=your-snowflake-username
SNOWFLAKE_ROLE=your-snowflake-role
SNOWFLAKE_WAREHOUSE=your-snowflake-warehouse
SNOWFLAKE_DATABASE=your-snowflake-database
SNOWFLAKE_SCHEMA=your-snowflake-schema
SNOWFLAKE_PRIVATE_KEY=your-base64-encoded-private-key

# OpenAI (if using AI features)
OPENAI_API_KEY=your-openai-api-key

# Other optional variables
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## 🔧 **Step 3: Test Local Build**

Before deploying, let's make sure everything builds locally:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# If build succeeds, you're ready to deploy!
```

## 🚀 **Step 4: Deploy to Vercel**

### **Option A: Using the Deployment Script (Recommended)**

```bash
# Run the deployment script
node scripts/deploy-to-vercel.js
```

This script will:
- ✅ Check if Vercel CLI is installed
- ✅ Copy your `.env.local` to `.env.production`
- ✅ Build the project
- ✅ Deploy to Vercel

### **Option B: Manual Deployment**

```bash
# Login to Vercel (first time only)
vercel login

# Deploy to Vercel
vercel --prod
```

## 🔧 **Step 5: Configure Environment Variables in Vercel Dashboard**

After the first deployment, you need to set up environment variables:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project** (gary-vee-network)
3. **Go to Settings → Environment Variables**
4. **Add each variable** from your `.env.local` file:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `JWT_SECRET` | `your-jwt-secret` | Production, Preview, Development |
| `SNOWFLAKE_ACCOUNT` | `your-account` | Production, Preview, Development |
| `SNOWFLAKE_USERNAME` | `your-username` | Production, Preview, Development |
| `SNOWFLAKE_ROLE` | `your-role` | Production, Preview, Development |
| `SNOWFLAKE_WAREHOUSE` | `your-warehouse` | Production, Preview, Development |
| `SNOWFLAKE_DATABASE` | `your-database` | Production, Preview, Development |
| `SNOWFLAKE_SCHEMA` | `your-schema` | Production, Preview, Development |
| `SNOWFLAKE_PRIVATE_KEY` | `your-base64-key` | Production, Preview, Development |
| `OPENAI_API_KEY` | `your-openai-key` | Production, Preview, Development |

## 🔧 **Step 6: Redeploy with Environment Variables**

After setting environment variables:

```bash
# Redeploy to apply environment variables
vercel --prod
```

## 🧪 **Step 7: Test Your Deployment**

1. **Visit your Vercel URL** (e.g., `https://gary-vee-network.vercel.app`)
2. **Test the login system**:
   - Go to `/login`
   - Try demo accounts:
     - CAIT Team: `demo-cait` / `password123`
     - TeamG Admin: `demo-teamg` / `password123`
3. **Test authentication**:
   - Visit `/test-auth` to verify authentication
   - Try accessing protected routes
   - Test logout functionality

## 🔧 **Step 8: Custom Domain (Optional)**

If you want a custom domain:

1. **Go to Vercel Dashboard → Domains**
2. **Add your domain** (e.g., `garyvee.network`)
3. **Configure DNS** as instructed by Vercel
4. **Wait for DNS propagation** (can take up to 48 hours)

## 🔧 **Step 9: Monitoring and Updates**

### **View Logs**
```bash
# View deployment logs
vercel logs

# View function logs
vercel logs --function=api/auth/login
```

### **Update Deployment**
```bash
# Deploy updates
vercel --prod

# Or use the script
node scripts/deploy-to-vercel.js
```

## 🚨 **Troubleshooting**

### **Build Errors**
```bash
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### **Environment Variable Issues**
```bash
# Check environment variables
vercel env ls

# Add missing variables
vercel env add JWT_SECRET
```

### **Authentication Issues**
1. **Check JWT_SECRET** is set correctly
2. **Verify cookie settings** in production
3. **Test with `/test-auth`** page

### **Database Connection Issues**
1. **Verify Snowflake credentials** are correct
2. **Check network access** from Vercel to Snowflake
3. **Test API endpoints** directly

## 📊 **Performance Optimization**

### **Vercel Analytics**
- Enable Vercel Analytics in dashboard
- Monitor Core Web Vitals
- Track user interactions

### **Caching**
- API responses are cached automatically
- Static assets are served from CDN
- Images are optimized automatically

## 🔒 **Security Checklist**

- [ ] JWT_SECRET is set and secure
- [ ] Environment variables are encrypted
- [ ] HTTPS is enforced
- [ ] Security headers are configured
- [ ] Rate limiting is active
- [ ] Authentication is working
- [ ] No sensitive data in logs

## 🎯 **Next Steps**

1. **Test thoroughly** on the deployed version
2. **Monitor performance** and errors
3. **Set up alerts** for any issues
4. **Configure backups** if needed
5. **Plan for scaling** as usage grows

## 📞 **Support**

If you encounter issues:

1. **Check Vercel logs**: `vercel logs`
2. **Review build output** for errors
3. **Test locally** first
4. **Check environment variables** are set correctly
5. **Verify authentication** flow works

---

## 🎉 **Congratulations!**

Your Gary Vee Network is now live on Vercel! 

**Your app URL**: `https://your-project-name.vercel.app`

**Test URL**: `https://your-project-name.vercel.app/test-auth`

The authentication system is working, your data is secure, and you're ready to scale! 🚀
