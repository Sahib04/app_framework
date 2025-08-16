# Backend Updater Script

This Python script helps you update the backend response structure and manage users in your School Management System.

## 🚀 Quick Start

### Prerequisites
- Python 3.7 or higher
- Backend server running on http://localhost:5000
- pip (Python package installer)

### Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the script:**
   ```bash
   python backend_updater.py
   ```

   **For Windows users:** Double-click `run_backend_updater.bat`

## 📋 Available Actions

### 1. Test Backend Connection
- Verifies that your backend server is running and accessible

### 2. Update Backend Response Structure
- **IMPORTANT:** This modifies your backend files to return flatter responses
- Creates backups of original files (`.backup` extension)
- Changes response structure from:
  ```javascript
  // Before (nested)
  {
    success: true,
    data: { user: {...}, token: "..." }
  }
  
  // After (flat)
  {
    user: {...},
    token: "..."
  }
  ```

### 3. Create Demo Users
- Creates the standard demo users with proper roles:
  - **Admin:** admin@school.com / admin123
  - **Teacher:** teacher@school.com / teacher123
  - **Student:** student@school.com / student123
  - **Parent:** parent@school.com / parent123

### 4. List All Users
- Shows all users currently in the system

### 5. Create Custom User
- Interactive form to create a new user with custom details

### 6. Update User
- Modify existing user information

### 7. Delete User
- Remove users from the system

## 🔧 How It Works

### Response Structure Update
The script modifies these backend files:
- `server/routes/auth.js` - Login, register, and /me endpoints
- `server/routes/users.js` - User management endpoints

### User Management
- Uses the backend API endpoints to manage users
- Automatically hashes passwords using bcrypt
- Generates UUIDs for new users
- Sets appropriate default values

## ⚠️ Important Notes

1. **Backup Files:** The script creates `.backup` files before making changes
2. **Server Restart:** After updating response structure, restart your backend server
3. **Database:** Make sure your database is running and accessible
4. **Permissions:** Ensure the script has read/write access to your project files

## 🚨 Troubleshooting

### "Cannot connect to backend"
- Make sure your backend server is running on port 5000
- Check if the server is accessible at http://localhost:5000

### "File not found" errors
- Ensure you're running the script from the project root directory
- Check that the file paths in the script match your project structure

### Permission errors
- Run the script with appropriate permissions
- Check file ownership and access rights

## 📁 Files Created/Modified

- `backend_updater.py` - Main Python script
- `requirements.txt` - Python dependencies
- `run_backend_updater.bat` - Windows batch file
- `*.backup` - Backup files of modified backend routes

## 🔄 After Running the Script

1. **Restart your backend server:**
   ```bash
   npm run server
   # or
   node server/index.js
   ```

2. **Test the login with demo users:**
   - Try logging in with any of the demo credentials
   - Check the browser console for the updated user object structure

3. **Verify role-based dashboards:**
   - Admin users should see AdminDashboard
   - Teacher users should see TeacherDashboard
   - Student users should see StudentDashboard
   - Parent users should see ParentDashboard

## 💡 Customization

You can modify the script to:
- Add more user fields
- Change the default user roles
- Modify the response structure further
- Add validation rules
- Integrate with external authentication systems

## 🆘 Support

If you encounter issues:
1. Check the console output for error messages
2. Verify your backend server is running
3. Check the backup files to restore original code
4. Ensure all dependencies are installed correctly
