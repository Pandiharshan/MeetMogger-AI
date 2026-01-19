# MeetMogger AI - Deployment Guide

## Backend Deployment (Render)

### 1. Prepare Environment Variables
Create these environment variables in Render dashboard:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meetmogger-ai
JWT_SECRET=your-32-character-secret-key
GEMINI_API_KEY=your-gemini-api-key
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
NODE_ENV=production
```

### 2. Deploy to Render
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Use these settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Plan**: Free (or paid for better performance)

### 3. Alternative: Deploy to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### 4. Alternative: Deploy to Vercel (Serverless)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## Frontend Deployment (Vercel/Netlify)

### 1. Update Environment Variables
Create `.env.production`:
```bash
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy
npm run build
vercel --prod
```

### 3. Alternative: Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

## Post-Deployment Checklist

### Backend
- [ ] Health endpoint accessible: `https://your-backend.com/api/health`
- [ ] CORS configured for frontend domain
- [ ] MongoDB connection working
- [ ] JWT secret is secure (32+ characters)
- [ ] Environment variables set correctly

### Frontend
- [ ] Frontend loads without errors
- [ ] API calls work (check browser network tab)
- [ ] Authentication flow works
- [ ] Protected routes are secured
- [ ] No console errors

### Security
- [ ] No sensitive data in repository
- [ ] Strong JWT secret in production
- [ ] CORS properly configured
- [ ] HTTPS enabled on both frontend and backend
- [ ] Environment variables secured

## Troubleshooting

### Common Issues

1. **CORS Error**
   - Check ALLOWED_ORIGINS environment variable
   - Ensure frontend domain is included

2. **MongoDB Connection Failed**
   - Verify MONGODB_URI is correct
   - Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for cloud deployment)

3. **JWT Token Issues**
   - Ensure JWT_SECRET is set and consistent
   - Check token expiration (currently 7 days)

4. **API Not Found (404)**
   - Verify backend URL in frontend configuration
   - Check if backend is deployed and running

5. **Build Failures**
   - Check Node.js version (requires 18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

## Monitoring

### Backend Logs
- Render: Check logs in dashboard
- Railway: `railway logs`
- Vercel: Check function logs in dashboard

### Frontend Errors
- Check browser console for JavaScript errors
- Monitor network requests in DevTools
- Use error tracking service (Sentry, LogRocket)

## Performance Optimization

### Backend
- Enable gzip compression
- Add rate limiting
- Implement caching
- Use connection pooling for MongoDB

### Frontend
- Optimize bundle size
- Enable lazy loading
- Use CDN for static assets
- Implement service worker for caching