# School Management System

A comprehensive school management system built with React.js frontend and Node.js/Express.js backend with PostgreSQL database.

## Features

- **User Management**: Admin, Teacher, Student, and Parent roles
- **Course Management**: Create and manage courses
- **Class Management**: Schedule and manage classes
- **Assignment Management**: Create and submit assignments
- **Attendance Tracking**: Mark and track student attendance
- **Grade Management**: Record and view grades
- **Event Management**: School events and announcements
- **Fee Management**: Track and manage fees
- **Messaging System**: Internal messaging between users
- **Test Management**: Create and manage tests with comments

## Tech Stack

### Frontend
- React.js 18
- Material-UI (MUI) v5
- Redux Toolkit
- React Router
- Axios

### Backend
- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL
- JWT Authentication
- bcryptjs for password hashing

## Local Development Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project3
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install
   
   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment example
   cp env.example .env
   
   # Edit .env with your configuration
   # DATABASE_URL=postgres://username:password@host:port/database_name
   # JWT_SECRET=your-super-secret-jwt-key-here
   ```

4. **Database Setup**
   ```bash
   # Run database setup script
   node setup_database.py
   ```

5. **Start the application**
   ```bash
   # Start backend server (from server directory)
   npm start
   
   # Start frontend (from client directory)
   npm start
   ```

## Deployment on Render

### Prerequisites
- Render account
- PostgreSQL database (you can use Render's PostgreSQL service)

### Step 1: Database Setup

1. Create a new PostgreSQL database on Render
2. Note down the database URL

### Step 2: Backend Deployment

1. **Connect your GitHub repository to Render**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the backend service**
   - **Name**: `school-management-api`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free (or choose your preferred plan)

3. **Environment Variables**
   ```
   NODE_ENV=production
   DATABASE_URL=<your-postgresql-url-from-render>
   JWT_SECRET=<your-super-secret-jwt-key>
   PORT=10000
   ```

### Step 3: Frontend Deployment

1. **Create a new Static Site on Render**
   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure the frontend service**
   - **Name**: `school-management-client`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/build`

3. **Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend-service-name.onrender.com
   ```

### Step 4: Update CORS Settings

After deployment, update the CORS settings in `server/index.js`:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.onrender.com']
    : ['http://localhost:3000'],
  credentials: true
}));
```

### Step 5: Database Migration

1. **Option 1: Use the setup script**
   ```bash
   # Run this locally with the production DATABASE_URL
   DATABASE_URL=<your-production-db-url> node setup_database.py
   ```

2. **Option 2: Manual setup**
   - Connect to your production database
   - Run the SQL scripts from `database_setup.py`

## Environment Variables

### Required Variables
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `NODE_ENV`: Environment (development/production)

### Optional Variables
- `PORT`: Server port (default: 5000)
- `EMAIL_HOST`: SMTP host for email functionality
- `EMAIL_PORT`: SMTP port
- `EMAIL_USER`: Email username
- `EMAIL_PASS`: Email password

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/profile` - Update profile
- `GET /api/users` - Get all users (admin only)

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Tests
- `GET /api/tests` - Get all tests
- `POST /api/tests` - Create test
- `PUT /api/tests/:id` - Update test
- `DELETE /api/tests/:id` - Delete test
- `POST /api/tests/:id/comments` - Add comment to test
- `GET /api/tests/:id/comments` - Get test comments

### And many more...

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
