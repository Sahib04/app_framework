#!/usr/bin/env python3
"""
Direct Database Setup Script for School Management System
This script directly connects to PostgreSQL and creates a clean database structure.
"""

import psycopg2
import bcrypt
import uuid
from datetime import datetime
import sys

class DatabaseSetup:
    def __init__(self):
        # Database connection parameters
        self.db_config = {
            "host": "dpg-d2feoiruibrs739se2lg-a.singapore-postgres.render.com",
            "database": "app_db_321n",
            "user": "app_db_321n_user",
            "password": "CRjBloZDcIp0ohrQVxNjE0h1s0vEK9L2",
            "port": 5432
        }
        self.conn = None
        self.cur = None
    
    def connect(self):
        """Establish database connection."""
        try:
            self.conn = psycopg2.connect(**self.db_config)
            self.cur = self.conn.cursor()
            print("✅ Database connection established successfully!")
            return True
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            return False
    
    def disconnect(self):
        """Close database connection."""
        if self.cur:
            self.cur.close()
        if self.conn:
            self.conn.close()
        print("🔌 Database connection closed.")
    
    def drop_existing_tables(self):
        """Drop all existing tables to start fresh."""
        print("🗑️  Dropping existing tables...")
        
        drop_queries = [
            "DROP TABLE IF EXISTS users CASCADE",
            "DROP TABLE IF EXISTS courses CASCADE",
            "DROP TABLE IF EXISTS subjects CASCADE",
            "DROP TABLE IF EXISTS assignments CASCADE",
            "DROP TABLE IF EXISTS grades CASCADE",
            "DROP TABLE IF EXISTS attendance CASCADE",
            "DROP TABLE IF EXISTS messages CASCADE",
            "DROP TABLE IF EXISTS events CASCADE",
            "DROP TABLE IF EXISTS fees CASCADE",
            "DROP TABLE IF EXISTS students CASCADE",
            "DROP TABLE IF EXISTS teachers CASCADE",
            "DROP TABLE IF EXISTS guardians CASCADE"
        ]
        
        for query in drop_queries:
            try:
                self.cur.execute(query)
                print(f"✅ Dropped: {query.split('IF EXISTS ')[1].split(' ')[0]}")
            except Exception as e:
                print(f"⚠️  Warning dropping table: {e}")
        
        self.conn.commit()
        print("✅ All existing tables dropped successfully!")
    
    def create_new_schema(self):
        """Create new database schema with proper structure."""
        print("🏗️  Creating new database schema...")
        
        # Create users table (main authentication table)
        users_table = """
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            firstName VARCHAR(50) NOT NULL,
            lastName VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            dateOfBirth DATE,
            gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
            profilePicture TEXT,
            role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
            isActive BOOLEAN DEFAULT true,
            isEmailVerified BOOLEAN DEFAULT true,
            lastLogin TIMESTAMP,
            loginAttempts INTEGER DEFAULT 0,
            lockUntil TIMESTAMP,
            address JSONB,
            studentId VARCHAR(20) UNIQUE,
            grade VARCHAR(10),
            section VARCHAR(10),
            enrollmentDate DATE,
            graduationDate DATE,
            department VARCHAR(50),
            specialization VARCHAR(100),
            hireDate DATE,
            children JSONB,
            permissions JSONB,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        # Create subjects table
        subjects_table = """
        CREATE TABLE subjects (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL UNIQUE,
            code VARCHAR(10) NOT NULL UNIQUE,
            description TEXT,
            department VARCHAR(100) NOT NULL,
            gradeLevel VARCHAR(50) NOT NULL,
            isActive BOOLEAN DEFAULT true,
            color VARCHAR(7) DEFAULT '#3B82F6',
            icon VARCHAR(255) DEFAULT 'book',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        # Create courses table
        courses_table = """
        CREATE TABLE courses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            code VARCHAR(255) NOT NULL UNIQUE,
            title VARCHAR(200) NOT NULL,
            description TEXT NOT NULL,
            shortDescription VARCHAR(300),
            credits INTEGER NOT NULL,
            duration INTEGER NOT NULL,
            level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
            grade VARCHAR(255) NOT NULL,
            prerequisites JSONB DEFAULT '[]',
            corequisites JSONB DEFAULT '[]',
            isPrerequisiteFor JSONB DEFAULT '[]',
            subjectId UUID REFERENCES subjects(id),
            category VARCHAR(20) NOT NULL CHECK (category IN ('core', 'elective', 'honors', 'ap', 'ib', 'remedial')),
            learningObjectives JSONB DEFAULT '[]',
            syllabus JSONB DEFAULT '[]',
            textbooks JSONB DEFAULT '[]',
            resources JSONB DEFAULT '[]',
            assessmentMethods JSONB DEFAULT '[]',
            gradingPolicy JSONB DEFAULT '{"exams":40,"assignments":30,"participation":15,"projects":15}',
            passingGrade INTEGER DEFAULT 60,
            maxCapacity INTEGER NOT NULL,
            currentEnrollment INTEGER DEFAULT 0,
            waitlistCapacity INTEGER DEFAULT 10,
            academicYear VARCHAR(255) NOT NULL,
            semester VARCHAR(20) NOT NULL CHECK (semester IN ('fall', 'spring', 'summer', 'winter')),
            schedule JSONB DEFAULT '[]',
            instructorId UUID NOT NULL REFERENCES users(id),
            teachingAssistants JSONB DEFAULT '[]',
            status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'archived')),
            isPublished BOOLEAN DEFAULT false,
            enrollmentOpen BOOLEAN DEFAULT true,
            allowAudit BOOLEAN DEFAULT false,
            tuition DECIMAL(10,2) NOT NULL,
            additionalFees JSONB DEFAULT '[]',
            tags JSONB DEFAULT '[]',
            keywords JSONB DEFAULT '[]',
            featured BOOLEAN DEFAULT false,
            rating JSONB DEFAULT '{"average":0,"count":0}',
            reviews JSONB DEFAULT '[]',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        # Create assignments table
        assignments_table = """
        CREATE TABLE assignments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(200) NOT NULL,
            description TEXT NOT NULL,
            courseId UUID NOT NULL REFERENCES courses(id),
            dueDate TIMESTAMP NOT NULL,
            maxScore INTEGER NOT NULL,
            weight DECIMAL(5,2) DEFAULT 100.00,
            type VARCHAR(50) DEFAULT 'assignment',
            attachments JSONB DEFAULT '[]',
            rubric JSONB DEFAULT '[]',
            isPublished BOOLEAN DEFAULT false,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        # Create grades table
        grades_table = """
        CREATE TABLE grades (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            studentId UUID NOT NULL REFERENCES users(id),
            courseId UUID NOT NULL REFERENCES courses(id),
            assignmentId UUID REFERENCES assignments(id),
            score DECIMAL(5,2) NOT NULL,
            maxScore INTEGER NOT NULL,
            percentage DECIMAL(5,2) NOT NULL,
            letterGrade VARCHAR(2),
            comments TEXT,
            gradedBy UUID REFERENCES users(id),
            gradedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        # Create attendance table
        attendance_table = """
        CREATE TABLE attendance (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            studentId UUID NOT NULL REFERENCES users(id),
            courseId UUID NOT NULL REFERENCES courses(id),
            date DATE NOT NULL,
            status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
            notes TEXT,
            markedBy UUID REFERENCES users(id),
            markedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        # Create messages table
        messages_table = """
        CREATE TABLE messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            senderId UUID NOT NULL REFERENCES users(id),
            receiverId UUID NOT NULL REFERENCES users(id),
            subject VARCHAR(200),
            content TEXT NOT NULL,
            isRead BOOLEAN DEFAULT false,
            readAt TIMESTAMP,
            attachments JSONB DEFAULT '[]',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        # Create events table
        events_table = """
        CREATE TABLE events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(200) NOT NULL,
            description TEXT,
            startDate TIMESTAMP NOT NULL,
            endDate TIMESTAMP NOT NULL,
            location VARCHAR(200),
            organizerId UUID REFERENCES users(id),
            attendees JSONB DEFAULT '[]',
            isPublic BOOLEAN DEFAULT true,
            category VARCHAR(50),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        # Create fees table
        fees_table = """
        CREATE TABLE fees (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            studentId UUID NOT NULL REFERENCES users(id),
            feeType VARCHAR(100) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            dueDate DATE NOT NULL,
            paidAmount DECIMAL(10,2) DEFAULT 0.00,
            paidDate DATE,
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
            paymentMethod VARCHAR(50),
            receiptNumber VARCHAR(100),
            notes TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        # Execute all table creation queries
        tables = [
            ("users", users_table),
            ("subjects", subjects_table),
            ("courses", courses_table),
            ("assignments", assignments_table),
            ("grades", grades_table),
            ("attendance", attendance_table),
            ("messages", messages_table),
            ("events", events_table),
            ("fees", fees_table)
        ]
        
        for table_name, query in tables:
            try:
                self.cur.execute(query)
                print(f"✅ Created table: {table_name}")
            except Exception as e:
                print(f"❌ Error creating {table_name}: {e}")
                return False
        
        self.conn.commit()
        print("✅ All tables created successfully!")
        return True
    
    def insert_sample_data(self):
        """Insert sample subjects and courses."""
        print("📚 Inserting sample subjects and courses...")
        
        # Insert subjects
        subjects_data = [
            ("Mathematics", "MATH", "Study of numbers, quantities, shapes, and patterns", "Mathematics", "9-12", "#EF4444", "calculator"),
            ("Science", "SCI", "Study of the natural world and its phenomena", "Science", "9-12", "#10B981", "flask"),
            ("English", "ENG", "Study of language, literature, and communication", "English", "9-12", "#3B82F6", "book-open"),
            ("History", "HIST", "Study of past events and their significance", "Social Studies", "9-12", "#8B5CF6", "clock")
        ]
        
        for subject in subjects_data:
            try:
                self.cur.execute("""
                    INSERT INTO subjects (name, code, description, department, gradeLevel, color, icon)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, subject)
                print(f"✅ Created subject: {subject[0]}")
            except Exception as e:
                print(f"⚠️  Warning creating subject {subject[0]}: {e}")
        
        self.conn.commit()
        print("✅ Sample data inserted successfully!")
    
    def create_demo_users(self):
        """Create demo users with proper roles and hashed passwords."""
        print("👥 Creating demo users...")
        
        # Hash passwords
        def hash_password(password):
            return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        demo_users = [
            {
                "firstName": "Admin",
                "lastName": "User",
                "email": "admin@school.com",
                "password": hash_password("admin123"),
                "role": "admin",
                "phone": "+1234567890",
                "isEmailVerified": True,
                "isActive": True
            },
            {
                "firstName": "John",
                "lastName": "Teacher",
                "email": "teacher@school.com",
                "password": hash_password("teacher123"),
                "role": "teacher",
                "phone": "+1234567891",
                "isEmailVerified": True,
                "isActive": True,
                "department": "Mathematics",
                "specialization": "Advanced Mathematics"
            },
            {
                "firstName": "Alice",
                "lastName": "Student",
                "email": "student@school.com",
                "password": hash_password("student123"),
                "role": "student",
                "phone": "+1234567892",
                "isEmailVerified": True,
                "isActive": True,
                "studentId": "20240001",
                "grade": "10",
                "section": "A",
                "enrollmentDate": datetime.now().date()
            },
            {
                "firstName": "Bob",
                "lastName": "Parent",
                "email": "parent@school.com",
                "password": hash_password("parent123"),
                "role": "parent",
                "phone": "+1234567893",
                "isEmailVerified": True,
                "isActive": True
            }
        ]
        
        created_users = []
        for user_data in demo_users:
            try:
                # Insert user
                self.cur.execute("""
                    INSERT INTO users (
                        firstName, lastName, email, password, role, phone, 
                        isEmailVerified, isActive, department, specialization,
                        studentId, grade, section, enrollmentDate
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    ) RETURNING id, role
                """, (
                    user_data["firstName"], user_data["lastName"], user_data["email"],
                    user_data["password"], user_data["role"], user_data["phone"],
                    user_data["isEmailVerified"], user_data["isActive"],
                    user_data.get("department"), user_data.get("specialization"),
                    user_data.get("studentId"), user_data.get("grade"),
                    user_data.get("section"), user_data.get("enrollmentDate")
                ))
                
                user_id, role = self.cur.fetchone()
                created_users.append((user_id, role))
                print(f"✅ Created {role}: {user_data['email']}")
                
            except Exception as e:
                print(f"❌ Error creating user {user_data['email']}: {e}")
        
        self.conn.commit()
        print(f"✅ Created {len(created_users)} demo users successfully!")
        return created_users
    
    def create_sample_courses(self, teacher_id):
        """Create sample courses for the teacher."""
        print("📚 Creating sample courses...")
        
        # Get subject IDs
        self.cur.execute("SELECT id, code FROM subjects WHERE code IN ('MATH', 'SCI')")
        subjects = dict(self.cur.fetchall())
        
        courses_data = [
            {
                "code": "MATH101",
                "title": "Introduction to Mathematics",
                "description": "Fundamental concepts of algebra and geometry",
                "shortDescription": "Learn basic math concepts",
                "credits": 3,
                "duration": 16,
                "level": "beginner",
                "grade": "10",
                "subjectId": subjects.get("MATH"),
                "category": "core",
                "maxCapacity": 30,
                "academicYear": "2024-2025",
                "semester": "fall",
                "instructorId": teacher_id,
                "tuition": 500.00
            },
            {
                "code": "SCI101",
                "title": "Introduction to Science",
                "description": "Basic principles of physics and chemistry",
                "shortDescription": "Explore scientific concepts",
                "credits": 3,
                "duration": 16,
                "level": "beginner",
                "grade": "10",
                "subjectId": subjects.get("SCI"),
                "category": "core",
                "maxCapacity": 30,
                "academicYear": "2024-2025",
                "semester": "fall",
                "instructorId": teacher_id,
                "tuition": 500.00
            }
        ]
        
        for course_data in courses_data:
            try:
                self.cur.execute("""
                    INSERT INTO courses (
                        code, title, description, shortDescription, credits, duration,
                        level, grade, subjectId, category, maxCapacity, academicYear,
                        semester, instructorId, tuition
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                """, (
                    course_data["code"], course_data["title"], course_data["description"],
                    course_data["shortDescription"], course_data["credits"], course_data["duration"],
                    course_data["level"], course_data["grade"], course_data["subjectId"],
                    course_data["category"], course_data["maxCapacity"], course_data["academicYear"],
                    course_data["semester"], course_data["instructorId"], course_data["tuition"]
                ))
                print(f"✅ Created course: {course_data['code']} - {course_data['title']}")
            except Exception as e:
                print(f"❌ Error creating course {course_data['code']}: {e}")
        
        self.conn.commit()
        print("✅ Sample courses created successfully!")
    
    def setup_database(self):
        """Main method to set up the entire database."""
        print("🚀 Starting Database Setup...")
        print("=" * 50)
        
        try:
            # Connect to database
            if not self.connect():
                return False
            
            # Drop existing tables
            self.drop_existing_tables()
            
            # Create new schema
            if not self.create_new_schema():
                return False
            
            # Insert sample data
            self.insert_sample_data()
            
            # Create demo users
            created_users = self.create_demo_users()
            
            # Create sample courses (assign to teacher)
            teacher_id = next((uid for uid, role in created_users if role == 'teacher'), None)
            if teacher_id:
                self.create_sample_courses(teacher_id)
            
            print("\n🎉 Database setup completed successfully!")
            print("\n📋 Demo Users Created:")
            print("   ADMIN: admin@school.com / admin123")
            print("   TEACHER: teacher@school.com / teacher123")
            print("   STUDENT: student@school.com / student123")
            print("   PARENT: parent@school.com / parent123")
            
            return True
            
        except Exception as e:
            print(f"❌ Setup failed: {e}")
            return False
        finally:
            self.disconnect()

def main():
    """Main function to run the database setup."""
    print("🚀 School Management System - Direct Database Setup")
    print("=" * 60)
    
    setup = DatabaseSetup()
    
    # Confirm before proceeding
    print("⚠️  WARNING: This will DELETE ALL EXISTING DATA and create a fresh database!")
    confirm = input("Are you sure you want to continue? (yes/no): ").strip().lower()
    
    if confirm != 'yes':
        print("❌ Setup cancelled.")
        return
    
    # Run setup
    if setup.setup_database():
        print("\n✅ Database setup completed successfully!")
        print("🔄 You can now start your application and test the role-based dashboards.")
    else:
        print("\n❌ Database setup failed. Please check the error messages above.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Setup interrupted by user. Goodbye!")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)
