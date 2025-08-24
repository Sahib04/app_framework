# Deployment Checklist

## Pre-Deployment ✅

- [ ] Code is committed to GitHub repository
- [ ] All tests pass locally
- [ ] Environment variables are documented
- [ ] Database schema is ready
- [ ] API endpoints are working locally

## Database Setup ✅

- [ ] Create PostgreSQL database on Render
- [ ] Note down the database connection URL
- [ ] Test database connection locally

## Backend Deployment ✅

- [ ] Create Web Service on Render
- [ ] Connect GitHub repository
- [ ] Set build command: `cd server && npm install`
- [ ] Set start command: `cd server && npm start`
- [ ] Add environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL=<your-db-url>`
  - [ ] `JWT_SECRET=<your-secret>`
  - [ ] `PORT=10000`
- [ ] Deploy and check logs
- [ ] Test health endpoint: `/health`

## Frontend Deployment ✅

- [ ] Create Static Site on Render
- [ ] Connect GitHub repository
- [ ] Set build command: `cd client && npm install && npm run build`
- [ ] Set publish directory: `client/build`
- [ ] Add environment variable:
  - [ ] `REACT_APP_API_URL=https://your-backend-url.onrender.com`
- [ ] Deploy and check logs

## Database Migration ✅

- [ ] Run database setup script:
  ```bash
  DATABASE_URL=<your-db-url> node deploy-setup.js
  ```
- [ ] Verify tables are created
- [ ] Test database connections

## CORS Configuration ✅

- [ ] Update CORS settings in backend
- [ ] Add frontend URL to allowed origins
- [ ] Restart backend service

## Testing ✅

- [ ] Test backend health endpoint
- [ ] Test frontend loads correctly
- [ ] Test user registration/login
- [ ] Test core functionality
- [ ] Test file uploads (if applicable)
- [ ] Test email functionality (if applicable)

## Security ✅

- [ ] JWT secret is strong and unique
- [ ] Database password is strong
- [ ] Environment variables are not in code
- [ ] HTTPS is enabled (automatic on Render)

## Monitoring ✅

- [ ] Check application logs
- [ ] Monitor database connections
- [ ] Set up error tracking (optional)
- [ ] Test error handling

## Documentation ✅

- [ ] Update README with deployment info
- [ ] Document environment variables
- [ ] Create troubleshooting guide
- [ ] Update API documentation

## Post-Deployment ✅

- [ ] Share application URLs with team
- [ ] Set up monitoring alerts
- [ ] Plan backup strategy
- [ ] Consider scaling options
- [ ] Set up custom domain (optional)

## Quick Commands

```bash
# Test database connection
DATABASE_URL=<your-db-url> node deploy-setup.js

# Test backend locally with production env
NODE_ENV=production DATABASE_URL=<your-db-url> cd server && npm start

# Build frontend locally
cd client && npm run build
```

## Troubleshooting

- **Build fails**: Check package.json dependencies
- **Database connection fails**: Verify DATABASE_URL format
- **CORS errors**: Update CORS settings with correct frontend URL
- **Environment variables not working**: Restart service after adding variables

## URLs to Test

- Backend Health: `https://your-backend.onrender.com/health`
- Frontend: `https://your-frontend.onrender.com`
- API Base: `https://your-backend.onrender.com/api`
