#!/usr/bin/env python3
"""
Quick Database Fix Script
Fixes the column name mismatch between existing database and Sequelize models.
"""

import psycopg2
import bcrypt
from datetime import datetime

def fix_database():
    # Database connection
    conn = psycopg2.connect(
        host="dpg-d2feoiruibrs739se2lg-a.singapore-postgres.render.com",
        database="app_db_321n",
        user="app_db_321n_user",
        password="CRjBloZDcIp0ohrQVxNjE0h1s0vEK9L2",
        port=5432
    )
    cur = conn.cursor()
    
    print("🔧 Fixing database structure...")
    
    try:
        # Drop existing tables completely
        print("🗑️  Dropping existing tables...")
        cur.execute("DROP TABLE IF EXISTS users CASCADE")
        cur.execute("DROP TABLE IF EXISTS courses CASCADE")
        cur.execute("DROP TABLE IF EXISTS subjects CASCADE")
        print("✅ Tables dropped")
        
        # Create users table with EXACT column names that Sequelize expects
        print("🏗️  Creating users table...")
        cur.execute("""
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "firstName" VARCHAR(50) NOT NULL,
            "lastName" VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            "dateOfBirth" DATE,
            gender VARCHAR(10),
            "profilePicture" TEXT,
            role VARCHAR(20) NOT NULL,
            "isActive" BOOLEAN DEFAULT true,
            "isEmailVerified" BOOLEAN DEFAULT true,
            "lastLogin" TIMESTAMP,
            "loginAttempts" INTEGER DEFAULT 0,
            "lockUntil" TIMESTAMP,
            address JSONB,
            "studentId" VARCHAR(20) UNIQUE,
            grade VARCHAR(10),
            section VARCHAR(10),
            "enrollmentDate" DATE,
            "graduationDate" DATE,
            department VARCHAR(50),
            specialization VARCHAR(100),
            "hireDate" DATE,
            children JSONB,
            permissions JSONB,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        print("✅ Users table created")
        
        # Create demo users
        print("👥 Creating demo users...")
        
        def hash_password(password):
            return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Admin user
        cur.execute("""
        INSERT INTO users ("firstName", "lastName", email, password, role, phone, "isEmailVerified", "isActive")
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, ("Admin", "User", "admin@school.com", hash_password("admin123"), "admin", "+1234567890", True, True))
        
        # Teacher user
        cur.execute("""
        INSERT INTO users ("firstName", "lastName", email, password, role, phone, "isEmailVerified", "isActive", department)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, ("John", "Teacher", "teacher@school.com", hash_password("teacher123"), "teacher", "+1234567891", True, True, "Mathematics"))
        
        # Student user
        cur.execute("""
        INSERT INTO users ("firstName", "lastName", email, password, role, phone, "isEmailVerified", "isActive", "studentId", grade, section, "enrollmentDate")
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, ("Alice", "Student", "student@school.com", hash_password("student123"), "student", "+1234567892", True, True, "20240001", "10", "A", datetime.now().date()))
        
        # Parent user
        cur.execute("""
        INSERT INTO users ("firstName", "lastName", email, password, role, phone, "isEmailVerified", "isActive")
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, ("Bob", "Parent", "parent@school.com", hash_password("parent123"), "parent", "+1234567893", True, True))
        
        conn.commit()
        print("✅ Demo users created successfully!")
        
        print("\n🎉 Database fixed successfully!")
        print("📋 Demo Users:")
        print("   ADMIN: admin@school.com / admin123")
        print("   TEACHER: teacher@school.com / teacher123")
        print("   STUDENT: student@school.com / student123")
        print("   PARENT: parent@school.com / parent123")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    print("🚀 Quick Database Fix")
    print("=" * 30)
    
    confirm = input("This will delete all existing data. Continue? (yes/no): ").strip().lower()
    if confirm == 'yes':
        fix_database()
    else:
        print("❌ Cancelled.")
