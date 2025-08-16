#!/usr/bin/env python3
"""
Backend Updater Script for School Management System
This script helps update the backend response structure and manage users.
"""

import json
import os
import sys
import requests
from typing import Dict, List, Optional, Any
import bcrypt
import uuid
from datetime import datetime

class BackendUpdater:
    def __init__(self, base_url: str = "http://localhost:5000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session = requests.Session()
        
    def update_auth_response_structure(self) -> bool:
        """
        Update the backend auth routes to return flatter response structure.
        This creates a backup and then modifies the files.
        """
        print("🔄 Updating backend response structure...")
        
        # Files to update
        files_to_update = [
            "server/routes/auth.js",
            "server/routes/users.js"
        ]
        
        for file_path in files_to_update:
            if not os.path.exists(file_path):
                print(f"⚠️  File not found: {file_path}")
                continue
                
            # Create backup
            backup_path = f"{file_path}.backup"
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Create backup
                with open(backup_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ Backup created: {backup_path}")
                
                # Update content for flatter structure
                updated_content = self._update_response_structure(content)
                
                # Write updated content
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(updated_content)
                    
                print(f"✅ Updated: {file_path}")
                
            except Exception as e:
                print(f"❌ Error updating {file_path}: {e}")
                return False
        
        return True
    
    def _update_response_structure(self, content: str) -> str:
        """
        Update the response structure to be flatter.
        Changes from { success: true, data: { user, token } } to { user, token }
        """
        # Update login response
        content = content.replace(
            'res.json({\n      success: true,\n      message: \'Login successful\',\n      data: {\n        user: {\n          id: user.id,\n          firstName: user.firstName,\n          lastName: user.lastName,\n          email: user.email,\n          role: user.role,\n          isEmailVerified: user.isEmailVerified,\n          profilePicture: user.profilePicture\n        },\n        token\n      }\n    });',
            'res.json({\n      user: {\n        id: user.id,\n        firstName: user.firstName,\n        lastName: user.lastName,\n        email: user.email,\n        role: user.role,\n        isEmailVerified: user.isEmailVerified,\n        profilePicture: user.profilePicture\n      },\n      token\n    });'
        )
        
        # Update /me endpoint response
        content = content.replace(
            'res.json({\n      success: true,\n      data: {\n        user: {\n          id: user.id,\n          firstName: user.firstName,\n          lastName: user.lastName,\n          email: user.email,\n          role: user.role,\n          isEmailVerified: user.isEmailVerified,\n          profilePicture: user.profilePicture\n        }\n      }\n    });',
            'res.json({\n      user: {\n        id: user.id,\n        firstName: user.firstName,\n        lastName: user.lastName,\n        email: user.email,\n        role: user.role,\n        isEmailVerified: user.isEmailVerified,\n        profilePicture: user.profilePicture\n      }\n    });'
        )
        
        # Update register response
        content = content.replace(
            'res.json({\n      success: true,\n      message: \'User registered successfully\',\n      data: {\n        user: {\n          id: user.id,\n          firstName: user.firstName,\n          lastName: user.lastName,\n          email: user.email,\n          role: user.role,\n          isEmailVerified: user.isEmailVerified\n        },\n        token\n      }\n    });',
            'res.json({\n      user: {\n        id: user.id,\n        firstName: user.firstName,\n        lastName: user.lastName,\n        email: user.email,\n        role: user.role,\n        isEmailVerified: user.isEmailVerified\n      },\n      token\n    });'
        )
        
        return content
    
    def create_user(self, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Create a new user directly in the database.
        """
        try:
            # Hash password if provided
            if 'password' in user_data:
                password = user_data['password'].encode('utf-8')
                salt = bcrypt.gensalt()
                hashed_password = bcrypt.hashpw(password, salt).decode('utf-8')
                user_data['password'] = hashed_password
            
            # Generate UUID if not provided
            if 'id' not in user_data:
                user_data['id'] = str(uuid.uuid4())
            
            # Set default values
            if 'isActive' not in user_data:
                user_data['isActive'] = True
            if 'isEmailVerified' not in user_data:
                user_data['isEmailVerified'] = True
            if 'createdAt' not in user_data:
                user_data['createdAt'] = datetime.now().isoformat()
            if 'updatedAt' not in user_data:
                user_data['updatedAt'] = datetime.now().isoformat()
            
            # Create user using the API
            response = self.session.post(
                f"{self.api_url}/auth/register",
                json=user_data
            )
            
            if response.status_code == 201 or response.status_code == 200:
                print(f"✅ User created successfully: {user_data['email']}")
                return response.json()
            else:
                print(f"❌ Failed to create user: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Error creating user: {e}")
            return None
    
    def create_demo_users(self) -> bool:
        """
        Create the demo users with proper roles.
        """
        print("👥 Creating demo users...")
        
        demo_users = [
            {
                "firstName": "Admin",
                "lastName": "User",
                "email": "admin@school.com",
                "password": "admin123",
                "role": "admin",
                "phone": "+1234567890",
                "isEmailVerified": True,
                "isActive": True
            },
            {
                "firstName": "John",
                "lastName": "Teacher",
                "email": "teacher@school.com",
                "password": "teacher123",
                "role": "teacher",
                "phone": "+1234567891",
                "isEmailVerified": True,
                "isActive": True
            },
            {
                "firstName": "Alice",
                "lastName": "Student",
                "email": "student@school.com",
                "password": "student123",
                "role": "student",
                "phone": "+1234567892",
                "isEmailVerified": True,
                "isActive": True
            },
            {
                "firstName": "Bob",
                "lastName": "Parent",
                "email": "parent@school.com",
                "password": "parent123",
                "role": "parent",
                "phone": "+1234567893",
                "isEmailVerified": True,
                "isActive": True
            }
        ]
        
        success_count = 0
        for user_data in demo_users:
            if self.create_user(user_data):
                success_count += 1
        
        print(f"✅ Created {success_count}/{len(demo_users)} demo users")
        return success_count == len(demo_users)
    
    def list_users(self) -> List[Dict[str, Any]]:
        """
        List all users in the system.
        """
        try:
            response = self.session.get(f"{self.api_url}/users")
            if response.status_code == 200:
                return response.json().get('data', [])
            else:
                print(f"❌ Failed to fetch users: {response.text}")
                return []
        except Exception as e:
            print(f"❌ Error fetching users: {e}")
            return []
    
    def delete_user(self, user_id: str) -> bool:
        """
        Delete a user by ID.
        """
        try:
            response = self.session.delete(f"{self.api_url}/users/{user_id}")
            if response.status_code == 200:
                print(f"✅ User deleted successfully: {user_id}")
                return True
            else:
                print(f"❌ Failed to delete user: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error deleting user: {e}")
            return False
    
    def update_user(self, user_id: str, user_data: Dict[str, Any]) -> bool:
        """
        Update a user by ID.
        """
        try:
            response = self.session.put(f"{self.api_url}/users/{user_id}", json=user_data)
            if response.status_code == 200:
                print(f"✅ User updated successfully: {user_id}")
                return True
            else:
                print(f"❌ Failed to update user: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error updating user: {e}")
            return False
    
    def test_connection(self) -> bool:
        """
        Test connection to the backend.
        """
        try:
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                print("✅ Backend connection successful")
                return True
            else:
                print(f"⚠️  Backend responded with status: {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            print("❌ Cannot connect to backend. Make sure it's running on http://localhost:5000")
            return False
        except Exception as e:
            print(f"❌ Connection error: {e}")
            return False

def main():
    """Main function to run the backend updater."""
    print("🚀 School Management System - Backend Updater")
    print("=" * 50)
    
    updater = BackendUpdater()
    
    while True:
        print("\n📋 Available Actions:")
        print("1. Test backend connection")
        print("2. Update backend response structure")
        print("3. Create demo users")
        print("4. List all users")
        print("5. Create custom user")
        print("6. Update user")
        print("7. Delete user")
        print("8. Exit")
        
        choice = input("\nEnter your choice (1-8): ").strip()
        
        if choice == "1":
            updater.test_connection()
            
        elif choice == "2":
            if updater.update_auth_response_structure():
                print("✅ Backend response structure updated successfully!")
                print("🔄 Please restart your backend server for changes to take effect.")
            else:
                print("❌ Failed to update backend response structure.")
                
        elif choice == "3":
            if updater.create_demo_users():
                print("✅ Demo users created successfully!")
            else:
                print("❌ Failed to create some demo users.")
                
        elif choice == "4":
            users = updater.list_users()
            if users:
                print(f"\n👥 Found {len(users)} users:")
                for user in users:
                    print(f"  - {user.get('email', 'N/A')} ({user.get('role', 'N/A')})")
            else:
                print("📭 No users found.")
                
        elif choice == "5":
            print("\n📝 Create Custom User:")
            user_data = {}
            user_data['firstName'] = input("First Name: ").strip()
            user_data['lastName'] = input("Last Name: ").strip()
            user_data['email'] = input("Email: ").strip()
            user_data['password'] = input("Password: ").strip()
            user_data['role'] = input("Role (admin/teacher/student/parent): ").strip()
            user_data['phone'] = input("Phone (optional): ").strip()
            
            if updater.create_user(user_data):
                print("✅ Custom user created successfully!")
            else:
                print("❌ Failed to create custom user.")
                
        elif choice == "6":
            user_id = input("Enter user ID to update: ").strip()
            print("Enter new values (press Enter to skip):")
            user_data = {}
            user_data['firstName'] = input("New First Name: ").strip() or None
            user_data['lastName'] = input("New Last Name: ").strip() or None
            user_data['email'] = input("New Email: ").strip() or None
            user_data['role'] = input("New Role: ").strip() or None
            
            # Remove None values
            user_data = {k: v for k, v in user_data.items() if v is not None}
            
            if user_data:
                if updater.update_user(user_id, user_data):
                    print("✅ User updated successfully!")
                else:
                    print("❌ Failed to update user.")
            else:
                print("⚠️  No changes to update.")
                
        elif choice == "7":
            user_id = input("Enter user ID to delete: ").strip()
            confirm = input("Are you sure? (yes/no): ").strip().lower()
            if confirm == 'yes':
                if updater.delete_user(user_id):
                    print("✅ User deleted successfully!")
                else:
                    print("❌ Failed to delete user.")
            else:
                print("❌ Deletion cancelled.")
                
        elif choice == "8":
            print("👋 Goodbye!")
            break
            
        else:
            print("❌ Invalid choice. Please try again.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Script interrupted by user. Goodbye!")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)
