# Deployment Guide - School Management System

This guide will walk you through deploying the School Management System on Render.

## Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **PostgreSQL Database**: You can use Render's PostgreSQL service

## Step 1: Database Setup

### Option A: Render PostgreSQL (Recommended)

1. Go to your Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `school-management-db`
   - **Database**: `school_management`
   - **User**: `school_user`
   - **Plan**: Free (or your preferred plan)
4. Click "Create Database"
5. Copy the **Internal Database URL** (you'll need this for environment variables)

### Option B: External PostgreSQL

If you have an external PostgreSQL database, make sure it's accessible and note the connection string.

## Step 2: Backend Deployment

### 1. Create Web Service

1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository

### 2. Configure Backend Service

**Basic Settings:**
- **Name**: `school-management-api`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty (root of repository)

**Build & Deploy:**
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && npm start`
- **Plan**: Free (or your preferred plan)

### 3. Environment Variables

Add these environment variables in the Render dashboard:

```
NODE_ENV=production
DATABASE_URL=<your-postgresql-connection-string>
JWT_SECRET=<your-super-secret-jwt-key-at-least-32-characters>
PORT=10000
```

**Important Notes:**
- Replace `<your-postgresql-connection-string>` with your actual database URL
- Generate a strong JWT_SECRET (you can use a password generator)
- The DATABASE_URL should look like: `postgres://username:password@host:port/database`

### 4. Deploy

Click "Create Web Service" and wait for the deployment to complete.

## Step 3: Frontend Deployment

### 1. Create Static Site

1. Go to Render Dashboard
2. Click "New +" → "Static Site"
3. Connect your GitHub repository

### 2. Configure Frontend Service

**Basic Settings:**
- **Name**: `school-management-client`
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty

**Build & Deploy:**
- **Build Command**: `cd client && npm install && npm run build`
- **Publish Directory**: `client/build`

### 3. Environment Variables

Add this environment variable:

```
REACT_APP_API_URL=https://your-backend-service-name.onrender.com
```

Replace `your-backend-service-name` with the actual name you used for your backend service.

### 4. Deploy

Click "Create Static Site" and wait for the deployment to complete.

## Step 4: Database Migration

### Option A: Using Setup Script (Recommended)

1. **Locally**: Run the database setup with your production database URL
   ```bash
   DATABASE_URL=<your-production-db-url> node setup_database.py
   ```

2. **Or create a temporary deployment script**:
   ```javascript
   // deploy-setup.js
   const { sequelize } = require('./server/models');
   
   async function setupDatabase() {
     try {
       await sequelize.authenticate();
       console.log('✅ Connected to database');
       
       await sequelize.sync({ force: true }); // WARNING: This will drop all tables
       console.log('✅ Database tables created');
       
       process.exit(0);
     } catch (error) {
       console.error('❌ Setup failed:', error);
       process.exit(1);
     }
   }
   
   setupDatabase();
   ```

### Option B: Manual Setup

1. Connect to your production database
2. Run the SQL scripts from `database_setup.py` manually

## Step 5: Update CORS Settings

After both services are deployed, update the CORS settings in your backend:

1. Go to your backend service in Render
2. Navigate to the code editor or update locally and redeploy
3. Update `server/index.js`:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-service-name.onrender.com']
    : ['http://localhost:3000'],
  credentials: true
}));
```

## Step 6: Test Your Deployment

1. **Test Backend**: Visit `https://your-backend-service-name.onrender.com/health`
2. **Test Frontend**: Visit your frontend URL
3. **Test Login**: Try logging in with test credentials

## Environment Variables Reference

### Backend (.env)
```bash
# Required
DATABASE_URL=postgres://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production

# Optional
PORT=10000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend (.env)
```bash
REACT_APP_API_URL=https://your-backend-service-name.onrender.com
```

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check the build logs in Render
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

2. **Database Connection Fails**
   - Verify DATABASE_URL is correct
   - Check if database is accessible
   - Ensure database exists and user has permissions

3. **CORS Errors**
   - Update CORS settings with correct frontend URL
   - Restart backend service after changes

4. **Environment Variables Not Working**
   - Ensure variables are set in Render dashboard
   - Restart service after adding variables
   - Check variable names match code

### Logs and Debugging

1. **View Logs**: Go to your service in Render → "Logs" tab
2. **Health Check**: Visit `/health` endpoint
3. **Database**: Check database connection in logs

## Security Considerations

1. **JWT Secret**: Use a strong, random secret
2. **Database**: Use strong passwords
3. **HTTPS**: Render provides SSL certificates automatically
4. **Environment Variables**: Never commit secrets to Git

## Scaling

- **Free Plan**: Limited to 750 hours/month
- **Paid Plans**: More resources and features
- **Database**: Consider upgrading for production use

## Support

If you encounter issues:
1. Check Render documentation
2. Review service logs
3. Verify environment variables
4. Test locally first

## Next Steps

After successful deployment:
1. Set up custom domain (optional)
2. Configure email service for password reset
3. Set up monitoring and alerts
4. Create backup strategy
5. Plan for scaling
