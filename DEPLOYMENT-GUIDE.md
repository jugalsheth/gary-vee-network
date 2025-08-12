# 🚀 Office Testing Deployment Guide

## 📋 **Deployment Options for Office Testing**

### **Option 1: Vercel with Password Protection (Recommended)**

#### **Step 1: Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### **Step 2: Set Environment Variables**
In Vercel dashboard:
- `TEST_PASSWORD` = `garyvee2024` (or your custom password)
- `WHITELISTED_IPS` = `192.168.1.1,10.0.0.1` (optional - office IPs)

#### **Step 3: Share Access**
- **URL**: `https://your-app.vercel.app`
- **Password**: `garyvee2024`
- Users will see a login page first

---

### **Option 2: Cloudflare Pages + Access**

#### **Step 1: Deploy to Cloudflare Pages**
```bash
# Build the project
npm run build

# Deploy to Cloudflare Pages via GitHub
# Connect your GitHub repo to Cloudflare Pages
```

#### **Step 2: Configure Cloudflare Access**
1. Go to Cloudflare Dashboard → Access
2. Create new application
3. Add authentication rules:
   - **Email domains**: `@yourcompany.com`
   - **IP ranges**: Your office IP ranges
4. Set up SSO (Google Workspace, etc.)

#### **Step 3: Share Access**
- **URL**: `https://your-app.pages.dev`
- **Access**: Only authenticated users from your domain

---

### **Option 3: Railway with Basic Auth**

#### **Step 1: Deploy to Railway**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway login
railway init
railway up
```

#### **Step 2: Set Environment Variables**
```bash
railway variables set TEST_PASSWORD=garyvee2024
railway variables set NODE_ENV=production
```

---

## 🔧 **Environment Variables Setup**

### **Required Variables**
```env
# Database
SNOWFLAKE_ACCOUNT=your_account
SNOWFLAKE_USERNAME=your_username
SNOWFLAKE_PRIVATE_KEY=your_private_key
SNOWFLAKE_DATABASE=your_database
SNOWFLAKE_SCHEMA=your_schema
SNOWFLAKE_WAREHOUSE=your_warehouse

# Security
TEST_PASSWORD=garyvee2024
WHITELISTED_IPS=192.168.1.1,10.0.0.1

# Environment
NODE_ENV=production
```

### **Optional Variables**
```env
# Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info

# Performance
CACHE_TTL=900000
MAX_CACHE_SIZE=500
```

---

## 📊 **Testing Checklist**

### **Before Sharing with Office Users**

- [ ] **Rate Limiting**: Test with multiple users
- [ ] **Error Monitoring**: Check `/api/monitoring/errors`
- [ ] **Performance**: Verify cache hit rates
- [ ] **Security**: Test password protection
- [ ] **Database**: Confirm Snowflake connection
- [ ] **Mobile**: Test responsive design

### **User Access Testing**

- [ ] **Password Protection**: Verify login flow
- [ ] **Session Management**: Test cookie persistence
- [ ] **IP Whitelisting**: Test from office vs external
- [ ] **Rate Limits**: Verify protection works
- [ ] **Error Handling**: Test graceful failures

---

## 🔒 **Security Features Active**

### **✅ Password Protection**
- Custom password required for access
- Session cookies with 7-day expiry
- HTTP-only, secure cookies

### **✅ Rate Limiting**
- Search: 30 requests/minute
- Auth: 5 attempts/15 minutes
- Contacts: 20 operations/5 minutes

### **✅ Error Monitoring**
- Real-time error tracking
- Performance metrics
- System health monitoring

### **✅ IP Protection**
- Optional IP whitelisting
- X-Forwarded-For header support
- Cloudflare integration ready

---

## 📱 **User Instructions**

### **For Office Users**

1. **Access the Application**
   - URL: `https://your-app.vercel.app`
   - Enter password: `garyvee2024`

2. **First Time Setup**
   - Login with demo credentials
   - Explore the interface
   - Test search functionality

3. **Testing Focus Areas**
   - Search performance
   - Contact management
   - Voice recording
   - Mobile responsiveness

4. **Report Issues**
   - Use browser developer tools
   - Check console for errors
   - Note any performance issues

---

## 🚨 **Monitoring & Alerts**

### **Performance Dashboard**
- Access via bottom-right button
- Real-time metrics
- Error tracking
- Cache performance

### **API Endpoints**
- `/api/monitoring/errors` - Error statistics
- `/api/cache` - Cache performance
- `/api/contacts/analytics` - Usage analytics

### **Logs to Watch**
- Rate limiting violations
- Database connection errors
- High error rates
- Performance degradation

---

## 🔄 **Update Process**

### **For Future Updates**
```bash
# Deploy updates
git push origin main
vercel --prod

# Or for Cloudflare
git push origin main
# Automatic deployment via GitHub integration
```

### **Environment Variable Updates**
- Update in Vercel/Cloudflare dashboard
- No code changes needed
- Instant deployment

---

## 📞 **Support & Troubleshooting**

### **Common Issues**

**Password Not Working**
- Check `TEST_PASSWORD` environment variable
- Clear browser cookies
- Try incognito mode

**Database Connection Issues**
- Verify Snowflake credentials
- Check network connectivity
- Review error logs

**Performance Issues**
- Check cache hit rates
- Monitor error rates
- Review rate limiting logs

### **Contact Information**
- **Technical Issues**: Check error monitoring dashboard
- **Access Problems**: Verify password and IP settings
- **Performance**: Review cache and search metrics

---

## 🎯 **Next Steps After Testing**

1. **Gather Feedback**
   - User experience issues
   - Performance concerns
   - Feature requests

2. **Optimize Based on Usage**
   - Adjust rate limits
   - Optimize cache settings
   - Fine-tune search performance

3. **Prepare for Production**
   - Remove password protection
   - Set up proper authentication
   - Configure monitoring alerts

---

**Your app is now ready for secure office testing!** 🚀 